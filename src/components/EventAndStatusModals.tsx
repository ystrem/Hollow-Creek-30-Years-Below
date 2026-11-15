import React from 'react';
import { rowToDepthMeters } from '../game/constants';
import {
  Language,
  UI_TEXT,
  localizeAcousticHint,
  localizeEvent,
  localizeGameOverReason,
  localizeMaterial,
  localizeRoomName,
} from '../game/i18n';
import { GameState } from '../game/types';

interface EventModalProps {
  state: GameState;
  lang: Language;
  onChoose: (choiceId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ state, lang, onChoose }) => {
  const rawEv = state.activeEvent;
  if (!rawEv) return null;
  const ev = localizeEvent(rawEv, lang);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-lg bg-[#151820] border border-[#3a3f4b] rounded shadow-2xl p-6">
        <div className="text-xs font-mono-tab uppercase tracking-wider text-[#e89b3c] mb-1">
          {ev.chapterTitle} · {ev.speaker}
        </div>
        <h2
          id="event-modal-title"
          className="font-display text-2xl font-bold text-[#f2ede4] tracking-wide mb-3"
        >
          {ev.title}
        </h2>
        <p className="text-sm text-[#d8d2c5] leading-relaxed mb-6">{ev.body}</p>

        <div className="space-y-2.5">
          {ev.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onChoose(choice.id)}
              className="w-full text-left p-3.5 rounded bg-[#1d222d] hover:bg-[#272e3d] border border-[#303746] hover:border-[#e89b3c] transition-colors cursor-pointer"
            >
              <div className="text-sm font-semibold text-[#f2ede4]">{choice.label}</div>
              <div className="text-xs text-[#94a3b8] mt-1 leading-snug">{choice.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface TileInspectorCardProps {
  state: GameState;
  lang: Language;
  onClose: () => void;
}

export const TileInspectorCard: React.FC<TileInspectorCardProps> = ({ state, lang, onClose }) => {
  if (!state.selectedCell) return null;
  const { x, y } = state.selectedCell;
  const cell = state.grid[y]?.[x];
  if (!cell) return null;

  const t = UI_TEXT[lang];
  const depth = rowToDepthMeters(y);
  return (
    <div className="fixed bottom-24 left-14 z-10 pointer-events-auto w-64 bg-[#14171d]/95 border border-[#2d333f] rounded p-3 shadow-lg">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono-tab font-semibold text-[#e89b3c]">
          {t.sector} ({x}, -{depth}m)
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[#94a3b8] hover:text-white cursor-pointer"
          aria-label={t.dismiss}
        >
          {t.dismiss}
        </button>
      </div>
      <div className="text-xs text-[#d8d2c5] space-y-1">
        <div>
          {t.strata}: <span className="font-semibold capitalize">{localizeMaterial(cell.material, lang)}</span>
        </div>
        <div>
          {t.status}:{' '}
          <span className={cell.unstable ? 'text-[#f87171] font-semibold' : 'text-[#4ade80]'}>
            {!cell.dug
              ? cell.markedForDig
                ? t.markedDig
                : t.solidEarth
              : cell.unstable
                ? t.unstableCeiling
                : t.proppedSafe}
          </span>
        </div>
        {cell.room !== 'none' && (
          <div>
            {t.structure}: <span className="font-semibold capitalize">{localizeRoomName(cell.room, lang)}</span>
          </div>
        )}
        {cell.waterLevel > 0.05 && (
          <div className="text-[#38bdf8]">
            {t.waterSat}: {Math.round(cell.waterLevel * 100)}%
          </div>
        )}
        {!cell.dug && cell.acousticHint !== 'none' && (
          <div className="text-[#fbbf24]">
            {t.acousticCheck}: {localizeAcousticHint(cell.acousticHint, lang)}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatusModalProps {
  state: GameState;
  lang: Language;
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  state,
  lang,
  onResume,
  onRestart,
  onTitle,
}) => {
  const t = UI_TEXT[lang];

  if (state.phase === 'PAUSED') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4"
      >
        <div className="w-full max-w-sm bg-[#151820] border border-[#3a3f4b] rounded shadow-2xl p-6 text-center">
          <div className="text-xs font-mono-tab uppercase tracking-widest text-[#e89b3c] mb-1">
            {t.year} {state.year} · {t.day} {state.day}
          </div>
          <h2 id="pause-title" className="font-display text-3xl font-bold text-[#f2ede4] mb-5">
            {t.pausedTitle}
          </h2>
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-2.5 bg-[#e89b3c] hover:bg-[#f0ad54] text-[#111317] font-semibold rounded cursor-pointer"
            >
              {t.resume}
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="w-full py-2.5 bg-[#202530] hover:bg-[#2a3140] text-[#f2ede4] font-semibold rounded border border-[#323846] cursor-pointer"
            >
              {t.restart}
            </button>
            <button
              type="button"
              onClick={onTitle}
              className="w-full py-2.5 bg-transparent hover:bg-[#1d222c] text-[#94a3b8] font-medium rounded cursor-pointer"
            >
              {t.returnTitle}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === 'VICTORY' || state.phase === 'GAME_OVER') {
    const isVictory = state.phase === 'VICTORY';
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="endgame-title"
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4"
      >
        <div className="w-full max-w-md bg-[#151820] border border-[#3a3f4b] rounded shadow-2xl p-6">
          <div
            className={`text-xs font-mono-tab uppercase tracking-widest mb-1 ${
              isVictory ? 'text-[#4ade80]' : 'text-[#f87171]'
            }`}
          >
            {isVictory ? t.victoryTag : t.lostTag}
          </div>
          <h2 id="endgame-title" className="font-display text-3xl font-bold text-[#f2ede4] mb-2">
            {isVictory
              ? state.stats.endingType === 'surface_reclaimed'
                ? t.victorySurface
                : t.victoryAbyss
              : t.lostTitle}
          </h2>
          <p className="text-sm text-[#cbd5e1] mb-5 leading-relaxed">
            {isVictory
              ? state.stats.endingType === 'surface_reclaimed'
                ? t.victorySurfaceBody
                : t.victoryAbyssBody
              : localizeGameOverReason(state.gameOverReason, lang)}
          </p>

          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <StatTile label={t.statYears} value={state.stats.yearsSurvived} />
            <StatTile label={t.statPeakPop} value={state.stats.peakPopulation} />
            <StatTile label={t.statRooms} value={state.stats.roomsBuilt} />
            <StatTile label={t.statExcavated} value={state.stats.tilesExcavated} />
            <StatTile label={t.statLaws} value={state.stats.lawsEnacted} />
            <StatTile label={t.statFallen} value={state.stats.fallenCount} />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="flex-1 py-2.5 bg-[#e89b3c] hover:bg-[#f0ad54] text-[#111317] font-display font-bold uppercase tracking-wider rounded cursor-pointer"
            >
              {t.playAgain}
            </button>
            <button
              type="button"
              onClick={onTitle}
              className="px-4 py-2.5 bg-[#202530] hover:bg-[#2a3140] text-[#f2ede4] font-medium rounded border border-[#323846] cursor-pointer"
            >
              {t.titleBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const StatTile: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-[#1b1f28] border border-[#2a303c] rounded p-2.5 text-center">
    <div className="text-[10px] uppercase tracking-wider text-[#94a3b8]">{label}</div>
    <div className="text-lg font-bold font-mono-tab text-[#f2ede4]">{Math.round(value)}</div>
  </div>
);
