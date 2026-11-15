import React, { useState } from 'react';
import { LAW_DEFINITIONS } from '../game/constants';
import {
  LAW_DEFINITIONS_I18N,
  Language,
  UI_TEXT,
  localizeColonistNote,
  localizeColonistRole,
  localizeJournalNote,
  localizeNewspaper,
} from '../game/i18n';
import { GameState, LawId } from '../game/types';
import { ResourceTrendsChart } from './ResourceTrendsChart';

interface ChronicleDrawerProps {
  state: GameState;
  lang: Language;
  onClose: () => void;
  onToggleLaw: (lawId: LawId) => void;
}

export const ChronicleDrawer: React.FC<ChronicleDrawerProps> = ({
  state,
  lang,
  onClose,
  onToggleLaw,
}) => {
  const [tab, setTab] = useState<'journal' | 'trends' | 'laws' | 'press' | 'roster'>('journal');
  const t = UI_TEXT[lang];
  const lawsText = LAW_DEFINITIONS_I18N[lang];

  return (
    <aside
      aria-label={t.ledgerTitle}
      className="fixed top-16 right-3 bottom-24 w-80 sm:w-96 z-20 bg-[#14171d] border border-[#2d333f] rounded shadow-2xl flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#252a34]">
        <h2 className="font-display text-lg tracking-wide uppercase text-[#f2ede4]">
          {t.ledgerTitle}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="px-2.5 py-1 text-xs font-medium text-[#cbd5e1] hover:text-white bg-[#1f242e] rounded cursor-pointer"
        >
          {t.close}
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-5 gap-1 p-1.5 bg-[#0f1217] border-b border-[#252a34]">
        {(
          [
            ['journal', t.tabs.journal],
            ['trends', t.tabs.trends],
            ['laws', t.tabs.laws],
            ['press', t.tabs.press],
            ['roster', t.tabs.roster],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
              tab === id
                ? 'bg-[#e89b3c] text-[#111317]'
                : 'text-[#94a3b8] hover:text-[#e5dfd3]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto colony-scroll p-4 space-y-3">
        {tab === 'trends' && <ResourceTrendsChart state={state} lang={lang} />}
        {tab === 'journal' && (
          <div className="space-y-3">
            {state.journal.map((rawNote) => {
              const note = localizeJournalNote(rawNote, lang);
              return (
                <div
                  key={note.id}
                  className="bg-[#f5ebd2] text-[#231f1a] p-3 rounded shadow-sm border border-[#d6c7a1]"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono-tab text-[#6b5c43] mb-1">
                    <span className="font-bold">{note.author}</span>
                    <span>
                      {t.year} {note.year} · {t.day} {note.day}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">{note.text}</p>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'laws' && (
          <div className="space-y-2.5">
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-2">
              {t.lawsIntro}
            </p>
            {LAW_DEFINITIONS.map((law) => {
              const active = state.laws[law.id];
              const lt = lawsText[law.id];
              return (
                <div
                  key={law.id}
                  className={`p-3 rounded border ${
                    active
                      ? 'bg-[#1c232d] border-[#e89b3c]/60'
                      : 'bg-[#181b22] border-[#272c36]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div>
                      <span className="text-[10px] font-mono-tab uppercase text-[#e89b3c] mr-1.5">
                        {lt.number}
                      </span>
                      <span className="text-sm font-semibold text-[#f2ede4]">{lt.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleLaw(law.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#e89b3c] text-[#111317]'
                          : 'bg-[#252b36] text-[#cbd5e1] hover:bg-[#323a48]'
                      }`}
                    >
                      {active ? t.active : t.enact}
                    </button>
                  </div>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{lt.effect}</p>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'press' && (
          <div className="space-y-3">
            {state.newspapers.map((rawPaper) => {
              const paper = localizeNewspaper(rawPaper, lang);
              return (
                <article
                  key={paper.id}
                  className="bg-[#e8e3d8] text-[#191919] p-3.5 rounded border border-[#b8b09e]"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono-tab uppercase border-b border-[#191919]/25 pb-1 mb-1.5">
                    <span className="font-bold">{t.newspaperTitle}</span>
                    <span>
                      {t.year} {paper.year} · {t.day} {paper.day}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold leading-tight mb-1">
                    {paper.headline}
                  </h3>
                  <div className="text-[11px] font-semibold text-[#474238] mb-1.5">
                    {paper.subhead}
                  </div>
                  <p className="text-xs leading-relaxed text-[#2e2b25]">{paper.body}</p>
                </article>
              );
            })}
          </div>
        )}

        {tab === 'roster' && (
          <div className="space-y-2">
            <div className="text-xs text-[#94a3b8] mb-2">
              {t.censusLabel}{' '}
              <strong className="text-[#f2ede4] font-mono-tab">{Math.round(state.population)}</strong>{' '}
              {t.citizensUnit}
            </div>
            {state.colonists.map((col) => (
              <div
                key={col.id}
                className="p-2.5 rounded bg-[#181c24] border border-[#252b36] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#f2ede4]">
                    <span>{col.name}</span>
                    <span className="text-xs font-normal text-[#94a3b8]">
                      {localizeColonistRole(col.role, lang)} · {t.age} {col.age}
                    </span>
                  </div>
                  <div className="text-xs text-[#94a3b8] mt-0.5">
                    {localizeColonistNote(col.note, lang)}
                  </div>
                </div>
                <div className="text-right font-mono-tab text-xs shrink-0">
                  {col.alive ? (
                    <span className="text-[#4ade80]">{Math.round(col.hp)} HP</span>
                  ) : (
                    <span className="text-[#f87171]">{t.fallen}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
