import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStructure,
  createInitialGameState,
  markDigCell,
  completeDigCell,
  resolveEventChoice,
  stepSimulation,
  toggleLaw,
  recalculatePowerAndStability,
} from './simulation';
import { NARRATIVE_EVENTS } from './events';
import {
  CHAPTER_NAMES_I18N,
  LAW_DEFINITIONS_I18N,
  TOOLS_I18N,
  UI_TEXT,
  formatTrendLabel,
  localizeCallout,
  localizeEvent,
  localizeJournalNote,
  localizeNewspaper,
} from './i18n';

test('initial state boots with 4 founders and 540 food cans', () => {
  const state = createInitialGameState(true);
  assert.equal(state.phase, 'PLAYING');
  assert.equal(state.population, 4);
  assert.equal(state.colonists.filter((c) => c.alive).length, 4);
  assert.equal(state.resources.food, 540);
  assert.equal(state.year, 1);
  assert.equal(state.day, 1);
});

test('excavation marks adjacent cells and enforces structural stability rule', () => {
  const state = createInitialGameState(true);
  // Bunker is dug from x=18..24 at y=3..4. x=25, y=4 is adjacent to dug x=24, y=4
  const marked = markDigCell(state, 25, 4);
  assert.equal(marked, true);
  assert.equal(state.grid[4][25].markedForDig, true);

  // Far unattached cell cannot be dug
  const farMarked = markDigCell(state, 5, 10);
  assert.equal(farMarked, false);

  // Dig 6 cells right (25..30) without support -> middle cell x=27 exceeds 2-tile distance from x=24 concrete and x=31 wall
  for (let x = 25; x <= 30; x++) {
    completeDigCell(state, x, 4);
  }
  assert.equal(state.grid[4][27].unstable, true);

  // Building a Timber Prop at x=27 stabilizes the span
  const builtSupport = buildStructure(state, 27, 4, 'support');
  assert.equal(builtSupport, true);
  assert.equal(state.grid[4][27].unstable, false);
});

test('building mushroom farm & pedal dynamo updates resources and power balance', () => {
  const state = createInitialGameState(true);
  const woodBefore = state.resources.wood;
  const ok = buildStructure(state, 22, 4, 'mushroom');
  assert.equal(ok, true);
  assert.equal(state.grid[4][22].room, 'mushroom');
  assert.ok(state.resources.wood < woodBefore);

  // Exhaust diesel fuel -> powerGen drops to pedal dynamos only
  state.resources.dieselFuel = 0;
  recalculatePowerAndStability(state);
  assert.equal(state.resources.powerGen, 12); // starter pedal at (23,4)
});

test('narrative events and laws mutate state cleanly', () => {
  const state = createInitialGameState(true);
  state.activeEvent = NARRATIVE_EVENTS['ch3_strangers'];
  resolveEventChoice(state, 'admit_quarantine');
  assert.equal(state.activeEvent, null);
  assert.equal(state.laws.quarantine_48h, true);
  assert.equal(state.population, 18); // 4 + 14

  toggleLaw(state, 'ration_tickets');
  assert.equal(state.laws.ration_tickets, true);
});

test('simulation advances smoothly and records resource history trends', () => {
  const state = createInitialGameState(true);
  assert.equal(state.history.length, 1);
  for (let i = 0; i < 120; i++) {
    stepSimulation(state, 0.05);
  }
  assert.ok(state.day >= 3);
  assert.equal(state.phase, 'PLAYING');
  assert.ok(state.history.length >= 3);
  const latest = state.history[state.history.length - 1];
  assert.ok(latest.foodCons > 0);
  assert.ok(latest.waterCons > 0);
  assert.ok(latest.powerGen >= 0);
});

test('Czech localization covers chapters, tools, laws, events, journal, and callouts', () => {
  const state = createInitialGameState(true);
  assert.equal(CHAPTER_NAMES_I18N.cs[1], 'Kapitola 1 · Příklop');
  assert.equal(TOOLS_I18N.cs.dig.shortName, 'Kopat');
  assert.equal(LAW_DEFINITIONS_I18N.cs.quarantine_48h.number, 'Pravidlo 1');
  assert.equal(UI_TEXT.cs.startCta, 'Zahájit kolonii');

  const localizedEv = localizeEvent(NARRATIVE_EVENTS['ch1_antibiotics'], 'cs');
  assert.equal(localizedEv.title, 'Horečka v krytu');
  assert.equal(localizedEv.choices[0].label, 'Poslat Eliho do lékárny');

  const localizedNote = localizeJournalNote(state.journal[0], 'cs');
  assert.ok(localizedNote.text.includes('každé dva metry trám'));

  const localizedPaper = localizeNewspaper(state.newspapers[0], 'cs');
  assert.ok(localizedPaper.headline.includes('HOLLOW CREEK'));

  assert.equal(localizeCallout('Built Mushroom Farm', 'cs'), 'Postaveno: Houbová farma');
  assert.equal(formatTrendLabel('Y1 D1', 'cs'), 'R1 D1');
});
