import React from 'react';
import { TOOLS } from '../game/constants';
import { Language, TOOLS_I18N, UI_TEXT } from '../game/i18n';
import { GameState, ToolId } from '../game/types';

interface ActionDockProps {
  state: GameState;
  lang: Language;
  drawerOpen: boolean;
  onSelectTool: (id: ToolId) => void;
  onSendExpedition: () => void;
  onToggleDrawer: () => void;
}

export const ActionDock: React.FC<ActionDockProps> = ({
  state,
  lang,
  drawerOpen,
  onSelectTool,
  onSendExpedition,
  onToggleDrawer,
}) => {
  const t = UI_TEXT[lang];
  const toolsI18n = TOOLS_I18N[lang];
  const woodUnit = lang === 'cs' ? 'D' : 'W';
  const steelUnit = lang === 'cs' ? 'O' : 'S';

  const activeTool = TOOLS.find((tItem) => tItem.id === state.selectedTool);
  const activeToolText = activeTool ? toolsI18n[activeTool.id] : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none px-3 pb-2.5 flex flex-col items-center gap-1.5">
      {/* Subtle selected tool role & cost strip */}
      {activeTool && activeToolText && (
        <div className="pointer-events-auto bg-[#14171d]/95 border border-[#2a303a] px-3 py-1 rounded text-xs text-[#d8d2c5] flex items-center gap-2">
          <span className="font-semibold text-[#e89b3c]">{activeToolText.name}</span>
          <span aria-hidden="true" className="text-[#64748b]">·</span>
          <span>{activeToolText.roleClue}</span>
          {(activeTool.woodCost > 0 || activeTool.steelCost > 0) && (
            <>
              <span aria-hidden="true" className="text-[#64748b]">·</span>
              <span className="font-mono-tab text-[#94a3b8]">
                {activeTool.woodCost > 0 ? `${activeTool.woodCost}${woodUnit} ` : ''}
                {activeTool.steelCost > 0 ? `${activeTool.steelCost}${steelUnit}` : ''}
              </span>
            </>
          )}
        </div>
      )}

      {/* Main bottom dock */}
      <div className="pointer-events-auto max-w-[98vw] overflow-x-auto colony-scroll bg-[#14171d]/95 border border-[#2a303a] p-1 rounded flex items-center gap-1 shadow-lg">
        {TOOLS.map((tool) => {
          const selected = state.selectedTool === tool.id;
          const canAfford =
            state.resources.wood >= tool.woodCost && state.resources.steel >= tool.steelCost;
          const toolText = toolsI18n[tool.id];
          return (
            <button
              key={tool.id}
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onSelectTool(tool.id);
              }}
              aria-label={`${toolText.name} [${tool.hotkey}]`}
              className={`px-2 py-1 rounded text-left transition-colors cursor-pointer shrink-0 whitespace-nowrap flex flex-col justify-between min-w-[60px] border ${
                selected
                  ? 'bg-[#e89b3c] text-[#111317] border-[#f59e0b]'
                  : canAfford
                    ? 'bg-[#1c2028] text-[#e5dfd3] border-[#2a303a] hover:bg-[#252b36]'
                    : 'bg-[#161920] text-[#64748b] border-[#22262f] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 w-full">
                <span className="text-[11px] font-semibold leading-tight">{toolText.shortName}</span>
                <span
                  className={`text-[10px] font-mono-tab ${
                    selected ? 'text-[#111317]/80' : 'text-[#94a3b8]'
                  }`}
                >
                  {tool.hotkey}
                </span>
              </div>
              <div
                className={`text-[10px] font-mono-tab mt-0.5 ${
                  selected ? 'text-[#111317]/85' : 'text-[#94a3b8]'
                }`}
              >
                {tool.woodCost === 0 && tool.steelCost === 0
                  ? t.free
                  : `${tool.woodCost > 0 ? `${tool.woodCost}${woodUnit}` : ''}${tool.woodCost > 0 && tool.steelCost > 0 ? ' ' : ''}${tool.steelCost > 0 ? `${tool.steelCost}${steelUnit}` : ''}`}
              </div>
            </button>
          );
        })}

        <div className="h-8 w-px bg-[#2a303a] mx-0.5 shrink-0" />

        <button
          type="button"
          tabIndex={-1}
          disabled={state.expeditionActive || state.expeditionCooldown > 0}
          onClick={(e) => {
            e.currentTarget.blur();
            onSendExpedition();
          }}
          className={`px-2.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
            state.expeditionActive || state.expeditionCooldown > 0
              ? 'bg-[#1a1d24] text-[#64748b] border-[#252a34] cursor-not-allowed'
              : 'bg-[#253244] hover:bg-[#314259] text-[#bae6fd] border-[#38bdf8]/40 cursor-pointer'
          }`}
        >
          {state.expeditionActive
            ? t.scouting
            : state.expeditionCooldown > 0
              ? `${lang === 'cs' ? 'Povrch' : 'Surface'} (${Math.ceil(state.expeditionCooldown)}d)`
              : t.surfaceBtn}
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleDrawer();
          }}
          className={`px-2.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
            drawerOpen
              ? 'bg-[#f2ede4] text-[#111317] border-[#f2ede4]'
              : 'bg-[#1c2028] hover:bg-[#252b36] text-[#f2ede4] border-[#2a303a]'
          }`}
        >
          {t.ledgerBtn}
        </button>
      </div>
    </div>
  );
};
