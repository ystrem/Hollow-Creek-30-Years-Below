import * as THREE from 'three';

export interface ColonyMaterials3D {
  strataRock: THREE.MeshStandardMaterial;
  concreteWall: THREE.MeshStandardMaterial;
  interiorBackWall: THREE.MeshStandardMaterial;
  floorTimber: THREE.MeshStandardMaterial;
  darkSteel: THREE.MeshStandardMaterial;
  brushedSteel: THREE.MeshStandardMaterial;
  copperCoil: THREE.MeshStandardMaterial;
  timber: THREE.MeshStandardMaterial;
  timberDark: THREE.MeshStandardMaterial;
  mattress: THREE.MeshStandardMaterial;
  blanket: THREE.MeshStandardMaterial;
  clinicWhite: THREE.MeshStandardMaterial;
  redCross: THREE.MeshStandardMaterial;
  mushroomStem: THREE.MeshStandardMaterial;
  mushroomCap: THREE.MeshStandardMaterial;
  compost: THREE.MeshStandardMaterial;
  waterSurface: THREE.MeshStandardMaterial;
  tungstenBulbOn: THREE.MeshStandardMaterial;
  tungstenBulbOff: THREE.MeshStandardMaterial;
  hazardYellow: THREE.MeshStandardMaterial;
  amberWire: THREE.MeshBasicMaterial;
  crimsonWire: THREE.MeshBasicMaterial;
  hoverWire: THREE.MeshBasicMaterial;
  ruinedBrick: THREE.MeshStandardMaterial;
  asphalt: THREE.MeshStandardMaterial;
  snowCrust: THREE.MeshStandardMaterial;
  grassCrust: THREE.MeshStandardMaterial;
  skinTone: THREE.MeshStandardMaterial;
  trousers: THREE.MeshStandardMaterial;
  walkerSkin: THREE.MeshStandardMaterial;
  walkerRags: THREE.MeshStandardMaterial;
  walkerEye: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  cctvCone: THREE.MeshBasicMaterial;
  particleDebris: THREE.MeshStandardMaterial;
  precipitation: THREE.MeshBasicMaterial;
  dispose: () => void;
}

function createNoiseCanvas(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) draw(ctx, size);
  return canvas;
}

function makeRockBumpTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = createNoiseCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, s, s);
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    // Strata sedimentary bands + craggy chips
    for (let y = 0; y < s; y += 8) {
      const shade = Math.floor(105 + rand() * 55);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, s, 4 + rand() * 5);
    }
    for (let i = 0; i < 650; i++) {
      const x = rand() * s;
      const y = rand() * s;
      const w = 3 + rand() * 14;
      const h = 2 + rand() * 8;
      const v = Math.floor(60 + rand() * 145);
      ctx.fillStyle = `rgba(${v},${v},${v},0.45)`;
      ctx.fillRect(x, y, w, h);
    }
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAniso;
  return tex;
}

function makeWoodColorTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = createNoiseCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#7c4d2b';
    ctx.fillRect(0, 0, s, s);
    let seed = 9001;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let y = 0; y < s; y += 32) {
      ctx.fillStyle = '#5b361c';
      ctx.fillRect(0, y, s, 2);
      for (let g = 0; g < 18; g++) {
        const gy = y + 3 + rand() * 26;
        const tone = rand() > 0.5 ? 'rgba(40,20,10,0.22)' : 'rgba(180,120,70,0.18)';
        ctx.fillStyle = tone;
        ctx.fillRect(0, gy, s, 1 + rand() * 2);
      }
    }
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAniso;
  return tex;
}

function makeConcreteTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = createNoiseCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#8b8f96';
    ctx.fillRect(0, 0, s, s);
    let seed = 4242;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 900; i++) {
      const v = Math.floor(110 + rand() * 65);
      ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
      ctx.fillRect(rand() * s, rand() * s, 2 + rand() * 5, 2 + rand() * 5);
    }
    // Formwork seams
    ctx.strokeStyle = 'rgba(40,45,52,0.45)';
    ctx.lineWidth = 2;
    for (let p = 64; p < s; p += 64) {
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(s, p);
      ctx.moveTo(p, 0);
      ctx.lineTo(p, s);
      ctx.stroke();
    }
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAniso;
  return tex;
}

function makeContactShadowTexture(): THREE.CanvasTexture {
  const canvas = createNoiseCanvas(64, (ctx, s) => {
    const grad = ctx.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0.62)');
    grad.addColorStop(0.65, 'rgba(0,0,0,0.22)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createColonyMaterials3D(maxAnisotropy: number): ColonyMaterials3D {
  const rockBump = makeRockBumpTexture(maxAnisotropy);
  const woodMap = makeWoodColorTexture(maxAnisotropy);
  const concreteBump = makeConcreteTexture(maxAnisotropy);
  const shadowTex = makeContactShadowTexture();

  const allTextures: THREE.Texture[] = [rockBump, woodMap, concreteBump, shadowTex];
  const allMaterials: THREE.Material[] = [];

  const reg = <T extends THREE.Material>(m: T): T => {
    allMaterials.push(m);
    return m;
  };

  const strataRock = reg(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      bumpMap: rockBump,
      bumpScale: 0.18,
    })
  );

  const concreteWall = reg(
    new THREE.MeshStandardMaterial({
      color: 0x525a66,
      roughness: 0.85,
      metalness: 0.08,
      bumpMap: concreteBump,
      bumpScale: 0.05,
    })
  );

  const interiorBackWall = reg(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      bumpMap: rockBump,
      bumpScale: 0.1,
    })
  );

  const floorTimber = reg(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: woodMap,
      roughness: 0.78,
      metalness: 0.04,
    })
  );

  const darkSteel = reg(
    new THREE.MeshStandardMaterial({
      color: 0x333b48,
      roughness: 0.45,
      metalness: 0.78,
      bumpMap: concreteBump,
      bumpScale: 0.015,
    })
  );

  const brushedSteel = reg(
    new THREE.MeshStandardMaterial({
      color: 0x9aa6b5,
      roughness: 0.28,
      metalness: 0.88,
    })
  );

  const copperCoil = reg(
    new THREE.MeshStandardMaterial({
      color: 0xc97438,
      roughness: 0.25,
      metalness: 0.9,
    })
  );

  const timber = reg(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: woodMap,
      roughness: 0.82,
      metalness: 0.02,
    })
  );

  const timberDark = reg(
    new THREE.MeshStandardMaterial({
      color: 0x5a361e,
      roughness: 0.86,
      metalness: 0.02,
    })
  );

  const mattress = reg(
    new THREE.MeshStandardMaterial({
      color: 0xc7c2b6,
      roughness: 0.9,
      metalness: 0.0,
    })
  );

  const blanket = reg(
    new THREE.MeshStandardMaterial({
      color: 0x4b647d,
      roughness: 0.92,
      metalness: 0.0,
    })
  );

  const clinicWhite = reg(
    new THREE.MeshStandardMaterial({
      color: 0xe6ebf0,
      roughness: 0.38,
      metalness: 0.15,
    })
  );

  const redCross = reg(
    new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0x450a0a,
      roughness: 0.4,
      metalness: 0.1,
    })
  );

  const mushroomStem = reg(
    new THREE.MeshStandardMaterial({
      color: 0xd9d2c0,
      roughness: 0.85,
      metalness: 0.0,
    })
  );

  const mushroomCap = reg(
    new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x16a34a,
      emissiveIntensity: 0.65,
      roughness: 0.45,
      metalness: 0.05,
    })
  );

  const compost = reg(
    new THREE.MeshStandardMaterial({
      color: 0x2d2219,
      roughness: 0.95,
      metalness: 0.0,
    })
  );

  const waterSurface = reg(
    new THREE.MeshStandardMaterial({
      color: 0x22a8e0,
      emissive: 0x0a3a52,
      emissiveIntensity: 0.35,
      roughness: 0.14,
      metalness: 0.15,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    })
  );

  const tungstenBulbOn = reg(
    new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.0,
    })
  );

  const tungstenBulbOff = reg(
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.2,
    })
  );

  const hazardYellow = reg(
    new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.42,
      metalness: 0.25,
    })
  );

  const amberWire = reg(
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.9,
    })
  );

  const crimsonWire = reg(
    new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.88,
    })
  );

  const hoverWire = reg(
    new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.95,
    })
  );

  const ruinedBrick = reg(
    new THREE.MeshStandardMaterial({
      color: 0x3b3533,
      roughness: 0.9,
      metalness: 0.05,
      bumpMap: rockBump,
      bumpScale: 0.05,
    })
  );

  const asphalt = reg(
    new THREE.MeshStandardMaterial({
      color: 0x22262e,
      roughness: 0.88,
      metalness: 0.06,
      bumpMap: concreteBump,
      bumpScale: 0.03,
    })
  );

  const snowCrust = reg(
    new THREE.MeshStandardMaterial({
      color: 0xdbe4ef,
      roughness: 0.85,
      metalness: 0.02,
    })
  );

  const grassCrust = reg(
    new THREE.MeshStandardMaterial({
      color: 0x3f4c36,
      roughness: 0.92,
      metalness: 0.0,
    })
  );

  const skinTone = reg(
    new THREE.MeshStandardMaterial({
      color: 0xe6b18a,
      roughness: 0.72,
      metalness: 0.0,
    })
  );

  const trousers = reg(
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.84,
      metalness: 0.04,
    })
  );

  const walkerSkin = reg(
    new THREE.MeshStandardMaterial({
      color: 0x6f7e6c,
      roughness: 0.85,
      metalness: 0.0,
    })
  );

  const walkerRags = reg(
    new THREE.MeshStandardMaterial({
      color: 0x424a40,
      roughness: 0.92,
      metalness: 0.0,
    })
  );

  const walkerEye = reg(
    new THREE.MeshStandardMaterial({
      color: 0xfca5a5,
      emissive: 0xef4444,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    })
  );

  const contactShadow = reg(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );

  const cctvCone = reg(
    new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );

  const particleDebris = reg(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.82,
      metalness: 0.1,
    })
  );

  const precipitation = reg(
    new THREE.MeshBasicMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.68,
    })
  );

  return {
    strataRock,
    concreteWall,
    interiorBackWall,
    floorTimber,
    darkSteel,
    brushedSteel,
    copperCoil,
    timber,
    timberDark,
    mattress,
    blanket,
    clinicWhite,
    redCross,
    mushroomStem,
    mushroomCap,
    compost,
    waterSurface,
    tungstenBulbOn,
    tungstenBulbOff,
    hazardYellow,
    amberWire,
    crimsonWire,
    hoverWire,
    ruinedBrick,
    asphalt,
    snowCrust,
    grassCrust,
    skinTone,
    trousers,
    walkerSkin,
    walkerRags,
    walkerEye,
    contactShadow,
    cctvCone,
    particleDebris,
    precipitation,
    dispose: () => {
      allTextures.forEach((t) => t.dispose());
      allMaterials.forEach((m) => m.dispose());
    },
  };
}
