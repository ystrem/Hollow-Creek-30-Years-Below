import React from 'react';
import { CHAPTER_NAMES_I18N, Language, UI_TEXT } from '../game/i18n';
import { GameState } from '../game/types';
import { getHousingCapacity } from '../game/simulation';

interface TopHudProps {
  state: GameState;
  lang: Language;
  muted: boolean;
  onSetSpeed: (speed: 0 | 1 | 2 | 4) => void;
  onToggleMute: () => void;
  onToggleLang: () => void;
  onResetView: () => void;
  onOpenPause: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  state,
  lang,
  muted,
  onSetSpeed,
  onToggleMute,
  onToggleLang,
  onResetView,
  onOpenPause,
}) => {
  const t = UI_TEXT[lang];
  const { resources, day, year, timeOfDay, population, chapter, blackout } = state;
  const housingCap = getHousingCapacity(state);
  const shiftIdx = Math.min(3, Math.max(0, Math.floor(timeOfDay / 6)));
  const shiftLabel = t.shifts[shiftIdx];
  const chapterLabel = CHAPTER_NAMES_I18N[lang][chapter] || state.chapterTitle;

  return (
    <header className="fixed top-0 left-0 right-0 z-10 pointer-events-none px-3 pt-2.5 flex items-start justify-between gap-3">
      {/* Left Cluster: Calendar & Population */}
      <div className="pointer-events-auto flex items-center gap-4 bg-[#14171d]/95 border border-[#2a303a] px-3.5 py-2 rounded shadow-md">
        <div>
          <div className="text-[11px] font-mono-tab uppercase tracking-wider text-[#e89b3c]">
            {chapterLabel}
          </div>
          <div className="text-sm font-semibold font-mono-tab text-[#f2ede4] flex items-center gap-2 whitespace-nowrap">
            <span>{t.year} {year}</span>
            <span aria-hidden="true" className="text-[#64748b]">·</span>
            <span>{t.day} {day}</span>
            <span aria-hidden="true" className="text-[#64748b]">·</span>
            <span>{shiftLabel}</span>
          </div>
        </div>

        <div className="h-7 w-px bg-[#2a303a]" />

        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#94a3b8]">{t.citizens}</div>
          <div className="text-base font-bold font-mono-tab text-[#f2ede4] whitespace-nowrap">
            {Math.round(population)}
            <span className="text-xs font-normal text-[#94a3b8]"> / {Math.max(housingCap, population)}</span>
          </div>
        </div>
      </div>

      {/* Center Cluster: Core Colony Supplies */}
      <div className="pointer-events-auto hidden md:flex items-center gap-4 bg-[#14171d]/95 border border-[#2a303a] px-4 py-2 rounded shadow-md">
        <ResourceStat
          label={t.food}
          value={Math.round(resources.food)}
          warn={resources.food < 30}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path d="M5 7h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7z" fill="#d97706" stroke="#111317" strokeWidth="1.5" />
              <path d="M7 4h10v3H7z" fill="#fbbf24" stroke="#111317" strokeWidth="1.5" />
            </svg>
          }
        />
        <ResourceStat
          label={t.water}
          value={Math.round(resources.water)}
          warn={resources.water < 25}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path d="M12 3s6 7.2 6 11.5a6 6 0 1 1-12 0C6 10.2 12 3 12 3z" fill="#38bdf8" stroke="#111317" strokeWidth="1.5" />
            </svg>
          }
        />
        <ResourceStat
          label={t.wood}
          value={Math.round(resources.wood)}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
              <rect x="4" y="6" width="16" height="5" rx="1" fill="#b45309" stroke="#111317" strokeWidth="1.5" />
              <rect x="4" y="13" width="16" height="5" rx="1" fill="#92400e" stroke="#111317" strokeWidth="1.5" />
            </svg>
          }
        />
        <ResourceStat
          label={t.steel}
          value={Math.round(resources.steel)}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path d="M5 6h14v3H14v6h5v3H5v-3h5V9H5V6z" fill="#94a3b8" stroke="#111317" strokeWidth="1.5" />
            </svg>
          }
        />
        <ResourceStat
          label={t.power}
          value={`${Math.round(resources.powerGen)}/${Math.round(resources.powerUse)}W`}
          warn={blackout}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path d="M13 2L5 14h6l-1 8 9-12h-6l0-8z" fill={blackout ? '#ef4444' : '#facc15'} stroke="#111317" strokeWidth="1.5" />
            </svg>
          }
        />
        <ResourceStat
          label={t.meds}
          value={Math.round(resources.meds)}
          warn={resources.meds <= 1}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="2" fill="#e2e8f0" stroke="#111317" strokeWidth="1.5" />
              <path d="M10 7h4v3h3v4h-3v3h-4v-3H7v-4h3V7z" fill="#ef4444" />
            </svg>
          }
        />
        <ResourceStat
          label={t.spirit}
          value={`${Math.round(resources.spirit)}%`}
          warn={resources.spirit < 35}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#4ade80" stroke="#111317" strokeWidth="1.5" />
            </svg>
          }
        />
      </div>

      {/* Right Cluster: Speed, Language, Mute, Pause */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-[#14171d]/95 border border-[#2a303a] p-1.5 rounded shadow-md">
        {([0, 1, 2, 4] as const).map((spd) => {
          const active = state.speed === spd;
          return (
            <button
              key={spd}
              type="button"
              tabIndex={-1}
              aria-label={
                spd === 0
                  ? lang === 'cs'
                    ? 'Pozastavit čas'
                    : 'Pause Time'
                  : lang === 'cs'
                    ? `Rychlost ${spd}x`
                    : `Speed ${spd}x`
              }
              onClick={(e) => {
                e.currentTarget.blur();
                onSetSpeed(spd);
              }}
              className={`px-2.5 py-1.5 text-xs font-mono-tab font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#e89b3c] text-[#111317]'
                  : 'text-[#cbd5e1] hover:bg-[#232833]'
              }`}
            >
              {spd === 0 ? 'II' : `${spd}x`}
            </button>
          );
        })}

        <div className="h-5 w-px bg-[#2a303a] mx-0.5" />

        <button
          type="button"
          tabIndex={-1}
          data-testid="hud-reset-view"
          aria-label={t.resetView}
          title={t.resetView}
          onClick={(e) => {
            e.currentTarget.blur();
            onResetView();
          }}
          className="px-2 py-1.5 text-xs font-mono-tab font-semibold rounded text-[#cbd5e1] bg-[#1e232d] hover:bg-[#272e3b] border border-[#2e3543] transition-colors cursor-pointer whitespace-nowrap"
        >
          3D
        </button>

        <button
          type="button"
          tabIndex={-1}
          data-testid="hud-lang-toggle"
          aria-label={lang === 'cs' ? 'Switch language to English' : 'Přepnout jazyk do češtiny'}
          title={lang === 'cs' ? 'English' : 'Čeština'}
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleLang();
          }}
          className="px-2 py-1.5 text-xs font-mono-tab font-semibold rounded text-[#e89b3c] bg-[#1e232d] hover:bg-[#272e3b] border border-[#2e3543] transition-colors cursor-pointer whitespace-nowrap"
        >
          {lang.toUpperCase()}
        </button>

        <button
          type="button"
          tabIndex={-1}
          aria-label={
            muted
              ? lang === 'cs'
                ? 'Zapnout zvuk [M]'
                : 'Unmute Audio [M]'
              : lang === 'cs'
                ? 'Ztlumit zvuk [M]'
                : 'Mute Audio [M]'
          }
          title={muted ? 'Unmute [M]' : 'Mute [M]'}
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleMute();
          }}
          className="w-8 h-8 flex items-center justify-center rounded text-[#cbd5e1] hover:bg-[#232833] cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            {muted ? (
              <path d="M23 9l-6 6M17 9l6 6" stroke="#ef4444" />
            ) : (
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            )}
          </svg>
        </button>

        <button
          type="button"
          tabIndex={-1}
          aria-label={lang === 'cs' ? 'Nabídka pauzy [P]' : 'Open Pause Menu [P]'}
          title="Pause [P]"
          onClick={(e) => {
            e.currentTarget.blur();
            onOpenPause();
          }}
          className="w-8 h-8 flex items-center justify-center rounded text-[#cbd5e1] hover:bg-[#232833] cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

interface ResourceStatProps {
  label: string;
  value: string | number;
  warn?: boolean;
  icon: React.ReactNode;
}

const ResourceStat: React.FC<ResourceStatProps> = ({ label, value, warn, icon }) => (
  <div className="flex items-center gap-1.5">
    {icon}
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[#94a3b8] leading-none">{label}</div>
      <div className={`text-sm font-bold font-mono-tab leading-tight ${warn ? 'text-[#f87171]' : 'text-[#f2ede4]'}`}>
        {value}
      </div>
    </div>
  </div>
);
