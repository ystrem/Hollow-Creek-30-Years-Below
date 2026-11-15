import { ToolId } from './types';

export const GRID_COLS = 44;
export const GRID_ROWS = 40;
export const TILE_SIZE = 34;

// Depth mapping: row 2 is surface ground (0m), each row below is ~3.45m down to -128m at row 39
export const SURFACE_ROW = 2;

export function rowToDepthMeters(row: number): number {
  if (row <= SURFACE_ROW) return 0;
  return Math.round(((row - SURFACE_ROW) / (GRID_ROWS - 1 - SURFACE_ROW)) * 128);
}

export interface ToolDef {
  id: ToolId;
  name: string;
  hotkey: string;
  roleClue: string;
  woodCost: number;
  steelCost: number;
  powerUse: number;
  requiresDug: boolean;
}

export const TOOLS: ToolDef[] = [
  {
    id: 'inspect',
    name: 'Inspect',
    hotkey: '1',
    roleClue: 'Check strata & acoustic hints',
    woodCost: 0,
    steelCost: 0,
    powerUse: 0,
    requiresDug: false,
  },
  {
    id: 'dig',
    name: 'Excavate',
    hotkey: '2',
    roleClue: 'Dig earth · Listen for hazards',
    woodCost: 0,
    steelCost: 0,
    powerUse: 0,
    requiresDug: false,
  },
  {
    id: 'ladder',
    name: 'Ladder',
    hotkey: '3',
    roleClue: 'Vertical shaft access',
    woodCost: 2,
    steelCost: 0,
    powerUse: 0,
    requiresDug: true,
  },
  {
    id: 'support',
    name: 'Timber Prop',
    hotkey: '4',
    roleClue: 'Prevents ceiling cave-ins',
    woodCost: 3,
    steelCost: 0,
    powerUse: 0,
    requiresDug: true,
  },
  {
    id: 'bunk',
    name: 'Bunks',
    hotkey: '5',
    roleClue: 'Housing (+4 pop cap · Rest)',
    woodCost: 5,
    steelCost: 1,
    powerUse: 1,
    requiresDug: true,
  },
  {
    id: 'mushroom',
    name: 'Mushroom Farm',
    hotkey: '6',
    roleClue: 'Grows steady underground food',
    woodCost: 4,
    steelCost: 1,
    powerUse: 2,
    requiresDug: true,
  },
  {
    id: 'well',
    name: 'Well / Pump',
    hotkey: '7',
    roleClue: 'Extracts clean water from clay/river',
    woodCost: 4,
    steelCost: 2,
    powerUse: 1,
    requiresDug: true,
  },
  {
    id: 'pedal',
    name: 'Pedal Dynamo',
    hotkey: '8',
    roleClue: 'Manual bike power (+12W)',
    woodCost: 3,
    steelCost: 3,
    powerUse: 0,
    requiresDug: true,
  },
  {
    id: 'turbine',
    name: 'Hydro Turbine',
    hotkey: '9',
    roleClue: 'River power (+45W · Place on water)',
    woodCost: 6,
    steelCost: 8,
    powerUse: 0,
    requiresDug: true,
  },
  {
    id: 'clinic',
    name: 'Clinic',
    hotkey: '0',
    roleClue: 'Treats wounds & silicosis',
    woodCost: 5,
    steelCost: 3,
    powerUse: 2,
    requiresDug: true,
  },
  {
    id: 'door',
    name: 'Steel Bulkhead',
    hotkey: 'B',
    roleClue: 'Seals floods & Metro Walkers',
    woodCost: 1,
    steelCost: 5,
    powerUse: 0,
    requiresDug: true,
  },
  {
    id: 'hall',
    name: 'Council Hall',
    hotkey: 'H',
    roleClue: 'Boosts Spirit & holds trials',
    woodCost: 8,
    steelCost: 4,
    powerUse: 3,
    requiresDug: true,
  },
];

export const CHAPTER_NAMES: Record<number, string> = {
  1: 'Chapter 1 · The Hatch',
  2: 'Chapter 2 · Roots',
  3: 'Chapter 3 · Strangers',
  4: 'Chapter 4 · The Deep',
  5: 'Chapter 5 · Rules & Law',
  6: 'Chapter 6 · The Breach',
  7: 'Chapter 7 · Two Cities',
  8: 'Chapter 8 · The City Below',
};

export const LAW_DEFINITIONS: Array<{
  id: 'quarantine_48h' | 'ration_tickets' | 'two_key_hatch' | 'curfew_22' | 'constitution' | 'surface_charter';
  number: string;
  title: string;
  effect: string;
}> = [
  {
    id: 'quarantine_48h',
    number: 'Rule #1',
    title: '48-Hour Quarantine',
    effect: 'New arrivals are screened before entering dorms. Prevents hidden bite outbreaks.',
  },
  {
    id: 'two_key_hatch',
    number: 'Rule #2',
    title: 'Two-Key Hatch Seal',
    effect: 'Dual guards lock the surface hatch every dusk. Stops night Walker infiltrations.',
  },
  {
    id: 'ration_tickets',
    number: 'Rule #3',
    title: 'Ration Ticket Ledger',
    effect: 'Cuts daily food consumption by 20%, but increases worker unrest if Spirit falls.',
  },
  {
    id: 'curfew_22',
    number: 'Rule #4',
    title: '22:00 Sector Curfew',
    effect: 'Tightens security control during dark hours. Reduces Spirit by 6% while active.',
  },
  {
    id: 'constitution',
    number: 'Charter',
    title: 'Underground Constitution',
    effect: 'Restores open Council voting and equal rations. Stabilizes Spirit across all strata.',
  },
  {
    id: 'surface_charter',
    number: 'Referendum',
    title: 'Surface Garden Charter',
    effect: 'Authorizes spring cultivation above ground once snow clears the infected.',
  },
];

export const DAY_DURATION_SECONDS = 2.4; // 1 game day = 2.4 real seconds at 1x speed (smooth pace across 30 years)
export const DAYS_PER_YEAR = 365;
