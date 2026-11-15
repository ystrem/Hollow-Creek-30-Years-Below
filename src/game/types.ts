export type GamePhase = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export type ToolId =
  | 'inspect'
  | 'dig'
  | 'ladder'
  | 'support'
  | 'bunk'
  | 'mushroom'
  | 'well'
  | 'pedal'
  | 'turbine'
  | 'clinic'
  | 'door'
  | 'hall';

export type MaterialType =
  | 'sky'
  | 'surface'
  | 'topsoil'
  | 'clay'
  | 'coal_rock'
  | 'limestone'
  | 'metro_ruin'
  | 'deep_bedrock'
  | 'void_cavern'
  | 'air'
  | 'concrete'
  | 'water_vein'
  | 'mycelium';

export type RoomType =
  | 'none'
  | 'hatch'
  | 'ladder'
  | 'support'
  | 'bunk'
  | 'mushroom'
  | 'well'
  | 'pedal'
  | 'turbine'
  | 'clinic'
  | 'door'
  | 'hall'
  | 'quarantine';

export interface GridCell {
  x: number;
  y: number;
  material: MaterialType;
  dug: boolean;
  room: RoomType;
  hasLadder: boolean;
  hasSupport: boolean;
  doorClosed: boolean;
  waterLevel: number; // 0 to 1
  lit: boolean;
  powered: boolean;
  digProgress: number; // 0 to 1
  markedForDig: boolean;
  unstable: boolean;
  collapseTimer: number;
  revealed: boolean;
  acousticHint: 'none' | 'hollow' | 'water' | 'scratching' | 'abyss';
  coalDeposit: boolean;
}

export type ColonistRole = 'Miner' | 'Engineer' | 'Medic' | 'Scout' | 'Guard' | 'Farmer' | 'Citizen';

export type ColonistTask =
  | 'idle'
  | 'digging'
  | 'pedaling'
  | 'farming'
  | 'healing'
  | 'guarding'
  | 'resting'
  | 'scouting'
  | 'walking';

export interface Colonist {
  id: string;
  name: string;
  role: ColonistRole;
  age: number;
  hp: number;
  maxHp: number;
  hunger: number; // 0 = full, 100 = starving
  thirst: number; // 0 = hydrated, 100 = dehydrated
  energy: number; // 0 = exhausted, 100 = rested
  sick: boolean;
  quarantinedDays: number;
  alive: boolean;
  isFounder: boolean;
  x: number; // grid x (float)
  y: number; // grid y (float)
  targetX: number;
  targetY: number;
  task: ColonistTask;
  workTimer: number;
  walkPhase: number;
  facing: 1 | -1;
  color: string;
  hatColor: string;
  note: string;
}

export interface Walker {
  id: string;
  x: number;
  y: number;
  vx: number;
  hp: number;
  zone: 'surface' | 'metro';
  active: boolean;
}

export interface Resources {
  food: number;       // rations/cans
  water: number;      // liters
  wood: number;       // timber beams
  steel: number;      // scrap/rails
  meds: number;       // doses
  ammo: number;       // rounds
  powerGen: number;   // watts produced
  powerUse: number;   // watts consumed
  dieselFuel: number; // generator fuel days
  spirit: number;     // 0 - 100
}

export type LawId =
  | 'quarantine_48h'
  | 'ration_tickets'
  | 'two_key_hatch'
  | 'curfew_22'
  | 'constitution'
  | 'surface_charter';

export interface JournalNote {
  id: string;
  day: number;
  year: number;
  author: string;
  text: string;
}

export interface NewspaperIssue {
  id: string;
  year: number;
  day: number;
  headline: string;
  subhead: string;
  body: string;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  tone?: 'neutral' | 'cautious' | 'bold' | 'strict';
}

export interface NarrativeEvent {
  id: string;
  chapter: number;
  chapterTitle: string;
  title: string;
  speaker: string;
  body: string;
  choices: EventChoice[];
}

export interface FloatingCallout {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity: number;
}

export interface ColonyStats {
  yearsSurvived: number;
  peakPopulation: number;
  tilesExcavated: number;
  roomsBuilt: number;
  lawsEnacted: number;
  fallenCount: number;
  expeditionsCompleted: number;
  chapterReached: number;
  endingType: 'surface_reclaimed' | 'abyss_discovered' | 'collapsed' | 'ongoing';
}

export interface ResourceHistoryPoint {
  day: number;
  year: number;
  label: string;
  food: number;
  water: number;
  foodCons: number;
  waterCons: number;
  foodProd: number;
  waterProd: number;
  powerGen: number;
  powerUse: number;
  population: number;
}

export interface GameState {
  phase: GamePhase;
  speed: 0 | 1 | 2 | 4;
  day: number;
  year: number;
  timeOfDay: number; // 0..24 hours
  chapter: number;
  chapterTitle: string;
  population: number; // total citizens (visual actors + abstract district citizens at high pop)
  resources: Resources;
  history: ResourceHistoryPoint[];
  grid: GridCell[][]; // [y][x]
  colonists: Colonist[];
  walkers: Walker[];
  laws: Record<LawId, boolean>;
  activeEvent: NarrativeEvent | null;
  triggeredEvents: Record<string, boolean>;
  activeNewspaper: NewspaperIssue | null;
  newspapers: NewspaperIssue[];
  journal: JournalNote[];
  selectedTool: ToolId;
  selectedCell: { x: number; y: number } | null;
  expeditionCooldown: number; // days remaining
  expeditionActive: boolean;
  expeditionTimer: number;
  blackout: boolean;
  unrest: number; // 0 - 100 social tension
  weather: 'rain' | 'overcast' | 'snow';
  surfaceWalkersThreat: number;
  cctvAlert: string | null;
  stats: ColonyStats;
  soundCueQueue: Array<'dig' | 'build' | 'water' | 'alarm' | 'power_down' | 'power_up' | 'event' | 'paper' | 'collapse'>;
  cameraShake: number;
  hitstopTimer: number;
  floatingCallouts: FloatingCallout[];
  nextCalloutId: number;
  victoryTriggered: boolean;
  gameOverReason: string | null;
}
