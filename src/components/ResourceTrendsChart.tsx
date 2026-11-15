import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Language, UI_TEXT, formatTrendLabel } from '../game/i18n';
import { GameState } from '../game/types';

interface ResourceTrendsChartProps {
  state: GameState;
  lang: Language;
}

type TrendMetric = 'all' | 'food' | 'water' | 'energy';

export const ResourceTrendsChart: React.FC<ResourceTrendsChartProps> = ({ state, lang }) => {
  const [metric, setMetric] = useState<TrendMetric>('all');
  const tt = UI_TEXT[lang].trends;
  const history = state.history.map((pt) => ({
    ...pt,
    label: formatTrendLabel(pt.label, lang),
  }));
  const latest = history[history.length - 1];

  const netFood = latest ? Math.round((latest.foodProd - latest.foodCons) * 10) / 10 : 0;
  const netWater = latest ? Math.round((latest.waterProd - latest.waterCons) * 10) / 10 : 0;
  const powerMargin = latest ? latest.powerGen - latest.powerUse : 0;

  return (
    <div className="space-y-3.5" data-testid="resource-trends-panel">
      {/* Segmented Metric Filter */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#0f1217] border border-[#252a34] rounded">
        {(
          [
            ['all', tt.all],
            ['food', tt.food],
            ['water', tt.water],
            ['energy', tt.energy],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMetric(id)}
            className={`py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              metric === id
                ? 'bg-[#e89b3c] text-[#111317]'
                : 'text-[#94a3b8] hover:text-[#e5dfd3]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Actionable Daily Balance Summary */}
      <div className="grid grid-cols-3 gap-2">
        <BalanceTile
          label={tt.netFood}
          value={netFood > 0 ? `+${netFood}` : `${netFood}`}
          status={netFood >= 0 ? tt.surplus : tt.deficit}
          positive={netFood >= 0}
        />
        <BalanceTile
          label={tt.netWater}
          value={netWater > 0 ? `+${netWater}` : `${netWater}`}
          status={netWater >= 0 ? tt.surplus : tt.deficit}
          positive={netWater >= 0}
        />
        <BalanceTile
          label={tt.powerMargin}
          value={powerMargin >= 0 ? `+${powerMargin}W` : `${powerMargin}W`}
          status={powerMargin >= 0 ? tt.stable : tt.blackout}
          positive={powerMargin >= 0}
        />
      </div>

      {/* Chart 1: Daily Consumption & Energy Demand */}
      <section className="bg-[#11141a] border border-[#252a34] rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-[#f2ede4]">
            {tt.chart1Title}
          </h3>
          <span className="text-[11px] font-mono-tab text-[#94a3b8]">
            {history.length} {history.length === 1 ? tt.sample : tt.samples}
          </span>
        </div>
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#232833" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={{ stroke: '#2a303c' }}
                tickLine={false}
                minTickGap={18}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#14171d',
                  border: '1px solid #2d333f',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#f2ede4',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
                iconType="plainline"
              />
              {(metric === 'all' || metric === 'food') && (
                <Line
                  type="monotone"
                  dataKey="foodCons"
                  name={tt.foodUse}
                  stroke="#e89b3c"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {(metric === 'all' || metric === 'water') && (
                <Line
                  type="monotone"
                  dataKey="waterCons"
                  name={tt.waterUse}
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {(metric === 'all' || metric === 'energy') && (
                <Line
                  type="monotone"
                  dataKey="powerUse"
                  name={tt.energyUse}
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {metric === 'energy' && (
                <Line
                  type="monotone"
                  dataKey="powerGen"
                  name={tt.energyCap}
                  stroke="#facc15"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {metric === 'food' && (
                <Line
                  type="monotone"
                  dataKey="foodProd"
                  name={tt.foodProd}
                  stroke="#4ade80"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {metric === 'water' && (
                <Line
                  type="monotone"
                  dataKey="waterProd"
                  name={tt.waterProd}
                  stroke="#22d3ee"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Chart 2: Stockpile & Grid Capacity History */}
      <section className="bg-[#11141a] border border-[#252a34] rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-[#f2ede4]">
            {metric === 'energy' ? tt.chart2EnergyTitle : tt.chart2ReservesTitle}
          </h3>
          <span className="text-[11px] font-mono-tab text-[#94a3b8]">
            {tt.pop} {Math.round(state.population)}
          </span>
        </div>
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="#232833" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={{ stroke: '#2a303c' }}
                tickLine={false}
                minTickGap={18}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#14171d',
                  border: '1px solid #2d333f',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#f2ede4',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              {(metric === 'all' || metric === 'food') && (
                <Area
                  type="monotone"
                  dataKey="food"
                  name={tt.foodCans}
                  stroke="#e89b3c"
                  fill="#e89b3c"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              )}
              {(metric === 'all' || metric === 'water') && (
                <Area
                  type="monotone"
                  dataKey="water"
                  name={tt.waterLiters}
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              )}
              {metric === 'energy' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="powerGen"
                    name={tt.powerGen}
                    stroke="#facc15"
                    fill="#facc15"
                    fillOpacity={0.18}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="powerUse"
                    name={tt.powerLoad}
                    stroke="#f87171"
                    fill="#f87171"
                    fillOpacity={0.18}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="text-[11px] text-[#94a3b8] leading-relaxed">
        {netFood < 0 ? tt.adviceFood : powerMargin < 5 ? tt.advicePower : tt.adviceSteady}
      </p>
    </div>
  );
};

interface BalanceTileProps {
  label: string;
  value: string;
  status: string;
  positive: boolean;
}

const BalanceTile: React.FC<BalanceTileProps> = ({ label, value, status, positive }) => (
  <div className="bg-[#181c24] border border-[#252b36] rounded p-2">
    <div className="text-[10px] uppercase tracking-wider text-[#94a3b8] truncate">{label}</div>
    <div
      className={`text-sm font-bold font-mono-tab mt-0.5 ${
        positive ? 'text-[#4ade80]' : 'text-[#f87171]'
      }`}
    >
      {value}
    </div>
    <div className="text-[10px] text-[#cbd5e1]">{status}</div>
  </div>
);
