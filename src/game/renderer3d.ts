import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GRID_COLS, GRID_ROWS, SURFACE_ROW, rowToDepthMeters } from './constants';
import { Language, localizeCallout } from './i18n';
import { ColonyMaterials3D, createColonyMaterials3D } from './materials3d';
import {
  AnimatedRoomRig,
  ColonistRig3D,
  SharedGeometries3D,
  SurfaceBackdropRig,
  WalkerRig3D,
  buildColonistRig,
  buildRoomRig,
  buildSurfaceBackdropRig,
  buildWalkerRig,
  createSharedGeometries3D,
} from './models3d';
import { GameState, GridCell } from './types';

export interface Camera3DState {
  x: number;
  y: number;
  azimuth: number;
  elevation: number;
  distance: number;
  targetX: number;
  targetY: number;
  targetAzimuth: number;
  targetElevation: number;
  targetDistance: number;
}

export function createDefaultCamera3D(): Camera3DState {
  return {
    x: 21.5,
    y: -4.2,
    azimuth: 0.32,
    elevation: 0.22,
    distance: 13.5,
    targetX: 21.5,
    targetY: -4.2,
    targetAzimuth: 0.32,
    targetElevation: 0.22,
    targetDistance: 13.5,
  };
}

interface DebrisParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

const MAX_CELLS = GRID_COLS * GRID_ROWS;
const MAX_ORE_CHUNKS = 640;
const MAX_DEBRIS = 160;
const MAX_PRECIP = 96;
const MAX_POINT_LIGHTS = 5;

// Pre-allocated scratch math helpers (zero GC inside animation loop)
const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _color = new THREE.Color();
const _euler = new THREE.Euler();
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _hitVec = new THREE.Vector3();
const _projVec = new THREE.Vector3();
const _cutawayPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.45);
const _skyTargetColor = new THREE.Color();
const _dirColor = new THREE.Color();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function tileSeed(x: number, y: number): number {
  const n = Math.sin(x * 78.233 + y * 45.164) * 43758.5453;
  return n - Math.floor(n);
}

function getStrataHex(cell: GridCell): number {
  if (!cell.revealed && cell.material === 'water_vein') {
    return 0x3b2a1e;
  }
  switch (cell.material) {
    case 'surface':
      return 0x343d2d;
    case 'topsoil':
      return 0x453224;
    case 'clay':
      return 0x5c3e2b;
    case 'mycelium':
      return 0x2f4834;
    case 'coal_rock':
      return cell.coalDeposit ? 0x1e2229 : 0x2f353f;
    case 'limestone':
      return 0x3f4b5a;
    case 'water_vein':
      return 0x204d66;
    case 'metro_ruin':
      return 0x383240;
    case 'deep_bedrock':
      return 0x212630;
    case 'void_cavern':
      return 0x1a132c;
    case 'concrete':
      return 0x545c69;
    default:
      return 0x252a33;
  }
}

export class ColonyScene3D {
  public readonly isSoftwareGl: boolean;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;

  private readonly container: HTMLElement;
  private readonly mats: ColonyMaterials3D;
  private readonly geos: SharedGeometries3D;
  private readonly envRT: THREE.WebGLRenderTarget;

  private readonly keyLight: THREE.DirectionalLight;
  private readonly hemiLight: THREE.HemisphereLight;
  private readonly frontFillLight: THREE.DirectionalLight;
  private readonly roomLights: THREE.PointLight[] = [];

  private readonly solidMesh: THREE.InstancedMesh;
  private readonly backWallMesh: THREE.InstancedMesh;
  private readonly floorSlabMesh: THREE.InstancedMesh;
  private readonly bulbMesh: THREE.InstancedMesh;
  private readonly waterMesh: THREE.InstancedMesh;
  private readonly digBarMesh: THREE.InstancedMesh;
  private readonly unstableMesh: THREE.InstancedMesh;
  private readonly oreMesh: THREE.InstancedMesh;
  private readonly debrisMesh: THREE.InstancedMesh;
  private readonly precipMesh: THREE.InstancedMesh;

  private readonly hoverBox: THREE.LineSegments;
  private readonly selectedBox: THREE.LineSegments;
  private readonly surfaceRig: SurfaceBackdropRig;

  private readonly roomRigs = new Map<string, { sig: string; rig: AnimatedRoomRig }>();
  private readonly colonistRigs = new Map<string, ColonistRig3D>();
  private readonly walkerRigs = new Map<string, WalkerRig3D>();
  private readonly dynamicGroup = new THREE.Group();

  private readonly debrisPool: DebrisParticle[];
  private debrisCursor = 0;

  private readonly resizeObserver: ResizeObserver;
  private width = 1280;
  private height = 720;
  private disposed = false;

  // Reusable callout & depth DOM pools to avoid React re-renders
  private calloutNodes: HTMLDivElement[] = [];
  private depthNodes: HTMLDivElement[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.isSoftwareGl = detectSoftwareWebGL();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: this.isSoftwareGl,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = this.renderer.domElement;
    canvas.dataset.testid = 'colony-canvas';
    canvas.className = 'block w-full h-full cursor-crosshair touch-none';
    this.container.appendChild(canvas);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x131924);
    this.scene.fog = new THREE.FogExp2(0x131924, 0.014);

    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));

    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.3, 140);
    this.renderer.setSize(this.width, this.height, false);

    // Studio environment reflections (PMREM RoomEnvironment) on all devices
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    pmrem.dispose();

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.mats = createColonyMaterials3D(maxAniso);
    this.geos = createSharedGeometries3D();

    // Warm/cool contrast lighting rig (<= 1 shadow caster, <= 5 unshadowed room point lights)
    this.hemiLight = new THREE.HemisphereLight(0x7ca3cf, 0x2b2019, 0.78);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xffdfba, 1.55);
    this.keyLight.position.set(28, 12, 20);
    this.keyLight.castShadow = !this.isSoftwareGl;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.camera.near = 2;
    this.keyLight.shadow.camera.far = 75;
    this.keyLight.shadow.camera.left = -22;
    this.keyLight.shadow.camera.right = 22;
    this.keyLight.shadow.camera.top = 20;
    this.keyLight.shadow.camera.bottom = -20;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);
    this.scene.add(this.keyLight.target);

    this.frontFillLight = new THREE.DirectionalLight(0xa5bedb, 0.45);
    this.frontFillLight.position.set(-14, 4, 24);
    this.scene.add(this.frontFillLight);

    for (let i = 0; i < MAX_POINT_LIGHTS; i++) {
      const pl = new THREE.PointLight(0xffb454, 0, 5.5, 1.8);
      this.scene.add(pl);
      this.roomLights.push(pl);
    }

    // Surface backdrop (buildings, street, hatch collar, CCTV mast)
    this.surfaceRig = buildSurfaceBackdropRig(this.mats, this.geos);
    this.scene.add(this.surfaceRig.group);

    // Instanced terrain & interior geometry
    const makeInst = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      count: number,
      castShadow: boolean,
      receiveShadow: boolean
    ) => {
      const m = new THREE.InstancedMesh(geo, mat, count);
      m.count = 0;
      m.castShadow = castShadow;
      m.receiveShadow = receiveShadow;
      m.frustumCulled = false;
      this.scene.add(m);
      return m;
    };

    this.solidMesh = makeInst(this.geos.box, this.mats.strataRock, MAX_CELLS, true, true);
    this.backWallMesh = makeInst(
      this.geos.box,
      this.mats.interiorBackWall,
      MAX_CELLS,
      false,
      true
    );
    this.floorSlabMesh = makeInst(this.geos.box, this.mats.floorTimber, MAX_CELLS, false, true);
    this.bulbMesh = makeInst(this.geos.sphere, this.mats.tungstenBulbOn, MAX_CELLS, false, false);
    this.waterMesh = makeInst(this.geos.box, this.mats.waterSurface, MAX_CELLS, false, false);
    this.digBarMesh = makeInst(this.geos.box, this.mats.amberWire, MAX_CELLS, false, false);
    this.unstableMesh = makeInst(this.geos.box, this.mats.crimsonWire, MAX_CELLS, false, false);
    this.oreMesh = makeInst(this.geos.box, this.mats.particleDebris, MAX_ORE_CHUNKS, false, false);
    this.debrisMesh = makeInst(this.geos.box, this.mats.particleDebris, MAX_DEBRIS, false, false);
    this.precipMesh = makeInst(this.geos.box, this.mats.precipitation, MAX_PRECIP, false, false);

    // Subtle cutaway edge boxes for hover & selection
    const wireGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.02, 1.02, 1.14));
    this.hoverBox = new THREE.LineSegments(wireGeo, this.mats.hoverWire);
    this.hoverBox.visible = false;
    this.scene.add(this.hoverBox);

    const selGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.05, 1.05, 1.18));
    this.selectedBox = new THREE.LineSegments(
      selGeo,
      new THREE.LineBasicMaterial({ color: 0x38bdf8 })
    );
    this.selectedBox.visible = false;
    this.scene.add(this.selectedBox);

    this.scene.add(this.dynamicGroup);

    this.debrisPool = Array.from({ length: MAX_DEBRIS }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      size: 0.08,
      life: 0,
      maxLife: 0.6,
      color: new THREE.Color(0xd4a373),
    }));

    // Pre-warm shaders once on hardware GPUs (skip on SwiftShader/software WebGL)
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
  }

  public handleResize() {
    if (this.disposed) return;
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (w !== this.width || h !== this.height) {
      this.width = w;
      this.height = h;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
    }
  }

  public spawnBurst(gx: number, gy: number, count: number, colorHex: number) {
    const cx = gx + 0.5;
    const cy = -(gy + 0.5);
    for (let i = 0; i < count; i++) {
      const p = this.debrisPool[this.debrisCursor];
      this.debrisCursor = (this.debrisCursor + 1) % MAX_DEBRIS;
      p.active = true;
      p.x = cx + (Math.random() - 0.5) * 0.6;
      p.y = cy + (Math.random() - 0.5) * 0.4;
      p.z = 0.25 + Math.random() * 0.35;
      p.vx = (Math.random() - 0.5) * 3.4;
      p.vy = 1.2 + Math.random() * 2.8;
      p.vz = 0.6 + Math.random() * 1.8;
      p.size = 0.05 + Math.random() * 0.06;
      p.life = 0.45 + Math.random() * 0.3;
      p.maxLife = p.life;
      p.color.setHex(colorHex);
    }
  }

  public screenToGrid(clientX: number, clientY: number): { gx: number; gy: number } {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { gx: -1, gy: -1 };
    _ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    _raycaster.setFromCamera(_ndc, this.camera);
    const hit = _raycaster.ray.intersectPlane(_cutawayPlane, _hitVec);
    if (!hit) return { gx: -1, gy: -1 };
    return {
      gx: Math.floor(_hitVec.x),
      gy: Math.floor(-_hitVec.y),
    };
  }

  public afterDraw(cb: () => void): number {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      return window.setTimeout(cb, 80);
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const status = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
      if (status === gl.UNSIGNALED) {
        window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        window.setTimeout(cb, 80);
      }
    };
    return window.setTimeout(poll, 5);
  }

  public renderFrame(
    state: GameState,
    cam: Camera3DState,
    hoverCell: { gx: number; gy: number } | null,
    elapsedSec: number,
    dt: number,
    lang: Language,
    calloutContainer: HTMLElement | null,
    depthContainer: HTMLElement | null
  ) {
    if (this.disposed) return;

    // 1. Update camera spherical orbit + trauma shake
    const cosEl = Math.cos(cam.elevation);
    const sinEl = Math.sin(cam.elevation);
    const sinAz = Math.sin(cam.azimuth);
    const cosAz = Math.cos(cam.azimuth);
    const shakeMag = state.cameraShake * state.cameraShake * 0.25;
    const sx = shakeMag > 0.005 ? (Math.random() - 0.5) * shakeMag : 0;
    const sy = shakeMag > 0.005 ? (Math.random() - 0.5) * shakeMag : 0;

    this.camera.position.set(
      cam.x + sx + cam.distance * cosEl * sinAz,
      cam.y + sy + cam.distance * sinEl,
      cam.distance * cosEl * cosAz
    );
    this.camera.lookAt(cam.x + sx * 0.4, cam.y + sy * 0.4, 0);
    this.camera.updateMatrixWorld();

    // 2. Dynamic sky, fog & surface weather
    const isNight = state.timeOfDay < 6 || state.timeOfDay >= 20;
    const dusk = Math.sin((state.timeOfDay / 24) * Math.PI);
    if (state.weather === 'snow') {
      _skyTargetColor.setHex(isNight ? 0x161c28 : 0x627084);
      _dirColor.setHex(isNight ? 0x94a3b8 : 0xe2e8f0);
      this.keyLight.intensity = isNight ? 0.65 : 1.35;
    } else if (isNight) {
      _skyTargetColor.setHex(0x0b1019);
      _dirColor.setHex(0x7c9bc4);
      this.keyLight.intensity = 0.58;
    } else {
      _skyTargetColor.setHex(dusk > 0.45 ? 0x263445 : 0x3b2c27);
      _dirColor.setHex(dusk > 0.45 ? 0xffdfb8 : 0xffaa6e);
      this.keyLight.intensity = dusk > 0.45 ? 1.55 : 1.25;
    }
    (this.scene.background as THREE.Color).lerp(_skyTargetColor, 0.12);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(this.scene.background as THREE.Color);
    }
    this.keyLight.color.lerp(_dirColor, 0.12);
    this.keyLight.position.set(cam.x + 12, cam.y + 18, 22);
    this.keyLight.target.position.set(cam.x, cam.y, 0);
    this.keyLight.target.updateMatrixWorld();

    // Surface snow/grass plates & CCTV scanner
    const plateMat = state.weather === 'snow' ? this.mats.snowCrust : this.mats.grassCrust;
    for (let i = 0; i < this.surfaceRig.groundPlates.length; i++) {
      this.surfaceRig.groundPlates[i].material = plateMat;
    }
    this.surfaceRig.cctvHead.rotation.y = Math.sin(elapsedSec * 1.1) * 0.45;

    // 3. Rebuild grid InstancedMeshes & collect candidate lit chambers
    this.syncGridInstances(state, elapsedSec);

    // 4. Sync 3D rooms, colonists, and walkers
    this.syncRoomRigs(state, elapsedSec, dt);
    this.syncColonistRigs(state, elapsedSec);
    this.syncWalkerRigs(state, elapsedSec);

    // 5. Update pooled 3D debris particles & weather precipitation
    this.syncDebrisAndWeather(state, elapsedSec, dt);

    // 6. Update Hover & Selection 3D wireframes
    if (
      hoverCell &&
      hoverCell.gx >= 0 &&
      hoverCell.gx < GRID_COLS &&
      hoverCell.gy > SURFACE_ROW &&
      hoverCell.gy < GRID_ROWS &&
      state.phase === 'PLAYING'
    ) {
      this.hoverBox.visible = true;
      this.hoverBox.position.set(hoverCell.gx + 0.5, -(hoverCell.gy + 0.5), 0);
    } else {
      this.hoverBox.visible = false;
    }

    if (state.selectedCell && state.phase === 'PLAYING') {
      this.selectedBox.visible = true;
      this.selectedBox.position.set(
        state.selectedCell.x + 0.5,
        -(state.selectedCell.y + 0.5),
        0
      );
    } else {
      this.selectedBox.visible = false;
    }

    // 7. Render WebGL frame
    this.renderer.render(this.scene, this.camera);

    // 8. Project callouts & depth ruler into sibling overlay DOM without React state
    this.syncOverlayDom(state, cam, lang, calloutContainer, depthContainer);
  }

  private syncGridInstances(state: GameState, elapsedSec: number) {
    let solidIdx = 0;
    let backIdx = 0;
    let floorIdx = 0;
    let bulbIdx = 0;
    let waterIdx = 0;
    let digIdx = 0;
    let unstableIdx = 0;
    let oreIdx = 0;

    // Track up to 5 closest lit cells to camera center for warm interior PointLights
    const bestLights: Array<{ distSq: number; wx: number; wy: number }> = [];
    const camX = this.camera.position.x;
    const camY = this.camera.position.y;

    for (let y = SURFACE_ROW; y < GRID_ROWS; y++) {
      const row = state.grid[y];
      const wy = -(y + 0.5);
      for (let x = 0; x < GRID_COLS; x++) {
        const cell = row[x];
        const wx = x + 0.5;

        if (!cell.dug || !cell.revealed) {
          const seed = tileSeed(x, y);
          const zJitter =
            cell.material === 'concrete' || !cell.dug ? (seed - 0.5) * 0.14 : 0;
          const depthScale = cell.material === 'concrete' ? 1.08 : 1.04 + seed * 0.14;
          _pos.set(wx, wy, -0.06 + zJitter);
          _quat.identity();
          _scale.set(0.996, 0.996, depthScale);
          _mat4.compose(_pos, _quat, _scale);
          this.solidMesh.setMatrixAt(solidIdx, _mat4);

          if (!cell.revealed) {
            _color.setHex(cell.dug ? 0x0b0e14 : getStrataHex(cell)).multiplyScalar(0.32);
          } else {
            _color.setHex(getStrataHex(cell));
            // Subtle per-block tone variation
            _color.offsetHSL(0, 0, (seed - 0.5) * 0.035);
          }
          this.solidMesh.setColorAt(solidIdx, _color);
          solidIdx++;

          // Exposed mineral vein inlays on front cutaway face
          if (cell.revealed && !cell.dug && oreIdx < MAX_ORE_CHUNKS) {
            if (cell.coalDeposit) {
              _pos.set(wx + (seed - 0.5) * 0.35, wy + (seed - 0.5) * 0.25, 0.5);
              _scale.set(0.34, 0.22, 0.08);
              _mat4.compose(_pos, _quat, _scale);
              this.oreMesh.setMatrixAt(oreIdx, _mat4);
              _color.setHex(0x0b0d11);
              this.oreMesh.setColorAt(oreIdx, _color);
              oreIdx++;
            } else if (cell.material === 'mycelium') {
              _pos.set(wx, wy - 0.22, 0.5);
              _scale.set(0.45, 0.16, 0.08);
              _mat4.compose(_pos, _quat, _scale);
              this.oreMesh.setMatrixAt(oreIdx, _mat4);
              _color.setHex(0x4ade80);
              this.oreMesh.setColorAt(oreIdx, _color);
              oreIdx++;
            } else if (cell.material === 'water_vein') {
              _pos.set(wx, wy, 0.5);
              _scale.set(0.75, 0.18, 0.08);
              _mat4.compose(_pos, _quat, _scale);
              this.oreMesh.setMatrixAt(oreIdx, _mat4);
              _color.setHex(0x38bdf8);
              this.oreMesh.setColorAt(oreIdx, _color);
              oreIdx++;
            }
          }

          // Dig mark & progress indicator
          if (!cell.dug && cell.markedForDig) {
            const prog = Math.max(0.15, cell.digProgress);
            _pos.set(wx - (1 - prog) * 0.42, wy - 0.42, 0.53);
            _scale.set(0.84 * prog, 0.1, 0.06);
            _mat4.compose(_pos, _quat, _scale);
            this.digBarMesh.setMatrixAt(digIdx, _mat4);
            digIdx++;
          }
        } else {
          // Dug & revealed chamber: back wall + floor slab
          _pos.set(wx, wy, -0.62);
          _quat.identity();
          _scale.set(1.0, 1.0, 0.24);
          _mat4.compose(_pos, _quat, _scale);
          this.backWallMesh.setMatrixAt(backIdx, _mat4);

          const isLit = cell.lit && !state.blackout;
          if (cell.material === 'concrete') {
            _color.setHex(isLit ? 0x5d6776 : 0x262c36);
          } else {
            _color.setHex(isLit ? 0x4c4033 : 0x1b2029);
          }
          this.backWallMesh.setColorAt(backIdx, _color);
          backIdx++;

          // Floor slab (offset flush at bottom of cell)
          _pos.set(wx, wy - 0.46, -0.02);
          _scale.set(1.0, 0.08, 1.04);
          _mat4.compose(_pos, _quat, _scale);
          this.floorSlabMesh.setMatrixAt(floorIdx, _mat4);
          _color.setHex(cell.material === 'concrete' ? 0x707b8a : 0x8b6b4a);
          this.floorSlabMesh.setColorAt(floorIdx, _color);
          floorIdx++;

          if (isLit) {
            _pos.set(wx, wy + 0.43, -0.08);
            _scale.set(0.14, 0.09, 0.14);
            _mat4.compose(_pos, _quat, _scale);
            this.bulbMesh.setMatrixAt(bulbIdx, _mat4);
            bulbIdx++;

            const dx = wx - camX;
            const dy = wy - camY;
            const distSq = dx * dx + dy * dy;
            bestLights.push({ distSq, wx, wy });
          }

          if (cell.waterLevel > 0.02) {
            const wh = Math.min(1, cell.waterLevel) * 0.88;
            _pos.set(wx, wy - 0.42 + wh * 0.5, -0.02);
            _scale.set(0.98, wh, 0.96);
            _mat4.compose(_pos, _quat, _scale);
            this.waterMesh.setMatrixAt(waterIdx, _mat4);
            waterIdx++;
          }

          if (cell.unstable) {
            const pulse = 0.75 + 0.25 * Math.sin(elapsedSec * 5.5);
            _pos.set(wx, wy + 0.43, 0.48);
            _scale.set(0.94 * pulse, 0.08, 0.08);
            _mat4.compose(_pos, _quat, _scale);
            this.unstableMesh.setMatrixAt(unstableIdx, _mat4);
            unstableIdx++;
          }
        }
      }
    }

    this.solidMesh.count = solidIdx;
    this.solidMesh.instanceMatrix.needsUpdate = true;
    if (this.solidMesh.instanceColor) this.solidMesh.instanceColor.needsUpdate = true;

    this.backWallMesh.count = backIdx;
    this.backWallMesh.instanceMatrix.needsUpdate = true;
    if (this.backWallMesh.instanceColor) this.backWallMesh.instanceColor.needsUpdate = true;

    this.floorSlabMesh.count = floorIdx;
    this.floorSlabMesh.instanceMatrix.needsUpdate = true;
    if (this.floorSlabMesh.instanceColor) this.floorSlabMesh.instanceColor.needsUpdate = true;

    this.bulbMesh.count = bulbIdx;
    this.bulbMesh.instanceMatrix.needsUpdate = true;

    this.waterMesh.count = waterIdx;
    this.waterMesh.instanceMatrix.needsUpdate = true;

    this.digBarMesh.count = digIdx;
    this.digBarMesh.instanceMatrix.needsUpdate = true;

    this.unstableMesh.count = unstableIdx;
    this.unstableMesh.instanceMatrix.needsUpdate = true;

    this.oreMesh.count = oreIdx;
    this.oreMesh.instanceMatrix.needsUpdate = true;
    if (this.oreMesh.instanceColor) this.oreMesh.instanceColor.needsUpdate = true;

    // Position the 5 closest warm tungsten PointLights
    bestLights.sort((a, b) => a.distSq - b.distSq);
    for (let i = 0; i < MAX_POINT_LIGHTS; i++) {
      const pl = this.roomLights[i];
      if (i < bestLights.length && !state.blackout) {
        pl.position.set(bestLights[i].wx, bestLights[i].wy + 0.25, 0.35);
        pl.intensity = 2.1;
      } else {
        pl.intensity = 0;
      }
    }
  }

  private syncRoomRigs(state: GameState, elapsedSec: number, dt: number) {
    const activeKeys = new Set<string>();

    for (let y = SURFACE_ROW; y < GRID_ROWS; y++) {
      const row = state.grid[y];
      for (let x = 0; x < GRID_COLS; x++) {
        const cell = row[x];
        if (!cell.dug || !cell.revealed) continue;
        if (cell.room === 'none' && !cell.hasLadder && !cell.hasSupport) continue;

        const key = `${x},${y}`;
        activeKeys.add(key);
        const sig = `${cell.room}|${cell.hasLadder ? 1 : 0}|${cell.hasSupport ? 1 : 0}`;
        let entry = this.roomRigs.get(key);

        if (!entry || entry.sig !== sig) {
          if (entry) {
            this.dynamicGroup.remove(entry.rig.group);
          }
          const rig = buildRoomRig(
            cell.room,
            cell.hasLadder,
            cell.hasSupport,
            cell.doorClosed,
            this.mats,
            this.geos
          );
          rig.group.position.set(x + 0.5, -(y + 0.5), 0);
          this.dynamicGroup.add(rig.group);
          entry = { sig, rig };
          this.roomRigs.set(key, entry);
        }

        const { rig } = entry;
        if (rig.rotor) {
          rig.rotor.rotation.z -= dt * (state.blackout ? 0.4 : 4.2);
        }
        if (rig.wheelA && rig.wheelB) {
          const pedalSpin = dt * (state.blackout ? 0.5 : 5.2);
          rig.wheelA.rotation.z -= pedalSpin;
          rig.wheelB.rotation.z -= pedalSpin;
        }
        if (rig.pumpArm) {
          rig.pumpArm.rotation.z = Math.sin(elapsedSec * 2.4 + x) * 0.25;
        }
        if (rig.doorPanel) {
          const targetY = cell.doorClosed ? -0.02 : 0.34;
          rig.doorPanel.position.y = THREE.MathUtils.damp(
            rig.doorPanel.position.y,
            targetY,
            10,
            dt
          );
        }
        if (rig.statusLamp) {
          rig.statusLamp.material = cell.doorClosed
            ? this.mats.redCross
            : this.mats.mushroomCap;
        }
      }
    }

    for (const [key, entry] of this.roomRigs) {
      if (!activeKeys.has(key)) {
        this.dynamicGroup.remove(entry.rig.group);
        this.roomRigs.delete(key);
      }
    }
  }

  private syncColonistRigs(state: GameState, elapsedSec: number) {
    const aliveIds = new Set<string>();

    for (let i = 0; i < state.colonists.length; i++) {
      const col = state.colonists[i];
      if (!col.alive || col.task === 'scouting') continue;
      aliveIds.add(col.id);

      let rig = this.colonistRigs.get(col.id);
      if (!rig) {
        rig = buildColonistRig(col, this.mats, this.geos);
        this.dynamicGroup.add(rig.group);
        this.colonistRigs.set(col.id, rig);
      }

      const wx = col.x + 0.5;
      const wy = -(col.y + 0.5) - 0.42;
      const laneJitter = ((i % 3) - 1) * 0.1;
      const bob = Math.abs(Math.sin(col.walkPhase)) * 0.04;
      rig.group.position.set(wx, wy + bob, 0.14 + laneJitter);
      rig.group.rotation.y = col.facing >= 0 ? Math.PI * 0.42 : -Math.PI * 0.42;

      const stride = col.task === 'walking' ? Math.sin(col.walkPhase) * 0.55 : 0;
      rig.legL.rotation.x = stride;
      rig.legR.rotation.x = -stride;
      rig.armL.rotation.x = -stride * 0.7;

      if (col.task === 'digging') {
        rig.pickaxe.visible = true;
        rig.armR.rotation.x = -0.7 + Math.sin(elapsedSec * 12 + i) * 0.75;
      } else {
        rig.pickaxe.visible = false;
        rig.armR.rotation.x = stride * 0.7;
      }

      if (rig.headlamp) {
        rig.headlamp.material = state.blackout
          ? this.mats.tungstenBulbOff
          : this.mats.tungstenBulbOn;
      }
    }

    for (const [id, rig] of this.colonistRigs) {
      if (!aliveIds.has(id)) {
        this.dynamicGroup.remove(rig.group);
        rig.torsoMat.dispose();
        rig.hatMat.dispose();
        this.colonistRigs.delete(id);
      }
    }
  }

  private syncWalkerRigs(state: GameState, elapsedSec: number) {
    const activeIds = new Set<string>();

    for (let i = 0; i < state.walkers.length; i++) {
      const w = state.walkers[i];
      if (!w.active) continue;
      activeIds.add(w.id);

      let rig = this.walkerRigs.get(w.id);
      if (!rig) {
        rig = buildWalkerRig(this.mats, this.geos);
        this.dynamicGroup.add(rig.group);
        this.walkerRigs.set(w.id, rig);
      }

      const wx = w.x + 0.5;
      const wy = w.zone === 'surface' ? -SURFACE_ROW + 0.02 : -(w.y + 0.5) - 0.42;
      const wz = w.zone === 'surface' ? -0.45 + ((i % 3) - 1) * 0.25 : 0.16;
      const shamble = Math.sin(elapsedSec * 4.5 + i * 1.7);

      rig.group.position.set(wx, wy + Math.abs(shamble) * 0.03, wz);
      rig.group.rotation.y = w.vx >= 0 ? Math.PI * 0.48 : -Math.PI * 0.48;
      rig.legL.rotation.x = shamble * 0.45;
      rig.legR.rotation.x = -shamble * 0.45;
      rig.armL.rotation.x = -0.25 + Math.cos(elapsedSec * 3.5 + i) * 0.15;
      rig.armR.rotation.x = -0.35 - Math.cos(elapsedSec * 3.5 + i) * 0.15;
    }

    for (const [id, rig] of this.walkerRigs) {
      if (!activeIds.has(id)) {
        this.dynamicGroup.remove(rig.group);
        this.walkerRigs.delete(id);
      }
    }
  }

  private syncDebrisAndWeather(state: GameState, elapsedSec: number, dt: number) {
    let debIdx = 0;
    for (let i = 0; i < MAX_DEBRIS; i++) {
      const p = this.debrisPool[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.vy -= 9.5 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      const s = p.size * Math.max(0.2, p.life / p.maxLife);
      _pos.set(p.x, p.y, p.z);
      _euler.set(p.life * 6, p.life * 4, 0);
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);
      this.debrisMesh.setMatrixAt(debIdx, _mat4);
      this.debrisMesh.setColorAt(debIdx, p.color);
      debIdx++;
    }
    this.debrisMesh.count = debIdx;
    this.debrisMesh.instanceMatrix.needsUpdate = true;
    if (this.debrisMesh.instanceColor) this.debrisMesh.instanceColor.needsUpdate = true;

    // Weather precipitation above surface
    let precipIdx = 0;
    if (state.weather === 'rain' || state.weather === 'snow') {
      const isSnow = state.weather === 'snow';
      const fallSpeed = isSnow ? 1.4 : 6.5;
      const drift = isSnow ? 0.65 : 1.5;
      for (let i = 0; i < MAX_PRECIP; i++) {
        const rx = ((i * 2.73 + elapsedSec * drift) % GRID_COLS);
        const ry = -SURFACE_ROW + 7.5 - ((i * 1.37 + elapsedSec * fallSpeed) % 8.0);
        const rz = -3.8 + (i % 7) * 0.72;
        _pos.set(rx, ry, rz);
        _quat.identity();
        _scale.set(isSnow ? 0.08 : 0.025, isSnow ? 0.08 : 0.28, isSnow ? 0.08 : 0.025);
        _mat4.compose(_pos, _quat, _scale);
        this.precipMesh.setMatrixAt(precipIdx, _mat4);
        precipIdx++;
      }
    }
    this.precipMesh.count = precipIdx;
    this.precipMesh.instanceMatrix.needsUpdate = true;
  }

  private syncOverlayDom(
    state: GameState,
    cam: Camera3DState,
    lang: Language,
    calloutContainer: HTMLElement | null,
    depthContainer: HTMLElement | null
  ) {
    // Project floating callouts with v.z in [-1, 1] guard
    if (calloutContainer) {
      const callouts = state.floatingCallouts;
      while (this.calloutNodes.length < callouts.length) {
        const el = document.createElement('div');
        el.className =
          'absolute top-0 left-0 px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap bg-[#0b0d11]/85 border border-[#2a303a] pointer-events-none shadow';
        calloutContainer.appendChild(el);
        this.calloutNodes.push(el);
      }

      for (let i = 0; i < this.calloutNodes.length; i++) {
        const el = this.calloutNodes[i];
        if (i >= callouts.length) {
          el.style.display = 'none';
          continue;
        }
        const fc = callouts[i];
        _projVec.set(fc.x + 0.5, -(fc.y + 0.5), 0.65);
        _projVec.project(this.camera);
        if (_projVec.z < -1 || _projVec.z > 1) {
          el.style.display = 'none';
          continue;
        }
        const sx = (_projVec.x * 0.5 + 0.5) * this.width;
        const sy = (-_projVec.y * 0.5 + 0.5) * this.height;
        const alpha = Math.min(1, fc.life / (fc.maxLife * 0.4));
        el.style.display = 'block';
        el.style.opacity = alpha.toFixed(2);
        el.style.color = fc.color;
        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
        el.textContent = localizeCallout(fc.text, lang);
      }
    }

    // Project 0m..-128m architectural depth ticks onto the left edge ruler (hidden on Title)
    if (depthContainer) {
      if (state.phase === 'TITLE') {
        depthContainer.style.display = 'none';
        return;
      }
      depthContainer.style.display = 'block';
      const rows: number[] = [];
      for (let r = SURFACE_ROW; r < GRID_ROWS; r += 3) rows.push(r);
      while (this.depthNodes.length < rows.length) {
        const el = document.createElement('div');
        el.className =
          'absolute left-0 w-11 pr-1.5 text-right font-mono-tab text-[10px] font-semibold pointer-events-none border-r border-[#d8d2c5]/20';
        depthContainer.appendChild(el);
        this.depthNodes.push(el);
      }

      for (let i = 0; i < this.depthNodes.length; i++) {
        const el = this.depthNodes[i];
        if (i >= rows.length) {
          el.style.display = 'none';
          continue;
        }
        const row = rows[i];
        _projVec.set(cam.x, -row, 0.45);
        _projVec.project(this.camera);
        if (_projVec.z < -1 || _projVec.z > 1) {
          el.style.display = 'none';
          continue;
        }
        const sy = (-_projVec.y * 0.5 + 0.5) * this.height;
        if (sy < 68 || sy > this.height - 84) {
          el.style.display = 'none';
          continue;
        }
        const meters = rowToDepthMeters(row);
        el.style.display = 'block';
        el.style.color = meters >= 80 ? '#f87171' : meters >= 50 ? '#38bdf8' : '#94a3b8';
        el.style.transform = `translate3d(0, ${(sy - 7).toFixed(1)}px, 0)`;
        el.textContent = meters === 0 ? '0m' : `-${meters}m`;
      }
    }
  }

  public dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObserver.disconnect();

    for (const [, rig] of this.colonistRigs) {
      rig.torsoMat.dispose();
      rig.hatMat.dispose();
    }
    this.colonistRigs.clear();
    this.walkerRigs.clear();
    this.roomRigs.clear();

    this.hoverBox.geometry.dispose();
    this.selectedBox.geometry.dispose();
    if (this.selectedBox.material instanceof THREE.Material) {
      this.selectedBox.material.dispose();
    }

    this.geos.dispose();
    this.mats.dispose();
    this.envRT.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
