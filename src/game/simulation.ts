import {
  CHAPTER_NAMES,
  DAY_DURATION_SECONDS,
  DAYS_PER_YEAR,
  GRID_COLS,
  GRID_ROWS,
  SURFACE_ROW,
  TOOLS,
  rowToDepthMeters,
} from './constants';
import { createNewspaper, NARRATIVE_EVENTS } from './events';
import {
  Colonist,
  GameState,
  GridCell,
  LawId,
  ToolId,
} from './types';
import { generateWorldGrid } from './worldGen';

export function createInitialFounders(): Colonist[] {
  return [
    {
      id: 'walt',
      name: 'Walt',
      role: 'Miner',
      age: 58,
      hp: 100,
      maxHp: 100,
      hunger: 10,
      thirst: 10,
      energy: 90,
      sick: false,
      quarantinedDays: 0,
      alive: true,
      isFounder: true,
      x: 20,
      y: 4,
      targetX: 20,
      targetY: 4,
      task: 'idle',
      workTimer: 0,
      walkPhase: 0,
      facing: 1,
      color: '#c97a40',
      hatColor: '#eab308',
      note: '30 years in the pits. Prop every 2 tiles.',
    },
    {
      id: 'ray',
      name: 'Ray',
      role: 'Engineer',
      age: 36,
      hp: 100,
      maxHp: 100,
      hunger: 10,
      thirst: 10,
      energy: 92,
      sick: false,
      quarantinedDays: 0,
      alive: true,
      isFounder: true,
      x: 23,
      y: 4,
      targetX: 23,
      targetY: 4,
      task: 'pedaling',
      workTimer: 0,
      walkPhase: 0,
      facing: -1,
      color: '#4a7c9b',
      hatColor: '#94a3b8',
      note: 'Keeping the bunker lights humming.',
    },
    {
      id: 'nora',
      name: 'Nora',
      role: 'Medic',
      age: 33,
      hp: 100,
      maxHp: 100,
      hunger: 10,
      thirst: 10,
      energy: 94,
      sick: false,
      quarantinedDays: 0,
      alive: true,
      isFounder: true,
      x: 19,
      y: 3,
      targetX: 19,
      targetY: 3,
      task: 'idle',
      workTimer: 0,
      walkPhase: 0,
      facing: 1,
      color: '#3f8f78',
      hatColor: '#f1f5f9',
      note: 'Nurse. Every life down here counts.',
    },
    {
      id: 'eli',
      name: 'Eli',
      role: 'Scout',
      age: 21,
      hp: 100,
      maxHp: 100,
      hunger: 10,
      thirst: 10,
      energy: 95,
      sick: false,
      quarantinedDays: 0,
      alive: true,
      isFounder: true,
      x: 22,
      y: 3,
      targetX: 22,
      targetY: 3,
      task: 'guarding',
      workTimer: 0,
      walkPhase: 0,
      facing: -1,
      color: '#b45348',
      hatColor: '#334155',
      note: 'Fast on my feet. Ready for surface runs.',
    },
  ];
}

export function createInitialGameState(autostart = false): GameState {
  const { grid, walkers } = generateWorldGrid();

  const state: GameState = {
    phase: autostart ? 'PLAYING' : 'TITLE',
    speed: 1,
    day: 1,
    year: 1,
    timeOfDay: 8,
    chapter: 1,
    chapterTitle: CHAPTER_NAMES[1],
    population: 4,
    resources: {
      food: 540,
      water: 180,
      wood: 45,
      steel: 18,
      meds: 8,
      ammo: 18,
      powerGen: 30,
      powerUse: 8,
      dieselFuel: 380,
      spirit: 82,
    },
    history: [
      {
        day: 1,
        year: 1,
        label: 'Y1 D1',
        food: 540,
        water: 180,
        foodCons: 2.8,
        waterCons: 3.0,
        foodProd: 0,
        waterProd: 8,
        powerGen: 34,
        powerUse: 3,
        population: 4,
      },
    ],
    grid,
    colonists: createInitialFounders(),
    walkers,
    laws: {
      quarantine_48h: false,
      ration_tickets: false,
      two_key_hatch: false,
      curfew_22: false,
      constitution: false,
      surface_charter: false,
    },
    activeEvent: null,
    triggeredEvents: {},
    activeNewspaper: null,
    newspapers: [
      createNewspaper(
        'day1_chronicle',
        1,
        1,
        'FOUR DESCEND INTO HOLLOW CREEK',
        'Surface Outbreak Forces Emergency Lockdown Below',
        'Walt, Ray, Nora, and Eli sealed the concrete hatch at dawn with 540 cans of rations. Security camera feeds show infected roaming the avenue above.'
      ),
    ],
    journal: [
      {
        id: 'j1',
        day: 1,
        year: 1,
        author: 'Walt',
        text: 'Above is death. Down we go. Remember: a timber prop every two tiles, no exceptions.',
      },
    ],
    selectedTool: 'dig',
    selectedCell: null,
    expeditionCooldown: 0,
    expeditionActive: false,
    expeditionTimer: 0,
    blackout: false,
    unrest: 8,
    weather: 'overcast',
    surfaceWalkersThreat: 4,
    cctvAlert: null,
    stats: {
      yearsSurvived: 1,
      peakPopulation: 4,
      tilesExcavated: 0,
      roomsBuilt: 4,
      lawsEnacted: 0,
      fallenCount: 0,
      expeditionsCompleted: 0,
      chapterReached: 1,
      endingType: 'ongoing',
    },
    soundCueQueue: [],
    cameraShake: 0,
    hitstopTimer: 0,
    floatingCallouts: [],
    nextCalloutId: 1,
    victoryTriggered: false,
    gameOverReason: null,
  };

  recalculatePowerAndStability(state);
  return state;
}

export function addCallout(state: GameState, x: number, y: number, text: string, color = '#e89b3c') {
  state.floatingCallouts.push({
    id: state.nextCalloutId++,
    x,
    y,
    text,
    color,
    life: 1.8,
    maxLife: 1.8,
  });
  if (state.floatingCallouts.length > 24) {
    state.floatingCallouts.shift();
  }
}

export function addJournalNote(state: GameState, author: string, text: string) {
  state.journal.unshift({
    id: `j_${state.day}_${state.journal.length}`,
    day: state.day,
    year: state.year,
    author,
    text,
  });
  if (state.journal.length > 30) {
    state.journal.pop();
  }
}

export function isCellAdjacentToDug(grid: GridCell[][], x: number, y: number): boolean {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < GRID_COLS && ny >= 0 && ny < GRID_ROWS) {
      if (grid[ny][nx].dug) return true;
    }
  }
  return false;
}

export function markDigCell(state: GameState, x: number, y: number): boolean {
  if (x < 0 || x >= GRID_COLS || y <= SURFACE_ROW || y >= GRID_ROWS) return false;
  const cell = state.grid[y][x];
  if (cell.dug) return false;
  if (!isCellAdjacentToDug(state.grid, x, y)) {
    addCallout(state, x, y, 'Must connect to tunnel', '#94a3b8');
    return false;
  }
  cell.markedForDig = !cell.markedForDig;
  cell.revealed = true;

  if (cell.markedForDig && cell.acousticHint !== 'none') {
    const hintText =
      cell.acousticHint === 'water'
        ? 'Walt hears dripping water!'
        : cell.acousticHint === 'hollow'
          ? 'Hollow echo behind rock'
          : cell.acousticHint === 'scratching'
            ? 'Warning: Scratching behind wall!'
            : 'Deep abyss echo (-128m)';
    const hintColor = cell.acousticHint === 'scratching' ? '#ef4444' : '#38bdf8';
    addCallout(state, x, y, hintText, hintColor);
  }
  return true;
}

export function completeDigCell(state: GameState, x: number, y: number) {
  const cell = state.grid[y][x];
  if (cell.dug) return;

  const prevMaterial = cell.material;
  cell.dug = true;
  cell.markedForDig = false;
  cell.digProgress = 1;
  cell.revealed = true;
  state.stats.tilesExcavated += 1;
  state.soundCueQueue.push('dig');

  // Reveal neighbors
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < GRID_COLS && ny >= 0 && ny < GRID_ROWS) {
        state.grid[ny][nx].revealed = true;
      }
    }
  }

  // Material rewards & discoveries
  if (prevMaterial === 'topsoil' || prevMaterial === 'clay') {
    state.resources.wood += 2;
    addCallout(state, x, y, '+2 Timber', '#d4a373');
  } else if (prevMaterial === 'mycelium') {
    state.resources.food += 30;
    addCallout(state, x, y, '+30 Mycelium Food!', '#4ade80');
    if (!state.triggeredEvents['found_mycelium']) {
      state.triggeredEvents['found_mycelium'] = true;
      addJournalNote(state, 'Walt', 'Found rich underground mycelium! Good spot to expand Mushroom Farms.');
    }
  } else if (prevMaterial === 'coal_rock') {
    const woodGain = cell.coalDeposit ? 4 : 2;
    const steelGain = cell.coalDeposit ? 3 : 1;
    state.resources.wood += woodGain;
    state.resources.steel += steelGain;
    if (cell.coalDeposit) state.resources.dieselFuel += 15;
    addCallout(state, x, y, `+${woodGain} Wood · +${steelGain} Steel`, '#e89b3c');
    if (!state.triggeredEvents['found_coal_mine'] && y >= 13 && y <= 17) {
      state.triggeredEvents['found_coal_mine'] = true;
      state.resources.wood += 24;
      state.resources.steel += 14;
      state.chapter = Math.max(state.chapter, 4);
      state.chapterTitle = CHAPTER_NAMES[state.chapter];
      addJournalNote(
        state,
        'Walt',
        'We broke into the old coal mine I worked 50 years ago! Salvaged timber, rails, and coal.'
      );
      state.newspapers.unshift(
        createNewspaper(
          'coal_mine_found',
          state.year,
          state.day,
          'ABANDONED COAL MINE UNEARTHED AT -36M',
          'Timber & Steel Reserves Bolster Subterranean Expansion',
          'Excavation crews broke into pre-war mine shafts today, recovering seasoned timber beams and steel rails.'
        )
      );
      state.soundCueQueue.push('paper');
    }
  } else if (prevMaterial === 'limestone') {
    state.resources.steel += 2;
    addCallout(state, x, y, '+2 Steel', '#cbd5e1');
  } else if (prevMaterial === 'water_vein') {
    state.resources.water += 35;
    cell.waterLevel = Math.max(cell.waterLevel, 0.5);
    addCallout(state, x, y, 'Water Vein Struck! +35 Water', '#38bdf8');
    state.soundCueQueue.push('water');
    if (y >= 20 && !state.triggeredEvents['found_river']) {
      state.triggeredEvents['found_river'] = true;
      state.chapter = Math.max(state.chapter, 4);
      state.chapterTitle = CHAPTER_NAMES[state.chapter];
      addJournalNote(
        state,
        'Ray',
        'An underground river at -56m! Build a Hydro Turbine right along the water for permanent electricity.'
      );
    }
  } else if (prevMaterial === 'metro_ruin') {
    state.resources.steel += 5;
    state.resources.ammo += 2;
    addCallout(state, x, y, '+5 Scrap Steel · +2 Ammo', '#f59e0b');
    if (!state.triggeredEvents['ch6_metro_breach'] && y >= 26 && x >= 21) {
      triggerMetroBreach(state);
    }
  } else if (prevMaterial === 'void_cavern' || y >= 37) {
    state.resources.steel += 4;
    if (!state.triggeredEvents['deep_void_discovered']) {
      state.triggeredEvents['deep_void_discovered'] = true;
      addJournalNote(
        state,
        'Lily',
        'At -128 meters our drill broke into an impossibly vast cavern. Warm air rises from below...'
      );
      addCallout(state, x, y, '-128m Abyssal Void Detected!', '#a855f7');
    }
  }

  cell.material = prevMaterial === 'water_vein' ? 'water_vein' : 'air';
  recalculatePowerAndStability(state);
}

function triggerMetroBreach(state: GameState) {
  state.triggeredEvents['ch6_metro_breach'] = true;
  state.chapter = Math.max(state.chapter, 6);
  state.chapterTitle = CHAPTER_NAMES[state.chapter];
  for (const w of state.walkers) {
    if (w.zone === 'metro') w.active = true;
  }
  state.activeEvent = NARRATIVE_EVENTS['ch6_metro_breach'];
  state.soundCueQueue.push('alarm');
  state.cameraShake = 0.65;
}

export function buildStructure(state: GameState, x: number, y: number, toolId: ToolId): boolean {
  if (x < 0 || x >= GRID_COLS || y <= SURFACE_ROW || y >= GRID_ROWS) return false;
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool || tool.id === 'inspect' || tool.id === 'dig') return false;

  const cell = state.grid[y][x];
  if (!cell.dug) {
    addCallout(state, x, y, 'Excavate tile first', '#94a3b8');
    return false;
  }

  if (state.resources.wood < tool.woodCost || state.resources.steel < tool.steelCost) {
    addCallout(state, x, y, 'Insufficient Wood/Steel', '#ef4444');
    return false;
  }

  if (tool.id === 'ladder') {
    if (cell.hasLadder) return false;
    cell.hasLadder = true;
    if (cell.room === 'none') cell.room = 'ladder';
  } else if (tool.id === 'support') {
    if (cell.hasSupport) return false;
    cell.hasSupport = true;
    cell.unstable = false;
    cell.collapseTimer = 0;
    if (cell.room === 'none') cell.room = 'support';
  } else if (tool.id === 'door') {
    if (cell.room === 'door') {
      cell.doorClosed = !cell.doorClosed;
      return true;
    }
    cell.room = 'door';
    cell.doorClosed = true;
    cell.hasSupport = true;
  } else {
    if (cell.room !== 'none' && cell.room !== 'ladder' && cell.room !== 'support') {
      addCallout(state, x, y, 'Tile already occupied', '#94a3b8');
      return false;
    }
    cell.room = tool.id;
    if (tool.id === 'bunk' || tool.id === 'hall' || tool.id === 'turbine') {
      cell.hasSupport = true;
    }
  }

  state.resources.wood -= tool.woodCost;
  state.resources.steel -= tool.steelCost;
  state.stats.roomsBuilt += 1;
  state.soundCueQueue.push('build');
  addCallout(state, x, y, `Built ${tool.name}`, '#4ade80');

  recalculatePowerAndStability(state);
  return true;
}

export function recalculatePowerAndStability(state: GameState) {
  let powerGen = state.resources.dieselFuel > 0 ? 22 : 0;
  let powerUse = 0;
  let bunksCount = 0;
  let hallsCount = 0;

  for (let y = SURFACE_ROW + 1; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const cell = state.grid[y][x];
      if (!cell.dug) {
        cell.unstable = false;
        cell.lit = false;
        continue;
      }

      // Check horizontal span distance to nearest support / undug wall / concrete
      let supported = cell.hasSupport || cell.material === 'concrete' || cell.room === 'door';
      if (!supported) {
        for (let dist = 1; dist <= 2; dist++) {
          const lx = x - dist;
          const rx = x + dist;
          if (lx >= 0) {
            const lc = state.grid[y][lx];
            if (!lc.dug || lc.hasSupport || lc.material === 'concrete' || lc.room === 'door') {
              supported = true;
              break;
            }
          } else {
            supported = true;
            break;
          }
          if (rx < GRID_COLS) {
            const rc = state.grid[y][rx];
            if (!rc.dug || rc.hasSupport || rc.material === 'concrete' || rc.room === 'door') {
              supported = true;
              break;
            }
          } else {
            supported = true;
            break;
          }
        }
      }
      cell.unstable = !supported;

      // Power accounting
      if (cell.room === 'pedal') {
        powerGen += 12;
      } else if (cell.room === 'turbine') {
        const nearWater =
          cell.waterLevel > 0.1 ||
          y >= 20 ||
          (x > 0 && state.grid[y][x - 1].waterLevel > 0.1) ||
          (x < GRID_COLS - 1 && state.grid[y][x + 1].waterLevel > 0.1);
        powerGen += nearWater ? 45 : 15;
      } else if (cell.room === 'bunk') {
        powerUse += 1;
        bunksCount += 1;
      } else if (cell.room === 'mushroom') {
        powerUse += 2;
      } else if (cell.room === 'well') {
        powerUse += 1;
      } else if (cell.room === 'clinic') {
        powerUse += 2;
      } else if (cell.room === 'hall') {
        powerUse += 3;
        hallsCount += 1;
      }
    }
  }

  const prevBlackout = state.blackout;
  state.resources.powerGen = powerGen;
  state.resources.powerUse = powerUse;
  state.blackout = powerGen < powerUse;

  if (!prevBlackout && state.blackout) {
    state.soundCueQueue.push('power_down');
  } else if (prevBlackout && !state.blackout) {
    state.soundCueQueue.push('power_up');
  }

  // Lighting propagates to dug tiles when not in blackout
  for (let y = SURFACE_ROW + 1; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const cell = state.grid[y][x];
      if (!cell.dug) continue;
      const isRoom = cell.room !== 'none' && cell.room !== 'support';
      cell.powered = !state.blackout;
      cell.lit = !state.blackout && (isRoom || cell.hasLadder || cell.material === 'concrete');
    }
  }

  // Housing capacity note
  void bunksCount;
  void hallsCount;
}

export function getHousingCapacity(state: GameState): number {
  let bunks = 0;
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (state.grid[y][x].room === 'bunk') bunks++;
    }
  }
  return Math.max(4, bunks * 12);
}

export function sendSurfaceExpedition(state: GameState): boolean {
  if (state.expeditionActive || state.expeditionCooldown > 0) return false;
  const scout = state.colonists.find((c) => c.alive && (c.id === 'eli' || c.role === 'Scout')) ||
    state.colonists.find((c) => c.alive);
  if (!scout) return false;

  state.expeditionActive = true;
  state.expeditionTimer = 5.5; // real seconds
  scout.task = 'scouting';
  addCallout(state, 21, SURFACE_ROW, `${scout.name} climbs to surface`, '#38bdf8');
  state.soundCueQueue.push('event');
  return true;
}

export function toggleLaw(state: GameState, lawId: LawId) {
  state.laws[lawId] = !state.laws[lawId];
  state.stats.lawsEnacted = Object.values(state.laws).filter(Boolean).length;
  state.soundCueQueue.push('paper');
}

export function resolveEventChoice(state: GameState, choiceId: string) {
  const ev = state.activeEvent;
  if (!ev) return;

  switch (ev.id) {
    case 'ch1_antibiotics': {
      if (choiceId === 'send_eli') {
        state.resources.meds += 15;
        state.resources.food += 18;
        state.stats.expeditionsCompleted += 1;
        addJournalNote(state, 'Eli', 'Slipped past two Walkers by the pharmacy. Brought back 15 doses of antibiotics!');
        addCallout(state, 21, 3, '+15 Meds · +18 Food', '#4ade80');
      } else {
        state.resources.water = Math.max(0, state.resources.water - 20);
        const walt = state.colonists.find((c) => c.id === 'walt');
        if (walt) walt.hp = Math.max(45, walt.hp - 20);
        addJournalNote(state, 'Nora', 'Walt fought off the fever with boiled water and rest. Close call.');
      }
      break;
    }
    case 'ch2_blackout': {
      if (choiceId === 'build_pedal_protocol') {
        state.resources.wood += 10;
        state.resources.steel += 6;
        state.resources.spirit = Math.min(100, state.resources.spirit + 4);
        addJournalNote(state, 'Ray', 'Four hours on the bike pedals buys a full day of bunker light.');
      } else {
        state.resources.spirit = Math.max(0, state.resources.spirit - 8);
      }
      break;
    }
    case 'ch3_strangers': {
      if (choiceId === 'admit_quarantine') {
        state.laws.quarantine_48h = true;
        state.population += 14;
        state.resources.ammo += 6;
        state.resources.food += 25;
        spawnNamedColonist(state, 'marcus', 'Marcus', 'Guard', 39, '#475569', '#1e293b', 'Former police sergeant. Hatch stays locked.');
        addJournalNote(state, 'Nora', 'We screened all 14 strangers in quarantine. Caught one hidden bite in time. Rule #1 stands.');
        state.newspapers.unshift(
          createNewspaper(
            'strangers_arrived',
            state.year,
            state.day,
            'FOURTEEN SURVIVORS ADMITTED UNDER RULE #1',
            '48-Hour Quarantine Prevents Night Outbreak',
            'Marcus’s group entered Hollow Creek after medical screening. Security protocols drafted.'
          )
        );
      } else if (choiceId === 'admit_immediate') {
        state.population += 12; // 2 lost in bite incident
        state.stats.fallenCount += 2;
        state.resources.spirit = Math.max(0, state.resources.spirit - 10);
        spawnNamedColonist(state, 'marcus', 'Marcus', 'Guard', 39, '#475569', '#1e293b', 'Lost two good people before we learned the hard way.');
        addJournalNote(state, 'Nora', 'One of the newcomers hid a bite. Marc and Hugo died in the night. Never again without quarantine.');
        state.cameraShake = 0.4;
      } else {
        state.resources.spirit = Math.max(0, state.resources.spirit - 18);
        addJournalNote(state, 'Nora', 'We left them at the hatch. The silence afterwards was worse than the scratching.');
      }
      break;
    }
    case 'ch5_trial': {
      if (choiceId === 'verdict_work') {
        state.laws.ration_tickets = true;
        state.unrest = Math.min(100, state.unrest + 10);
        addJournalNote(state, 'Council', 'Kofi Kim sentenced to 30 days farm labor. Ration Tickets enacted: no work, no second bowl.');
        state.newspapers.unshift(
          createNewspaper(
            'below_times_1',
            state.year,
            state.day,
            'THE BELOW TIMES: FIRST TRIAL IN COUNCIL HALL',
            '22 Guilty, 5 Not Guilty — Ration Tickets Enacted',
            'Citizens voted on the theft of emergency rations. Underground laws now govern all three work shifts.'
          )
        );
      } else if (choiceId === 'verdict_pardon') {
        state.resources.food = Math.max(0, state.resources.food - 25);
        state.resources.spirit = Math.min(100, state.resources.spirit + 10);
      } else {
        state.population = Math.max(1, state.population - 1);
        state.stats.fallenCount += 1;
        state.resources.spirit = Math.max(0, state.resources.spirit - 12);
      }
      break;
    }
    case 'ch5_hatch_breach': {
      state.laws.two_key_hatch = true;
      state.resources.ammo += 10;
      if (choiceId === 'two_key_exile') {
        state.population = Math.max(4, state.population - 6);
        state.stats.fallenCount += 6;
        addJournalNote(state, 'Marcus', 'Rick left the latch on half-cock. Five died in their sleep. He was exiled at dawn. Rule #2: Two keys.');
      } else {
        state.population = Math.max(4, state.population - 5);
        state.stats.fallenCount += 5;
        state.unrest = Math.min(100, state.unrest + 12);
      }
      state.cameraShake = 0.5;
      break;
    }
    case 'ch6_metro_breach': {
      if (choiceId === 'eli_sacrifice') {
        const eli = state.colonists.find((c) => c.id === 'eli');
        if (eli && eli.alive) {
          eli.alive = false;
          state.stats.fallenCount += 1;
        }
        state.population = Math.max(12, state.population - 18);
        state.stats.fallenCount += 18;
        for (const w of state.walkers) {
          if (w.zone === 'metro') w.active = false;
        }
        addJournalNote(state, 'Nora', 'Eli held the steel bulkhead from the outside while we flooded the metro shaft. We built the Memorial Wall in his name.');
        state.newspapers.unshift(
          createNewspaper(
            'metro_sacrifice',
            state.year,
            state.day,
            'METRO BREACH SEALED — ELI HONORED AT MEMORIAL WALL',
            'Lower Floodgates Hold Back Subterranean Swarm',
            'Eighteen citizens and founder Eli gave their lives sealing the eastern metro tunnel.'
          )
        );
      } else {
        state.resources.ammo = Math.max(0, state.resources.ammo - 25);
        state.population = Math.max(10, state.population - 32);
        state.stats.fallenCount += 32;
        for (const w of state.walkers) {
          if (w.zone === 'metro') w.active = false;
        }
        addJournalNote(state, 'Marcus', 'We fought them at the shaft mouth with everything we had. Heavy losses, but the line held.');
      }
      break;
    }
    case 'ch7_strike': {
      if (choiceId === 'sign_constitution') {
        state.laws.constitution = true;
        state.laws.curfew_22 = false;
        state.unrest = 5;
        state.resources.spirit = Math.min(100, state.resources.spirit + 26);
        addJournalNote(
          state,
          'Lily',
          'When I cut the turbine, the guards laid down their rifles. Today we signed the Underground Constitution: no one rules alone.'
        );
        state.newspapers.unshift(
          createNewspaper(
            'constitution_signed',
            state.year,
            state.day,
            'UNDERGROUND CONSTITUTION SIGNED AFTER BLACKOUT STRIKE',
            'Lily Restores Hydro Power as Security Rule Ends',
            'Miners led by Toby and Chief Engineer Lily forced open the guard storehouses and restored democratic Council elections.'
          )
        );
      } else {
        state.laws.curfew_22 = true;
        state.resources.ammo = Math.max(0, state.resources.ammo - 15);
        state.unrest = Math.min(100, state.unrest + 28);
        state.resources.spirit = Math.max(0, state.resources.spirit - 15);
      }
      break;
    }
    case 'ch8_referendum': {
      if (choiceId === 'approve_surface_garden') {
        state.laws.surface_charter = true;
        state.population = Math.max(state.population, 500);
        state.stats.peakPopulation = Math.max(state.stats.peakPopulation, state.population);
        state.stats.endingType = 'surface_reclaimed';
        state.victoryTriggered = true;
        state.phase = 'VICTORY';
        state.newspapers.unshift(
          createNewspaper(
            'year30_victory',
            30,
            state.day,
            'POPULATION 500: FIRST SPRING GARDEN ABOVE GROUND',
            '302 Votes For, 71 Against — Hollow Creek Steps Into Daylight',
            'With the birth of Felix and winter thinning the infected above, the City Below plants its first surface crop.'
          )
        );
      } else {
        state.stats.endingType = 'abyss_discovered';
        state.victoryTriggered = true;
        state.phase = 'VICTORY';
        state.newspapers.unshift(
          createNewspaper(
            'year30_abyss',
            30,
            state.day,
            'THE -128M DISCOVERY: WHAT LIES BELOW?',
            'Drillers Break Into Vast Warm Cavern Beneath Hollow Creek',
            'Citizens voted to remain anchored underground and explore the uncharted cavern stretching miles beneath the river.'
          )
        );
      }
      break;
    }
  }

  state.stats.lawsEnacted = Object.values(state.laws).filter(Boolean).length;
  state.stats.peakPopulation = Math.max(state.stats.peakPopulation, state.population);
  state.activeEvent = null;
  state.soundCueQueue.push('paper');
  recalculatePowerAndStability(state);
}

function spawnNamedColonist(
  state: GameState,
  id: string,
  name: string,
  role: Colonist['role'],
  age: number,
  color: string,
  hatColor: string,
  note: string
) {
  if (state.colonists.some((c) => c.id === id)) return;
  state.colonists.push({
    id,
    name,
    role,
    age,
    hp: 100,
    maxHp: 100,
    hunger: 15,
    thirst: 15,
    energy: 88,
    sick: false,
    quarantinedDays: 0,
    alive: true,
    isFounder: false,
    x: 21,
    y: 4,
    targetX: 20,
    targetY: 4,
    task: 'idle',
    workTimer: 0,
    walkPhase: 0,
    facing: 1,
    color,
    hatColor,
    note,
  });
}

function stepFluidSimulation(state: GameState, dt: number) {
  // Every ~0.4s tick, water flows gently from high cells to adjacent dug open cells if not blocked by a closed door
  if (Math.floor((state.timeOfDay + dt) * 3) === Math.floor(state.timeOfDay * 3)) return;

  let wellsCount = 0;
  for (let y = GRID_ROWS - 2; y >= SURFACE_ROW + 1; y--) {
    for (let x = 1; x < GRID_COLS - 1; x++) {
      const c = state.grid[y][x];
      if (c.room === 'well') wellsCount++;
      if (!c.dug || c.waterLevel <= 0.08) continue;
      if (c.room === 'door' && c.doorClosed) continue;

      // Flow down if open
      const below = state.grid[y + 1][x];
      if (below.dug && !(below.room === 'door' && below.doorClosed) && below.waterLevel < 0.95) {
        const transfer = Math.min(c.waterLevel * 0.35, 0.95 - below.waterLevel);
        c.waterLevel -= transfer;
        below.waterLevel += transfer;
      }

      // Flow sideways slightly
      for (const dx of [-1, 1]) {
        const side = state.grid[y][x + dx];
        if (side.dug && !(side.room === 'door' && side.doorClosed) && side.waterLevel + 0.06 < c.waterLevel) {
          const transfer = (c.waterLevel - side.waterLevel) * 0.22;
          c.waterLevel -= transfer;
          side.waterLevel += transfer;
        }
      }
    }
  }

  // Wells pump away nearby standing water
  if (wellsCount > 0) {
    for (let y = SURFACE_ROW + 1; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const c = state.grid[y][x];
        if (c.room === 'well' && c.waterLevel > 0) {
          c.waterLevel = Math.max(0, c.waterLevel - 0.08);
        }
      }
    }
  }
}

function stepColonists(state: GameState, dt: number) {
  // Collect marked dig sites & work stations
  const digTargets: GridCell[] = [];
  const workStations: GridCell[] = [];

  for (let y = SURFACE_ROW + 1; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const c = state.grid[y][x];
      if (c.markedForDig && !c.dug && isCellAdjacentToDug(state.grid, x, y)) {
        digTargets.push(c);
      }
      if (c.dug && (c.room === 'pedal' || c.room === 'mushroom' || c.room === 'clinic' || c.room === 'well')) {
        workStations.push(c);
      }
    }
  }

  for (const col of state.colonists) {
    if (!col.alive) continue;
    if (col.task === 'scouting') continue;

    // Assign target if idle or work finished
    if (col.task === 'idle' || col.workTimer <= 0) {
      if (digTargets.length > 0 && (col.role === 'Miner' || col.role === 'Citizen' || col.role === 'Scout' || digTargets.length > 1)) {
        // Pick closest adjacent dug cell to a marked dig tile
        const targetDig = digTargets[0];
        let standX = targetDig.x;
        let standY = targetDig.y;
        const dirs = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ];
        for (const [dx, dy] of dirs) {
          const nx = targetDig.x + dx;
          const ny = targetDig.y + dy;
          if (nx >= 0 && nx < GRID_COLS && ny > SURFACE_ROW && ny < GRID_ROWS && state.grid[ny][nx].dug) {
            standX = nx;
            standY = ny;
            break;
          }
        }
        col.targetX = standX;
        col.targetY = standY;
        col.task = 'digging';
        col.workTimer = 1.4;
      } else if (workStations.length > 0) {
        const station = workStations[Math.abs(col.id.charCodeAt(0) + state.day) % workStations.length];
        col.targetX = station.x;
        col.targetY = station.y;
        col.task =
          station.room === 'pedal'
            ? 'pedaling'
            : station.room === 'mushroom'
              ? 'farming'
              : station.room === 'clinic'
                ? 'healing'
                : 'resting';
        col.workTimer = 3.5;
      } else {
        col.targetX = 19 + ((col.id.charCodeAt(0) + state.day) % 5);
        col.targetY = 4;
        col.task = 'idle';
        col.workTimer = 2.0;
      }
    }

    // Move along Y via ladders / shafts, then X
    const speed = (col.role === 'Scout' ? 4.2 : 3.2) * dt;
    const dx = col.targetX - col.x;
    const dy = col.targetY - col.y;

    if (Math.abs(dy) > 0.12) {
      // Find nearest ladder on current row or move directly if same column
      const curY = Math.max(SURFACE_ROW, Math.min(GRID_ROWS - 1, Math.round(col.y)));
      let ladderX = Math.round(col.x);
      let bestDist = 999;
      for (let lx = 0; lx < GRID_COLS; lx++) {
        if (state.grid[curY][lx].hasLadder) {
          const d = Math.abs(lx - col.x);
          if (d < bestDist) {
            bestDist = d;
            ladderX = lx;
          }
        }
      }
      if (bestDist < 999 && Math.abs(ladderX - col.x) > 0.15) {
        const stepX = Math.sign(ladderX - col.x) * Math.min(speed, Math.abs(ladderX - col.x));
        col.x += stepX;
        col.facing = stepX >= 0 ? 1 : -1;
        col.walkPhase += Math.abs(stepX) * 5;
      } else {
        const stepY = Math.sign(dy) * Math.min(speed * 0.85, Math.abs(dy));
        col.y += stepY;
        col.walkPhase += Math.abs(stepY) * 4;
      }
    } else if (Math.abs(dx) > 0.12) {
      const stepX = Math.sign(dx) * Math.min(speed, Math.abs(dx));
      col.x += stepX;
      col.facing = stepX >= 0 ? 1 : -1;
      col.walkPhase += Math.abs(stepX) * 5;
    } else {
      // At destination
      col.workTimer -= dt;
      if (col.task === 'digging' && digTargets.length > 0) {
        // Advance nearest marked dig tile
        for (const dtCell of digTargets) {
          if (Math.abs(dtCell.x - col.x) <= 1.5 && Math.abs(dtCell.y - col.y) <= 1.5) {
            const digRate = col.role === 'Miner' ? 1.25 : 0.8;
            dtCell.digProgress += digRate * dt;
            if (dtCell.digProgress >= 1) {
              completeDigCell(state, dtCell.x, dtCell.y);
            }
            break;
          }
        }
      }
    }
  }
}

function stepWalkers(state: GameState, dt: number) {
  for (const w of state.walkers) {
    if (!w.active) continue;
    w.x += w.vx * dt;
    if (w.zone === 'surface') {
      if (w.x < 3 || w.x > GRID_COLS - 4) w.vx *= -1;
      // Avoid walking right past guarded hatch unless breaching
      if (Math.abs(w.x - 21) < 1.2 && state.grid[SURFACE_ROW][21].doorClosed) {
        w.vx *= -1;
      }
    } else {
      if (w.x < 24 || w.x > 38) w.vx *= -1;
    }
  }
}

function advanceOneDay(state: GameState) {
  state.day += 1;
  // Accelerated milestone calendar after Year 3 so 30-year arc plays briskly and smoothly
  const dayStepBonus = state.year >= 4 && !state.activeEvent ? 8 : 0;
  state.day += dayStepBonus;

  const newYear = Math.floor((state.day - 1) / DAYS_PER_YEAR) + 1;
  if (newYear > state.year) {
    state.year = newYear;
    state.stats.yearsSurvived = state.year;
    for (const c of state.colonists) {
      if (c.alive) c.age += 1;
    }
  }

  // Update weather by year
  state.weather = state.year >= 28 ? 'snow' : state.year % 2 === 0 ? 'rain' : 'overcast';

  // Count production rooms
  let mushroomFarms = 0;
  let wells = 0;
  let clinics = 0;
  let halls = 0;
  for (let y = SURFACE_ROW + 1; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const r = state.grid[y][x].room;
      if (r === 'mushroom') mushroomFarms++;
      else if (r === 'well') wells++;
      else if (r === 'clinic') clinics++;
      else if (r === 'hall') halls++;
    }
  }

  const daysScale = 1 + dayStepBonus;
  const popConsumptionScale = Math.max(1, Math.sqrt(state.population / 4));
  const rationMult = state.laws.ration_tickets ? 0.8 : 1.0;

  // Production & consumption per day (normalized to per-day rates for trend legibility)
  const dailyFoodProd = mushroomFarms * (state.blackout ? 2.5 : 5.5);
  const dailyFoodCons = 2.8 * popConsumptionScale * rationMult;
  const foodProd = dailyFoodProd * daysScale;
  const foodCons = dailyFoodCons * daysScale;
  state.resources.food = Math.max(0, Math.round((state.resources.food + foodProd - foodCons) * 10) / 10);

  const dailyWaterProd = wells * (state.blackout ? 4 : 8);
  const dailyWaterCons = 3.0 * popConsumptionScale;
  const waterProd = dailyWaterProd * daysScale;
  const waterCons = dailyWaterCons * daysScale;
  state.resources.water = Math.max(0, Math.round((state.resources.water + waterProd - waterCons) * 10) / 10);

  if (state.resources.dieselFuel > 0) {
    state.resources.dieselFuel = Math.max(0, state.resources.dieselFuel - daysScale);
    if (state.resources.dieselFuel === 0) {
      recalculatePowerAndStability(state);
    }
  }

  state.history = [
    ...state.history.slice(-59),
    {
      day: state.day,
      year: state.year,
      label: `Y${state.year} D${((state.day - 1) % DAYS_PER_YEAR) + 1}`,
      food: Math.round(state.resources.food),
      water: Math.round(state.resources.water),
      foodCons: Math.round(dailyFoodCons * 10) / 10,
      waterCons: Math.round(dailyWaterCons * 10) / 10,
      foodProd: Math.round(dailyFoodProd * 10) / 10,
      waterProd: Math.round(dailyWaterProd * 10) / 10,
      powerGen: Math.round(state.resources.powerGen),
      powerUse: Math.round(state.resources.powerUse),
      population: Math.round(state.population),
    },
  ];

  // Spirit & unrest
  let spiritDelta = 0;
  if (state.resources.food <= 0) spiritDelta -= 5;
  if (state.resources.water <= 0) spiritDelta -= 6;
  if (state.blackout) spiritDelta -= 2.5;
  if (halls > 0) spiritDelta += 1.2;
  if (state.laws.constitution) spiritDelta += 1.5;
  if (state.laws.curfew_22) spiritDelta -= 1.0;
  state.resources.spirit = Math.max(0, Math.min(100, Math.round(state.resources.spirit + spiritDelta)));

  // Starvation / dehydration loss if supplies stay at 0
  if (state.resources.food <= 0 || state.resources.water <= 0) {
    for (const c of state.colonists) {
      if (c.alive) c.hp -= 6;
    }
  } else if (clinics > 0) {
    for (const c of state.colonists) {
      if (c.alive && c.hp < c.maxHp) c.hp = Math.min(c.maxHp, c.hp + 4);
    }
  }

  for (const c of state.colonists) {
    if (c.alive && c.hp <= 0) {
      c.alive = false;
      state.stats.fallenCount += 1;
      state.population = Math.max(0, state.population - 1);
    }
  }

  // Organic population growth from radio & births when supplies & housing are healthy
  const cap = getHousingCapacity(state);
  if (state.year >= 3 && state.resources.food > 40 && state.resources.water > 30 && state.population < cap + state.year * 15) {
    const growth = state.year >= 10 ? 4 : state.year >= 5 ? 2 : 1;
    state.population = Math.min(500, state.population + growth);
  }
  state.stats.peakPopulation = Math.max(state.stats.peakPopulation, state.population);

  if (state.expeditionCooldown > 0) {
    state.expeditionCooldown = Math.max(0, state.expeditionCooldown - daysScale);
  }

  // Story timeline milestones
  checkNarrativeMilestones(state);

  // Defeat check
  const aliveCount = state.colonists.filter((c) => c.alive).length;
  if (aliveCount === 0 || state.population <= 0) {
    state.phase = 'GAME_OVER';
    state.stats.endingType = 'collapsed';
    state.gameOverReason = 'No survivors remain in Hollow Creek.';
    state.soundCueQueue.push('alarm');
  }
}

function checkNarrativeMilestones(state: GameState) {
  if (state.activeEvent) return;

  // Chapter 1 Day 22: Walt's Fever & Eli's Pharmacy Run
  if (state.day >= 22 && !state.triggeredEvents['ch1_antibiotics']) {
    state.triggeredEvents['ch1_antibiotics'] = true;
    state.activeEvent = NARRATIVE_EVENTS['ch1_antibiotics'];
    state.soundCueQueue.push('event');
    return;
  }

  // Chapter 2: Diesel runs out (~Day 380)
  if ((state.day >= 380 || state.resources.dieselFuel <= 0) && !state.triggeredEvents['ch2_blackout']) {
    state.triggeredEvents['ch2_blackout'] = true;
    state.chapter = Math.max(state.chapter, 2);
    state.chapterTitle = CHAPTER_NAMES[state.chapter];
    state.activeEvent = NARRATIVE_EVENTS['ch2_blackout'];
    state.soundCueQueue.push('power_down');
    return;
  }

  // Chapter 2 Day 520: Birth of Lily
  if (state.day >= 520 && !state.triggeredEvents['lily_born']) {
    state.triggeredEvents['lily_born'] = true;
    state.population += 1;
    spawnNamedColonist(state, 'lily', 'Lily', 'Engineer', 1, '#e89b3c', '#f59e0b', 'First child born underground.');
    addJournalNote(state, 'Nora', 'Lily was born today! Our first child beneath the earth. Population: ' + state.population);
  }

  // Chapter 3 Day 761: Strangers at the Hatch
  if (state.day >= 761 && !state.triggeredEvents['ch3_strangers']) {
    state.triggeredEvents['ch3_strangers'] = true;
    state.chapter = Math.max(state.chapter, 3);
    state.chapterTitle = CHAPTER_NAMES[state.chapter];
    state.activeEvent = NARRATIVE_EVENTS['ch3_strangers'];
    state.soundCueQueue.push('alarm');
    return;
  }

  // Year 6: Walt's passing
  if (state.year >= 6 && !state.triggeredEvents['walt_passes']) {
    state.triggeredEvents['walt_passes'] = true;
    const walt = state.colonists.find((c) => c.id === 'walt');
    if (walt && walt.alive) {
      walt.alive = false;
      state.stats.fallenCount += 1;
    }
    addJournalNote(state, 'Nora', 'Walt passed quietly from miner’s cough. We hung his yellow helmet in the Hall—no one forgets who taught us to dig.');
    state.newspapers.unshift(
      createNewspaper(
        'walt_memorial',
        state.year,
        state.day,
        'FOUNDER WALT LAID TO REST',
        'Miners Hang His Yellow Helmet in the Main Hall',
        'Hollow Creek mourns the master miner whose timber-prop rule kept sixty citizens safe beneath the clay.'
      )
    );
    state.soundCueQueue.push('paper');
  }

  // Year 9: Chapter 5 Trial of Kofi Kim
  if (state.year >= 9 && !state.triggeredEvents['ch5_trial']) {
    state.triggeredEvents['ch5_trial'] = true;
    state.chapter = Math.max(state.chapter, 5);
    state.chapterTitle = CHAPTER_NAMES[state.chapter];
    state.population = Math.max(state.population, 146);
    state.activeEvent = NARRATIVE_EVENTS['ch5_trial'];
    state.soundCueQueue.push('event');
    return;
  }

  // Year 10: Hatch Breach if Two-Key Seal not yet active
  if (state.year >= 10 && !state.triggeredEvents['ch5_hatch_breach'] && !state.laws.two_key_hatch) {
    state.triggeredEvents['ch5_hatch_breach'] = true;
    state.activeEvent = NARRATIVE_EVENTS['ch5_hatch_breach'];
    state.soundCueQueue.push('alarm');
    return;
  }

  // Year 13: Chapter 6 Metro Breach (if not already breached by digging)
  if (state.year >= 13 && !state.triggeredEvents['ch6_metro_breach']) {
    triggerMetroBreach(state);
    return;
  }

  // Year 18-21: Chapter 7 Ray passes & Lily's Strike
  if (state.year >= 18 && !state.triggeredEvents['ch7_strike']) {
    state.triggeredEvents['ch7_strike'] = true;
    state.chapter = Math.max(state.chapter, 7);
    state.chapterTitle = CHAPTER_NAMES[state.chapter];
    const ray = state.colonists.find((c) => c.id === 'ray');
    if (ray && ray.alive) {
      ray.alive = false;
      state.stats.fallenCount += 1;
    }
    const lily = state.colonists.find((c) => c.id === 'lily');
    if (lily) {
      lily.age = 19;
      lily.alive = true;
    } else {
      spawnNamedColonist(state, 'lily', 'Lily', 'Engineer', 19, '#e89b3c', '#f59e0b', 'Ray’s daughter. Keeper of the Hydro Turbine.');
    }
    state.activeEvent = NARRATIVE_EVENTS['ch7_strike'];
    state.soundCueQueue.push('power_down');
    return;
  }

  // Year 22+: Chapter 8 The City Below
  if (state.year >= 22 && state.chapter < 8) {
    state.chapter = 8;
    state.chapterTitle = CHAPTER_NAMES[8];
    state.population = Math.max(state.population, 324);
  }

  // Year 30: Surface Garden Referendum
  if (state.year >= 30 && !state.triggeredEvents['ch8_referendum']) {
    state.triggeredEvents['ch8_referendum'] = true;
    state.population = Math.max(state.population, 499);
    state.activeEvent = NARRATIVE_EVENTS['ch8_referendum'];
    state.soundCueQueue.push('event');
  }
}

export function stepSimulation(state: GameState, rawDt: number) {
  const dt = Math.min(rawDt, 0.05);

  // Decay camera shake and floating callouts even during hitstop/events
  state.cameraShake = Math.max(0, state.cameraShake - dt * 1.8);
  for (let i = state.floatingCallouts.length - 1; i >= 0; i--) {
    state.floatingCallouts[i].life -= dt;
    state.floatingCallouts[i].y -= dt * 0.45;
    if (state.floatingCallouts[i].life <= 0) {
      state.floatingCallouts.splice(i, 1);
    }
  }

  if (state.phase !== 'PLAYING' || state.speed === 0 || state.activeEvent) {
    return;
  }

  if (state.hitstopTimer > 0) {
    state.hitstopTimer = Math.max(0, state.hitstopTimer - dt);
    return;
  }

  const simDt = dt * state.speed;

  // Advance expedition
  if (state.expeditionActive) {
    state.expeditionTimer -= dt;
    if (state.expeditionTimer <= 0) {
      state.expeditionActive = false;
      state.expeditionCooldown = 35;
      state.stats.expeditionsCompleted += 1;
      state.resources.food += 22;
      state.resources.wood += 8;
      state.resources.steel += 5;
      state.resources.meds += 3;
      state.resources.ammo += 4;
      for (const c of state.colonists) {
        if (c.task === 'scouting') c.task = 'idle';
      }
      addCallout(state, 21, SURFACE_ROW, 'Scavenge Return: +22 Food +8 Wood +3 Meds', '#4ade80');
      state.soundCueQueue.push('build');
    }
  }

  // Advance unstable ceiling collapse timers
  for (let y = SURFACE_ROW + 1; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const c = state.grid[y][x];
      if (c.dug && c.unstable) {
        c.collapseTimer += simDt * 0.6;
        if (c.collapseTimer >= 16) {
          c.collapseTimer = 0;
          c.dug = false;
          c.material = 'topsoil';
          c.unstable = false;
          state.cameraShake = 0.7;
          state.hitstopTimer = 0.05;
          state.soundCueQueue.push('collapse');
          addCallout(state, x, y, `Cave-in at -${rowToDepthMeters(y)}m! Build Timber Props`, '#ef4444');
          recalculatePowerAndStability(state);
        }
      } else {
        c.collapseTimer = 0;
      }
    }
  }

  // Clock & Day cycle
  const prevHour = state.timeOfDay;
  state.timeOfDay += (24 / DAY_DURATION_SECONDS) * simDt;
  if (state.timeOfDay >= 24) {
    state.timeOfDay -= 24;
    advanceOneDay(state);
  } else if (prevHour < 12 && state.timeOfDay >= 12) {
    // Mid-day subtle check
  }

  stepFluidSimulation(state, simDt);
  stepColonists(state, simDt);
  stepWalkers(state, dt);
}
