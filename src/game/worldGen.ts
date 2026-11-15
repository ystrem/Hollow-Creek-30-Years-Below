import { GRID_COLS, GRID_ROWS, SURFACE_ROW } from './constants';
import { GridCell, MaterialType, Walker } from './types';

function hash2D(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

export function generateWorldGrid(): { grid: GridCell[][]; walkers: Walker[] } {
  const grid: GridCell[][] = [];
  const walkers: Walker[] = [];

  for (let y = 0; y < GRID_ROWS; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < GRID_COLS; x++) {
      const r = hash2D(x, y);
      let material: MaterialType = 'topsoil';
      let dug = false;
      let waterLevel = 0;
      let coalDeposit = false;

      if (y < SURFACE_ROW) {
        material = 'sky';
        dug = true;
      } else if (y === SURFACE_ROW) {
        material = 'surface';
        dug = false;
      } else if (y <= 6) {
        material = 'topsoil';
        if (y === 5 && (x === 15 || x === 16 || x === 27)) {
          material = 'mycelium';
        }
      } else if (y <= 12) {
        material = 'clay';
        // Underground water vein around 23m depth (y = 8..9)
        if ((y === 8 || y === 9) && x >= 12 && x <= 16) {
          material = 'water_vein';
          waterLevel = 0.55;
        }
      } else if (y <= 19) {
        material = 'coal_rock';
        if (r > 0.68) coalDeposit = true;
        // Abandoned coal mine pre-dug chambers around y=14..16
        if ((y === 14 || y === 15) && x >= 19 && x <= 28) {
          dug = true;
          material = 'air';
        }
      } else if (y <= 24) {
        material = 'limestone';
        // Underground river channel at y=22..23 (-56m to -68m)
        if ((y === 22 || y === 23) && x >= 8 && x <= 35) {
          dug = true;
          material = 'water_vein';
          waterLevel = y === 23 ? 0.95 : 0.72;
        }
      } else if (y <= 32) {
        material = 'metro_ruin';
        // Collapsed Metro tunnel at y=28..29 (-80m to -92m)
        if ((y === 28 || y === 29) && x >= 24 && x <= 38) {
          dug = true;
          material = 'air';
        }
      } else if (y <= 36) {
        material = 'deep_bedrock';
      } else {
        // -128m abyssal void cavern
        material = 'void_cavern';
        if (y >= 38 && x >= 15 && x <= 30) {
          dug = true;
        }
      }

      row.push({
        x,
        y,
        material,
        dug,
        room: 'none',
        hasLadder: false,
        hasSupport: false,
        doorClosed: false,
        waterLevel,
        lit: y < SURFACE_ROW,
        powered: false,
        digProgress: 0,
        markedForDig: false,
        unstable: false,
        collapseTimer: 0,
        revealed: y <= 5,
        acousticHint: 'none',
        coalDeposit,
      });
    }
    grid.push(row);
  }

  // Carve the starter concrete bunker (x: 18..24, y: 3..4) and Hatch at x=21, y=2
  const hatchX = 21;
  grid[SURFACE_ROW][hatchX].dug = true;
  grid[SURFACE_ROW][hatchX].material = 'concrete';
  grid[SURFACE_ROW][hatchX].room = 'hatch';
  grid[SURFACE_ROW][hatchX].hasLadder = true;
  grid[SURFACE_ROW][hatchX].hasSupport = true;
  grid[SURFACE_ROW][hatchX].doorClosed = true;
  grid[SURFACE_ROW][hatchX].lit = true;
  grid[SURFACE_ROW][hatchX].revealed = true;

  for (let y = 3; y <= 4; y++) {
    for (let x = 18; x <= 24; x++) {
      const cell = grid[y][x];
      cell.dug = true;
      cell.material = 'concrete';
      cell.lit = true;
      cell.powered = true;
      cell.revealed = true;
      if (x === hatchX) {
        cell.hasLadder = true;
        cell.room = 'ladder';
      }
      if (x === 18 || x === 21 || x === 24) {
        cell.hasSupport = true;
      }
    }
  }

  // Starter rooms inside the bunker
  grid[3][19].room = 'bunk';
  grid[3][20].room = 'bunk';
  grid[4][19].room = 'well'; // emergency reserve cistern
  grid[4][23].room = 'pedal'; // emergency hand-crank / dynamo

  // Coal mine timber props so the old mine holds initially
  for (let x = 19; x <= 28; x += 3) {
    grid[14][x].hasSupport = true;
    grid[15][x].hasSupport = true;
  }

  // Acoustic hints on adjacent tiles near hazards/discoveries
  for (let y = 3; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const c = grid[y][x];
      if (!c.dug) {
        if (y >= 7 && y <= 10 && x >= 11 && x <= 17) c.acousticHint = 'water';
        else if (y >= 12 && y <= 16 && x >= 18 && x <= 29) c.acousticHint = 'hollow';
        else if (y >= 20 && y <= 24 && x >= 7 && x <= 36) c.acousticHint = 'water';
        else if (y >= 26 && y <= 31 && x >= 22 && x <= 39) c.acousticHint = 'scratching';
        else if (y >= 36) c.acousticHint = 'abyss';
      }
    }
  }

  // Surface Walkers
  walkers.push(
    { id: 'sw1', x: 7, y: 1.4, vx: 0.45, hp: 30, zone: 'surface', active: true },
    { id: 'sw2', x: 13, y: 1.4, vx: -0.38, hp: 30, zone: 'surface', active: true },
    { id: 'sw3', x: 31, y: 1.4, vx: 0.42, hp: 30, zone: 'surface', active: true },
    { id: 'sw4', x: 37, y: 1.4, vx: -0.5, hp: 30, zone: 'surface', active: true }
  );

  // Dormant Metro Walkers inside the collapsed metro tunnel
  walkers.push(
    { id: 'mw1', x: 27, y: 29, vx: 0.3, hp: 40, zone: 'metro', active: false },
    { id: 'mw2', x: 31, y: 29, vx: -0.3, hp: 40, zone: 'metro', active: false },
    { id: 'mw3', x: 35, y: 29, vx: 0.35, hp: 40, zone: 'metro', active: false },
    { id: 'mw4', x: 29, y: 28, vx: -0.25, hp: 40, zone: 'metro', active: false }
  );

  return { grid, walkers };
}
