import React from 'react';
import { Language, UI_TEXT } from '../game/i18n';

interface TitleScreenProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ lang, onSetLang, onStart }) => {
  const t = UI_TEXT[lang];

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col justify-between pointer-events-none select-none p-8 md:p-14"
      style={{
        background:
          'linear-gradient(90deg, rgba(9,11,15,0.86) 0%, rgba(9,11,15,0.52) 44%, rgba(9,11,15,0.08) 78%, transparent 100%)',
      }}
    >
      {/* Upper-Left Lockup over calm atmospheric negative space */}
      <div className="max-w-xl pt-4 pointer-events-auto">
        <svg
          viewBox="0 0 460 132"
          className="w-full max-w-[440px] h-auto mb-5"
          role="img"
          aria-label={`Hollow Creek: ${t.subtitle}`}
        >
          {/* Diegetic iron & amber stencil emblem */}
          <rect x="2" y="10" width="6" height="110" fill="#e89b3c" />
          <path d="M22 18 H448" stroke="#d8d2c5" strokeOpacity="0.22" strokeWidth="1" />
          <text
            x="22"
            y="72"
            fill="#f2ede4"
            fontFamily="Oswald, sans-serif"
            fontWeight="700"
            fontSize="58"
            letterSpacing="3"
          >
            HOLLOW CREEK
          </text>
          <text
            x="24"
            y="108"
            fill="#e89b3c"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="600"
            fontSize="16"
            letterSpacing="4.5"
          >
            {t.subtitle}
          </text>
          <path d="M22 122 H260" stroke="#e89b3c" strokeOpacity="0.45" strokeWidth="1.5" />
        </svg>

        <p className="text-[#d8d2c5]/85 text-base leading-relaxed max-w-md mb-8">
          {t.titleDesc}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            data-start="true"
            onClick={onStart}
            className="px-7 py-3.5 bg-[#e89b3c] hover:bg-[#f0ad54] active:translate-y-px text-[#111317] font-display font-bold text-lg tracking-wider uppercase rounded transition-colors cursor-pointer shadow-lg whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e89b3c]"
          >
            {t.startCta}
          </button>

          <div
            role="group"
            aria-label="Language"
            className="inline-flex items-center bg-[#14171d]/90 border border-[#2d333f] rounded p-1"
          >
            <button
              type="button"
              data-testid="lang-cs"
              onClick={() => onSetLang('cs')}
              className={`px-3 py-1.5 text-xs font-mono-tab font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                lang === 'cs'
                  ? 'bg-[#e89b3c] text-[#111317]'
                  : 'text-[#cbd5e1] hover:text-white'
              }`}
            >
              Čeština
            </button>
            <button
              type="button"
              data-testid="lang-en"
              onClick={() => onSetLang('en')}
              className={`px-3 py-1.5 text-xs font-mono-tab font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                lang === 'en'
                  ? 'bg-[#e89b3c] text-[#111317]'
                  : 'text-[#cbd5e1] hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Single flat borderless control hint line */}
      <div className="text-xs font-mono-tab text-[#d8d2c5]/70 tracking-wide">
        {t.controlsHint}
      </div>
    </div>
  );
};
