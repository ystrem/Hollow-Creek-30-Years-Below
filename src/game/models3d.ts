import * as THREE from 'three';
import { GRID_COLS, SURFACE_ROW } from './constants';
import { ColonyMaterials3D } from './materials3d';
import { Colonist, RoomType } from './types';

export interface AnimatedRoomRig {
  group: THREE.Group;
  rotor?: THREE.Object3D;
  wheelA?: THREE.Object3D;
  wheelB?: THREE.Object3D;
  doorPanel?: THREE.Object3D;
  statusLamp?: THREE.Mesh;
  pumpArm?: THREE.Object3D;
}

export interface ColonistRig3D {
  group: THREE.Group;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  pickaxe: THREE.Object3D;
  headlamp?: THREE.Mesh;
  torsoMat: THREE.MeshStandardMaterial;
  hatMat: THREE.MeshStandardMaterial;
}

export interface WalkerRig3D {
  group: THREE.Group;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
}

export interface SurfaceBackdropRig {
  group: THREE.Group;
  cctvHead: THREE.Object3D;
  groundPlates: THREE.Mesh[];
}

// Shared reusable geometries (disposed on scene teardown)
export interface SharedGeometries3D {
  box: THREE.BoxGeometry;
  cyl: THREE.CylinderGeometry;
  sphere: THREE.SphereGeometry;
  cone: THREE.ConeGeometry;
  torus: THREE.TorusGeometry;
  shadowDisc: THREE.CircleGeometry;
  dispose: () => void;
}

export function createSharedGeometries3D(): SharedGeometries3D {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 14);
  const sphere = new THREE.SphereGeometry(0.5, 12, 10);
  const cone = new THREE.ConeGeometry(0.5, 1, 14);
  const torus = new THREE.TorusGeometry(0.5, 0.12, 8, 18);
  const shadowDisc = new THREE.CircleGeometry(0.28, 16);
  shadowDisc.rotateX(-Math.PI / 2);
  return {
    box,
    cyl,
    sphere,
    cone,
    torus,
    shadowDisc,
    dispose: () => {
      box.dispose();
      cyl.dispose();
      sphere.dispose();
      cone.dispose();
      torus.dispose();
      shadowDisc.dispose();
    },
  };
}

function addPart(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos: [number, number, number],
  scale: [number, number, number],
  rot: [number, number, number] = [0, 0, 0],
  castShadow = true
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  if (rot[0] !== 0 || rot[1] !== 0 || rot[2] !== 0) {
    m.rotation.set(rot[0], rot[1], rot[2]);
  }
  m.castShadow = castShadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

/**
 * Builds composite 3-12 part 3D models for every room/structure type.
 * Local origin is cell center (0,0,0), with floor surface at y = -0.44 and ceiling at y = +0.46.
 */
export function buildRoomRig(
  room: RoomType,
  hasLadder: boolean,
  hasSupport: boolean,
  doorClosed: boolean,
  mats: ColonyMaterials3D,
  geos: SharedGeometries3D
): AnimatedRoomRig {
  const group = new THREE.Group();
  const rig: AnimatedRoomRig = { group };
  const floorY = -0.44;

  // 1. Timber Support Prop (4 distinct parts: 2 posts, top header, 2 angled knee braces)
  if (hasSupport && room !== 'door') {
    addPart(group, geos.box, mats.timberDark, [-0.41, 0.0, 0.25], [0.09, 0.88, 0.14]);
    addPart(group, geos.box, mats.timberDark, [0.41, 0.0, 0.25], [0.09, 0.88, 0.14]);
    addPart(group, geos.box, mats.timber, [0, 0.41, 0.25], [0.94, 0.09, 0.18]);
    addPart(group, geos.box, mats.timber, [-0.31, 0.3, 0.25], [0.07, 0.24, 0.1], [0, 0, -Math.PI / 4]);
    addPart(group, geos.box, mats.timber, [0.31, 0.3, 0.25], [0.07, 0.24, 0.1], [0, 0, Math.PI / 4]);
    addPart(group, geos.box, mats.darkSteel, [-0.41, 0.41, 0.27], [0.11, 0.11, 0.2]);
    addPart(group, geos.box, mats.darkSteel, [0.41, 0.41, 0.27], [0.11, 0.11, 0.2]);
  }

  // 2. Ladder Shaft (2 rails + 5 rungs + wall brackets)
  if (hasLadder) {
    addPart(group, geos.cyl, mats.timber, [-0.14, 0.0, -0.32], [0.05, 1.0, 0.05]);
    addPart(group, geos.cyl, mats.timber, [0.14, 0.0, -0.32], [0.05, 1.0, 0.05]);
    for (let r = -0.36; r <= 0.38; r += 0.18) {
      addPart(group, geos.cyl, mats.timberDark, [0, r, -0.32], [0.04, 0.3, 0.04], [0, 0, Math.PI / 2]);
    }
    addPart(group, geos.box, mats.darkSteel, [-0.14, 0.25, -0.44], [0.05, 0.05, 0.22]);
    addPart(group, geos.box, mats.darkSteel, [0.14, 0.25, -0.44], [0.05, 0.05, 0.22]);
  }

  switch (room) {
    case 'hatch': {
      // Concrete bunker collar + twin steel blast doors + hazard stripes + wheel lock
      addPart(group, geos.box, mats.concreteWall, [0, 0.46, 0], [0.98, 0.14, 0.96]);
      addPart(group, geos.box, mats.darkSteel, [-0.22, 0.49, 0], [0.44, 0.08, 0.72]);
      addPart(group, geos.box, mats.darkSteel, [0.22, 0.49, 0], [0.44, 0.08, 0.72]);
      addPart(group, geos.box, mats.hazardYellow, [-0.36, 0.44, 0.44], [0.2, 0.07, 0.06]);
      addPart(group, geos.box, mats.hazardYellow, [0.36, 0.44, 0.44], [0.2, 0.07, 0.06]);
      addPart(group, geos.torus, mats.brushedSteel, [0, 0.55, 0.05], [0.16, 0.16, 0.16], [Math.PI / 2, 0, 0]);
      break;
    }

    case 'bunk': {
      // Twin-tier steel bunk bed: 4 posts, 2 frames, 2 mattresses, 2 blankets, pillow, side ladder
      for (const px of [-0.34, 0.34]) {
        for (const pz of [-0.34, -0.02]) {
          addPart(group, geos.cyl, mats.darkSteel, [px, floorY + 0.34, pz], [0.04, 0.68, 0.04]);
        }
      }
      addPart(group, geos.box, mats.darkSteel, [0, floorY + 0.14, -0.18], [0.7, 0.04, 0.34]);
      addPart(group, geos.box, mats.darkSteel, [0, floorY + 0.48, -0.18], [0.7, 0.04, 0.34]);
      addPart(group, geos.box, mats.mattress, [0, floorY + 0.19, -0.18], [0.64, 0.07, 0.3]);
      addPart(group, geos.box, mats.mattress, [0, floorY + 0.53, -0.18], [0.64, 0.07, 0.3]);
      addPart(group, geos.box, mats.blanket, [0.07, floorY + 0.21, -0.18], [0.46, 0.05, 0.31]);
      addPart(group, geos.box, mats.blanket, [0.07, floorY + 0.55, -0.18], [0.46, 0.05, 0.31]);
      addPart(group, geos.box, mats.clinicWhite, [-0.23, floorY + 0.58, -0.18], [0.12, 0.05, 0.22]);
      break;
    }

    case 'mushroom': {
      // 2-tier wooden hydroponic shelf + compost trays + glowing bioluminescent fungi clusters
      for (const px of [-0.36, 0.36]) {
        addPart(group, geos.box, mats.timberDark, [px, floorY + 0.35, -0.16], [0.06, 0.7, 0.42]);
      }
      for (const sy of [floorY + 0.16, floorY + 0.48]) {
        addPart(group, geos.box, mats.timber, [0, sy, -0.16], [0.76, 0.05, 0.42]);
        addPart(group, geos.box, mats.compost, [0, sy + 0.045, -0.16], [0.68, 0.05, 0.36]);
        for (const mx of [-0.22, -0.04, 0.16]) {
          addPart(group, geos.cyl, mats.mushroomStem, [mx, sy + 0.11, -0.14], [0.045, 0.1, 0.045]);
          addPart(group, geos.sphere, mats.mushroomCap, [mx, sy + 0.17, -0.14], [0.15, 0.09, 0.15]);
        }
      }
      break;
    }

    case 'well': {
      // Stone curb ring + water basin + timber A-frame + pulley wheel + pump arm
      addPart(group, geos.cyl, mats.concreteWall, [0, floorY + 0.12, -0.14], [0.62, 0.24, 0.62]);
      addPart(group, geos.cyl, mats.waterSurface, [0, floorY + 0.22, -0.14], [0.48, 0.06, 0.48], [0, 0, 0], false);
      addPart(group, geos.box, mats.timberDark, [-0.26, floorY + 0.4, -0.14], [0.06, 0.62, 0.06]);
      addPart(group, geos.box, mats.timberDark, [0.26, floorY + 0.4, -0.14], [0.06, 0.62, 0.06]);
      addPart(group, geos.box, mats.timber, [0, floorY + 0.68, -0.14], [0.6, 0.06, 0.08]);
      addPart(group, geos.cyl, mats.brushedSteel, [0, floorY + 0.58, -0.14], [0.16, 0.06, 0.16], [Math.PI / 2, 0, 0]);
      const pumpArm = new THREE.Group();
      pumpArm.position.set(0.22, floorY + 0.34, 0.08);
      addPart(pumpArm, geos.cyl, mats.darkSteel, [0, 0, 0], [0.05, 0.36, 0.05], [0, 0, Math.PI / 3]);
      group.add(pumpArm);
      rig.pumpArm = pumpArm;
      break;
    }

    case 'pedal': {
      // Stationary bike generator + spinning spoked wheels + copper alternator + battery box
      addPart(group, geos.box, mats.darkSteel, [0, floorY + 0.03, -0.12], [0.76, 0.06, 0.34]);
      const wheelA = new THREE.Group();
      wheelA.position.set(-0.22, floorY + 0.2, -0.12);
      addPart(wheelA, geos.torus, mats.brushedSteel, [0, 0, 0], [0.26, 0.26, 0.26]);
      addPart(wheelA, geos.box, mats.brushedSteel, [0, 0, 0], [0.24, 0.02, 0.02]);
      addPart(wheelA, geos.box, mats.brushedSteel, [0, 0, 0], [0.02, 0.24, 0.02]);
      group.add(wheelA);
      rig.wheelA = wheelA;

      const wheelB = new THREE.Group();
      wheelB.position.set(0.12, floorY + 0.2, -0.12);
      addPart(wheelB, geos.torus, mats.brushedSteel, [0, 0, 0], [0.26, 0.26, 0.26]);
      addPart(wheelB, geos.box, mats.brushedSteel, [0, 0, 0], [0.24, 0.02, 0.02]);
      group.add(wheelB);
      rig.wheelB = wheelB;

      // Seat & handlebars
      addPart(group, geos.box, mats.darkSteel, [-0.08, floorY + 0.36, -0.12], [0.28, 0.05, 0.05], [0, 0, 0.2]);
      addPart(group, geos.box, mats.timberDark, [-0.16, floorY + 0.45, -0.12], [0.14, 0.05, 0.1]);
      addPart(group, geos.box, mats.brushedSteel, [0.08, floorY + 0.48, -0.12], [0.05, 0.05, 0.26]);
      // Alternator & copper coil box
      addPart(group, geos.cyl, mats.copperCoil, [0.28, floorY + 0.18, -0.12], [0.16, 0.18, 0.16], [0, 0, Math.PI / 2]);
      addPart(group, geos.box, mats.hazardYellow, [0.28, floorY + 0.34, -0.12], [0.16, 0.12, 0.2]);
      break;
    }

    case 'turbine': {
      // Cast iron base + copper stator drum + spinning multi-blade hydro rotor + intake pipes
      addPart(group, geos.box, mats.darkSteel, [0, floorY + 0.12, -0.16], [0.84, 0.24, 0.62]);
      addPart(group, geos.cyl, mats.copperCoil, [-0.22, floorY + 0.42, -0.16], [0.34, 0.28, 0.34], [0, 0, Math.PI / 2]);
      addPart(group, geos.cyl, mats.brushedSteel, [0.12, floorY + 0.42, -0.16], [0.42, 0.14, 0.42], [Math.PI / 2, 0, 0]);
      // Intake & exhaust conduits
      addPart(group, geos.cyl, mats.darkSteel, [-0.36, floorY + 0.54, -0.34], [0.12, 0.44, 0.12]);
      addPart(group, geos.cyl, mats.darkSteel, [0.34, floorY + 0.54, -0.34], [0.12, 0.44, 0.12]);

      const rotor = new THREE.Group();
      rotor.position.set(0.12, floorY + 0.42, -0.02);
      for (let i = 0; i < 4; i++) {
        addPart(
          rotor,
          geos.box,
          mats.brushedSteel,
          [0, 0, 0],
          [0.08, 0.48, 0.03],
          [0, 0, (i * Math.PI) / 4]
        );
      }
      addPart(rotor, geos.cyl, mats.hazardYellow, [0, 0, 0.03], [0.12, 0.08, 0.12], [Math.PI / 2, 0, 0]);
      group.add(rotor);
      rig.rotor = rotor;
      break;
    }

    case 'clinic': {
      // Medical bed + cabinet with red cross + IV drip pole
      addPart(group, geos.box, mats.clinicWhite, [-0.1, floorY + 0.16, -0.16], [0.58, 0.06, 0.34]);
      addPart(group, geos.box, mats.mattress, [-0.1, floorY + 0.22, -0.16], [0.54, 0.08, 0.3]);
      addPart(group, geos.box, mats.clinicWhite, [-0.36, floorY + 0.1, -0.16], [0.05, 0.2, 0.32]);
      addPart(group, geos.box, mats.clinicWhite, [0.22, floorY + 0.1, -0.16], [0.05, 0.2, 0.32]);
      // Wall medical cabinet with glowing red cross
      addPart(group, geos.box, mats.clinicWhite, [0.24, floorY + 0.54, -0.4], [0.26, 0.28, 0.12]);
      addPart(group, geos.box, mats.redCross, [0.24, floorY + 0.54, -0.33], [0.14, 0.045, 0.02]);
      addPart(group, geos.box, mats.redCross, [0.24, floorY + 0.54, -0.33], [0.045, 0.14, 0.02]);
      // IV pole
      addPart(group, geos.cyl, mats.brushedSteel, [-0.34, floorY + 0.38, 0.02], [0.03, 0.68, 0.03]);
      break;
    }

    case 'door': {
      // Heavy armored steel jambs + sliding bulkhead panel + beacon lamp
      addPart(group, geos.box, mats.darkSteel, [-0.42, 0.0, 0.0], [0.14, 0.92, 0.88]);
      addPart(group, geos.box, mats.darkSteel, [0.42, 0.0, 0.0], [0.14, 0.92, 0.88]);
      addPart(group, geos.box, mats.darkSteel, [0, 0.42, 0.0], [0.96, 0.12, 0.88]);
      const doorPanel = new THREE.Group();
      doorPanel.position.set(0, doorClosed ? -0.02 : 0.34, 0);
      addPart(doorPanel, geos.box, mats.brushedSteel, [0, 0, 0], [0.72, 0.78, 0.2]);
      addPart(doorPanel, geos.box, mats.hazardYellow, [0, -0.22, 0.12], [0.68, 0.08, 0.03]);
      group.add(doorPanel);
      rig.doorPanel = doorPanel;
      const statusLamp = addPart(
        group,
        geos.sphere,
        doorClosed ? mats.redCross : mats.mushroomCap,
        [0, 0.42, 0.46],
        [0.1, 0.1, 0.1]
      );
      rig.statusLamp = statusLamp;
      break;
    }

    case 'hall': {
      // Council oak table + benches + podium + Walt's yellow helmet mounted on plaque
      addPart(group, geos.box, mats.timber, [0, floorY + 0.24, -0.12], [0.68, 0.06, 0.36]);
      addPart(group, geos.box, mats.timberDark, [-0.26, floorY + 0.12, -0.12], [0.07, 0.24, 0.28]);
      addPart(group, geos.box, mats.timberDark, [0.26, floorY + 0.12, -0.12], [0.07, 0.24, 0.28]);
      addPart(group, geos.box, mats.timberDark, [0, floorY + 0.12, 0.14], [0.54, 0.05, 0.12]);
      // Memorial plaque + Walt's yellow miner helmet
      addPart(group, geos.box, mats.timberDark, [0, floorY + 0.56, -0.44], [0.26, 0.22, 0.04]);
      addPart(group, geos.sphere, mats.hazardYellow, [0, floorY + 0.57, -0.39], [0.16, 0.12, 0.16]);
      addPart(group, geos.box, mats.hazardYellow, [0, floorY + 0.54, -0.36], [0.2, 0.03, 0.18]);
      break;
    }

    default:
      break;
  }

  return rig;
}

export function buildColonistRig(
  col: Colonist,
  mats: ColonyMaterials3D,
  geos: SharedGeometries3D
): ColonistRig3D {
  const group = new THREE.Group();

  const torsoMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(col.color),
    roughness: 0.78,
    metalness: 0.05,
  });
  const hatMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(col.hatColor),
    roughness: 0.42,
    metalness: 0.25,
  });

  // Ground contact shadow disc
  const shadow = new THREE.Mesh(geos.shadowDisc, mats.contactShadow);
  shadow.position.set(0, 0.015, 0);
  shadow.scale.set(0.8, 1, 0.8);
  group.add(shadow);

  // Legs pivoted at hips (y = 0.24)
  const legL = new THREE.Group();
  legL.position.set(-0.06, 0.24, 0);
  addPart(legL, geos.box, mats.trousers, [0, -0.12, 0], [0.08, 0.24, 0.09]);
  group.add(legL);

  const legR = new THREE.Group();
  legR.position.set(0.06, 0.24, 0);
  addPart(legR, geos.box, mats.trousers, [0, -0.12, 0], [0.08, 0.24, 0.09]);
  group.add(legR);

  // Torso + backpack
  addPart(group, geos.box, torsoMat, [0, 0.37, 0], [0.22, 0.26, 0.15]);
  addPart(group, geos.box, mats.timberDark, [0, 0.37, -0.1], [0.16, 0.2, 0.07]);

  // Arms pivoted at shoulders
  const armL = new THREE.Group();
  armL.position.set(-0.15, 0.46, 0);
  addPart(armL, geos.box, torsoMat, [0, -0.1, 0], [0.07, 0.22, 0.07]);
  group.add(armL);

  const armR = new THREE.Group();
  armR.position.set(0.15, 0.46, 0);
  addPart(armR, geos.box, torsoMat, [0, -0.1, 0], [0.07, 0.22, 0.07]);

  // Pickaxe attached to right hand (shown when digging)
  const pickaxe = new THREE.Group();
  pickaxe.position.set(0, -0.19, 0.04);
  addPart(pickaxe, geos.cyl, mats.timber, [0, 0.08, 0.08], [0.025, 0.26, 0.025], [Math.PI / 2.2, 0, 0]);
  addPart(pickaxe, geos.box, mats.brushedSteel, [0, 0.11, 0.2], [0.18, 0.035, 0.04]);
  pickaxe.visible = false;
  armR.add(pickaxe);
  group.add(armR);

  // Head + Hat/Helmet + Miner Headlamp
  addPart(group, geos.sphere, mats.skinTone, [0, 0.59, 0], [0.17, 0.17, 0.17]);
  addPart(group, geos.cyl, hatMat, [0, 0.65, 0], [0.21, 0.06, 0.21]);
  addPart(group, geos.sphere, hatMat, [0, 0.67, 0], [0.18, 0.11, 0.18]);

  let headlamp: THREE.Mesh | undefined;
  if (col.role === 'Miner' || col.role === 'Engineer') {
    headlamp = addPart(group, geos.cyl, mats.tungstenBulbOn, [0.07, 0.67, 0.07], [0.045, 0.04, 0.045], [0, 0, Math.PI / 2]);
  }

  return { group, legL, legR, armL, armR, pickaxe, headlamp, torsoMat, hatMat };
}

export function buildWalkerRig(
  mats: ColonyMaterials3D,
  geos: SharedGeometries3D
): WalkerRig3D {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(geos.shadowDisc, mats.contactShadow);
  shadow.position.set(0, 0.015, 0);
  shadow.scale.set(0.75, 1, 0.75);
  group.add(shadow);

  const legL = new THREE.Group();
  legL.position.set(-0.06, 0.24, 0);
  addPart(legL, geos.box, mats.walkerRags, [0, -0.12, 0], [0.07, 0.24, 0.08]);
  group.add(legL);

  const legR = new THREE.Group();
  legR.position.set(0.06, 0.24, 0);
  addPart(legR, geos.box, mats.walkerRags, [0, -0.12, 0], [0.07, 0.24, 0.08]);
  group.add(legR);

  // Hunched torso
  addPart(group, geos.box, mats.walkerRags, [0, 0.36, 0.02], [0.2, 0.25, 0.14], [0.22, 0, 0]);

  const armL = new THREE.Group();
  armL.position.set(-0.14, 0.44, 0.04);
  addPart(armL, geos.box, mats.walkerSkin, [0, -0.08, 0.08], [0.06, 0.2, 0.06], [-1.1, 0, 0]);
  group.add(armL);

  const armR = new THREE.Group();
  armR.position.set(0.14, 0.44, 0.04);
  addPart(armR, geos.box, mats.walkerSkin, [0, -0.08, 0.08], [0.06, 0.2, 0.06], [-1.2, 0, 0]);
  group.add(armR);

  // Tilted head + glowing crimson eyes
  addPart(group, geos.sphere, mats.walkerSkin, [0, 0.56, 0.06], [0.16, 0.16, 0.16]);
  addPart(group, geos.sphere, mats.walkerEye, [-0.035, 0.57, 0.13], [0.03, 0.03, 0.03], [0, 0, 0], false);
  addPart(group, geos.sphere, mats.walkerEye, [0.035, 0.57, 0.13], [0.03, 0.03, 0.03], [0, 0, 0], false);

  return { group, legL, legR, armL, armR };
}

export function buildSurfaceBackdropRig(
  mats: ColonyMaterials3D,
  geos: SharedGeometries3D
): SurfaceBackdropRig {
  const group = new THREE.Group();
  const surfaceY = -SURFACE_ROW; // -2.0 in world coords
  const groundPlates: THREE.Mesh[] = [];

  // Extended asphalt & soil terrace spanning well beyond playable bounds (-24..+68)
  const streetRoad = addPart(
    group,
    geos.box,
    mats.asphalt,
    [GRID_COLS / 2, surfaceY - 0.05, -2.5],
    [96, 0.12, 8.5],
    [0, 0, 0],
    false
  );
  streetRoad.receiveShadow = true;

  // Front grass/snow crust strip along y = -2.0 (excludes hatch tile x=21)
  const leftCrust = addPart(group, geos.box, mats.grassCrust, [10.5, surfaceY + 0.01, 0], [21, 0.08, 1.8]);
  const rightCrust = addPart(group, geos.box, mats.grassCrust, [33.0, surfaceY + 0.01, 0], [22, 0.08, 1.8]);
  const farLeftCrust = addPart(group, geos.box, mats.grassCrust, [-13, surfaceY - 0.45, -1.5], [26, 1.0, 9.0]);
  const farRightCrust = addPart(group, geos.box, mats.grassCrust, [57, surfaceY - 0.45, -1.5], [26, 1.0, 9.0]);
  groundPlates.push(leftCrust, rightCrust, farLeftCrust, farRightCrust);

  // Ruined city buildings along background avenue (z = -3.8 .. -5.8)
  const buildings: Array<[number, number, number, number]> = [
    [-8, 4.2, 3.8, -4.6],
    [2.5, 3.4, 2.8, -4.2],
    [7.2, 4.6, 4.5, -5.0],
    [12.5, 3.1, 2.5, -4.1],
    [16.2, 2.6, 2.1, -4.4],
    [25.5, 3.8, 3.2, -4.3],
    [30.5, 4.9, 4.8, -5.2],
    [36.2, 3.3, 2.7, -4.0],
    [40.8, 4.1, 3.6, -4.8],
    [49.0, 4.5, 4.0, -5.0],
  ];

  for (const [bx, bw, bh, bz] of buildings) {
    const bldg = new THREE.Group();
    bldg.position.set(bx, surfaceY, bz);
    addPart(bldg, geos.box, mats.ruinedBrick, [0, bh / 2, 0], [bw, bh, 2.4]);
    // Stepped ruined parapet / rooftop box
    addPart(bldg, geos.box, mats.concreteWall, [-bw * 0.15, bh + 0.25, 0], [bw * 0.55, 0.5, 2.1]);
    // Recessed dark window frames
    for (let wy = 0.7; wy < bh - 0.5; wy += 0.85) {
      for (let wx = -bw * 0.3; wx <= bw * 0.31; wx += 0.8) {
        addPart(bldg, geos.box, mats.trousers, [wx, wy, 1.22], [0.36, 0.48, 0.06], [0, 0, 0], false);
      }
    }
    group.add(bldg);
  }

  // Concrete Hatch Collar & Radio Mast + CCTV Pole beside x=21
  addPart(group, geos.box, mats.concreteWall, [21.5, surfaceY + 0.08, 0], [1.4, 0.22, 1.4]);
  addPart(group, geos.cyl, mats.brushedSteel, [20.3, surfaceY + 1.4, -0.4], [0.07, 2.8, 0.07]);
  addPart(group, geos.box, mats.darkSteel, [20.3, surfaceY + 2.75, -0.4], [0.45, 0.04, 0.04]);

  // Rotating CCTV Camera & Translucent Scan Cone (pivot apex at camera lens, pointing down-right)
  const cctvHead = new THREE.Group();
  cctvHead.position.set(20.38, surfaceY + 2.35, -0.35);
  addPart(cctvHead, geos.box, mats.clinicWhite, [0.18, 0, 0], [0.34, 0.14, 0.16]);
  addPart(cctvHead, geos.sphere, mats.redCross, [0.36, 0, 0], [0.06, 0.06, 0.06], [0, 0, 0], false);
  const conePivot = new THREE.Group();
  conePivot.position.set(0.36, 0, 0);
  conePivot.rotation.z = 0.42;
  const scanCone = new THREE.Mesh(geos.cone, mats.cctvCone);
  scanCone.position.set(0, -1.15, 0);
  scanCone.scale.set(0.75, 2.3, 0.75);
  conePivot.add(scanCone);
  cctvHead.add(conePivot);
  group.add(cctvHead);

  // Subtle street barriers & lamp posts along the surface avenue
  for (const lx of [8, 17, 26, 35]) {
    addPart(group, geos.cyl, mats.darkSteel, [lx, surfaceY + 1.0, -1.6], [0.06, 2.0, 0.06]);
    addPart(group, geos.box, mats.darkSteel, [lx + 0.15, surfaceY + 2.0, -1.6], [0.36, 0.06, 0.1]);
  }

  return { group, cctvHead, groundPlates };
}
