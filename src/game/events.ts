import { NarrativeEvent, NewspaperIssue } from './types';

export const NARRATIVE_EVENTS: Record<string, NarrativeEvent> = {
  ch1_antibiotics: {
    id: 'ch1_antibiotics',
    chapter: 1,
    chapterTitle: 'Chapter 1 · The Hatch',
    title: 'Fever in the Bunker',
    speaker: 'Nora · Medic',
    body: 'Walt cut his forearm bracing a ceiling beam, and the wound is burning with fever. Without antibiotics from the surface pharmacy, we lose our only miner.',
    choices: [
      {
        id: 'send_eli',
        label: 'Send Eli to the Pharmacy',
        description: 'Eli slips out past the surface Walkers. High chance of +15 Meds, minor injury risk.',
        tone: 'bold',
      },
      {
        id: 'treat_below',
        label: 'Treat with Boiled Water & Rest',
        description: 'Keep the hatch locked. Uses 20 Water and slows Walt for a week.',
        tone: 'cautious',
      },
    ],
  },
  ch2_blackout: {
    id: 'ch2_blackout',
    chapter: 2,
    chapterTitle: 'Chapter 2 · Roots',
    title: 'The Diesel Runs Dry',
    speaker: 'Ray · Engineer',
    body: 'The emergency diesel generator just choked on its last drop. Without power, the lamps die and the mushroom shelves go cold. I can wire car alternators to bicycle frames.',
    choices: [
      {
        id: 'build_pedal_protocol',
        label: 'Organize Pedal Shifts',
        description: 'Ray rigs an extra Pedal Dynamo (+12 Wood/Steel salvaged, Spirit steady).',
        tone: 'bold',
      },
      {
        id: 'conserve_dark',
        label: 'Ration Lamp Hours',
        description: 'Endure partial darkness to save effort. Spirit -8.',
        tone: 'cautious',
      },
    ],
  },
  ch3_strangers: {
    id: 'ch3_strangers',
    chapter: 3,
    chapterTitle: 'Chapter 3 · Strangers',
    title: 'Fourteen Voices at the Hatch',
    speaker: 'Marcus · Former Officer',
    body: 'This is not scratching—someone is knocking with an iron pipe. Fourteen survivors, including three children, are begging to come down. Food is tight, and anyone could be bitten.',
    choices: [
      {
        id: 'admit_quarantine',
        label: 'Open Hatch & Enforce 48h Quarantine',
        description: 'Enacts Rule #1 (48h Quarantine). +14 Population, +6 Ammo, prevents outbreak.',
        tone: 'cautious',
      },
      {
        id: 'admit_immediate',
        label: 'Let Them Straight In',
        description: '+14 Population immediately, but risk a hidden bite incident overnight.',
        tone: 'bold',
      },
      {
        id: 'turn_away',
        label: 'Keep the Hatch Sealed',
        description: 'Preserve rations and safety, but Spirit drops sharply (-18).',
        tone: 'strict',
      },
    ],
  },
  ch5_trial: {
    id: 'ch5_trial',
    chapter: 5,
    chapterTitle: 'Chapter 5 · Rules & Law',
    title: 'Trial of Kofi Kim',
    speaker: 'Council of Five',
    body: 'Rations are stretched across 140 souls. Kofi Kim was caught carrying a stolen crate of canned food toward the lower bunks. The Hall awaits your verdict and ration policy.',
    choices: [
      {
        id: 'verdict_work',
        label: '30 Days Farm Labor & Enact Ration Tickets',
        description: 'Enacts Rule #3 (Ration Tickets: -20% food drain). Fair order, slight miner tension.',
        tone: 'cautious',
      },
      {
        id: 'verdict_pardon',
        label: 'Pardon & Share Emergency Reserves',
        description: 'Boosts Spirit (+10), consumes 25 Food.',
        tone: 'neutral',
      },
      {
        id: 'verdict_exile',
        label: 'Exile to the Surface',
        description: 'Harsh deterrence: reduces unrest but damages Spirit (-12).',
        tone: 'strict',
      },
    ],
  },
  ch5_hatch_breach: {
    id: 'ch5_hatch_breach',
    chapter: 5,
    chapterTitle: 'Chapter 5 · Rules & Law',
    title: 'Negligence at the Latch',
    speaker: 'Marcus · Hatch Guard',
    body: 'Night watchman Rick left the upper latch half-cocked. Walkers forced the shaft before dawn. Five sleepers were lost before we drove them back.',
    choices: [
      {
        id: 'two_key_exile',
        label: 'Enact Two-Key Seal & Exile Rick',
        description: 'Enacts Rule #2 (Two-Key Hatch). Prevents future surface raids. +10 Ammo.',
        tone: 'strict',
      },
      {
        id: 'imprison_rick',
        label: 'Enact Two-Key Seal & Detain Below',
        description: 'Enacts Rule #2. Keeps population intact, slight unrest.',
        tone: 'cautious',
      },
    ],
  },
  ch6_metro_breach: {
    id: 'ch6_metro_breach',
    chapter: 6,
    chapterTitle: 'Chapter 6 · The Breach',
    title: 'The Metro Awakening',
    speaker: 'Eli · Senior Scout',
    body: 'Our eastern pickaxes broke through into a collapsed subway line—and it is packed with hibernating infected! They are pouring up the shaft. Someone must hold the bulkhead gear from the outside!',
    choices: [
      {
        id: 'eli_sacrifice',
        label: 'Seal Bulkhead & Flood Lower Tunnels',
        description: 'Eli holds the steel door so the city survives. Heavy losses avoided, Memorial Wall raised.',
        tone: 'bold',
      },
      {
        id: 'stand_fight',
        label: 'Form Firing Line at the Shaft',
        description: 'Burns 25 Ammo and takes heavy casualties, but Eli may survive.',
        tone: 'strict',
      },
    ],
  },
  ch7_strike: {
    id: 'ch7_strike',
    chapter: 7,
    chapterTitle: 'Chapter 7 · Two Cities',
    title: 'Lily Cuts the Turbine',
    speaker: 'Lily · Chief Hydro Engineer',
    body: 'Marcus dissolved the Council and cut lower-strata rations in half. Now the miners are on strike, and Ray’s daughter Lily has thrown the main river breaker. The whole city is dark.',
    choices: [
      {
        id: 'sign_constitution',
        label: 'Restore Power & Sign the Constitution',
        description: 'Enacts Underground Constitution. Ends tyranny, restores Spirit (+25), equalizes rations.',
        tone: 'bold',
      },
      {
        id: 'martial_crackdown',
        label: 'Back Marcus’s Security Council',
        description: 'Enacts 22:00 Curfew. Forces miners back with Ammo (-15), deep unrest rises.',
        tone: 'strict',
      },
    ],
  },
  ch8_referendum: {
    id: 'ch8_referendum',
    chapter: 8,
    chapterTitle: 'Chapter 8 · The City Below',
    title: 'Year 30: The Surface Referendum',
    speaker: 'Lily · Mayor of Hollow Creek',
    body: 'Snow blankets the ruins above. Through the periscope we spotted only three Walkers all month—the winter finished most of them. Over 300 citizens have gathered in the Hall to vote.',
    choices: [
      {
        id: 'approve_surface_garden',
        label: 'Plant the Spring Surface Garden',
        description: 'Enacts Surface Garden Charter. Reclaim daylight and complete the 30-year survival!',
        tone: 'bold',
      },
      {
        id: 'keep_digging_deep',
        label: 'Focus on the -128m Deep Drill',
        description: 'Keep the city below and investigate the massive void detected beneath the bedrock.',
        tone: 'cautious',
      },
    ],
  },
};

export function createNewspaper(
  id: string,
  year: number,
  day: number,
  headline: string,
  subhead: string,
  body: string
): NewspaperIssue {
  return { id, year, day, headline, subhead, body };
}
