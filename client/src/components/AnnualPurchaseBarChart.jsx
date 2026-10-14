import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { ShoppingBag, TrendingUp, Calendar, Zap } from 'lucide-react';

export default function AnnualPurchaseBarChart({ data, productName }) {
  if (!data || !data.monthlyData || data.monthlyData.length === 0) {
    return null;
  }

  const { year = 2026, totalVolume = 0, peakMonth = 'October', monthlyData = [] } = data;

  // Find max units to highlight peak month
  const maxUnits = Math.max(...monthlyData.map((d) => d.units));

  // Custom Tooltip for the bar chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isPeak = item.units === maxUnits;

      return (
        <div className="rounded-xl border border-ink-100 bg-white p-3 shadow-card backdrop-blur-xs">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3.5 w-3.5 text-accent-600" />
            <span className="text-xs font-bold text-ink-900">
              {item.month} {year}
            </span>
            {isPeak && (
              <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-800">
                Peak
              </span>
            )}
          </div>
          <div className="text-[11px] font-medium text-ink-500 mb-2">
            Event: <span className="font-semibold text-ink-700">{item.event}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-ink-50 pt-2 text-xs">
            <span className="text-ink-600 font-medium">Purchased Units:</span>
            <span className="font-extrabold text-accent-700 font-mono">
              {item.units.toLocaleString('en-IN')} units
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card shadow-card mt-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent-600" />
            <h3 className="text-base font-bold text-ink-900">
              Purchasing Volume & Sales Trend ({year})
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-ink-400">
            Monthly consumer purchase patterns and seasonal demand peaks observed this year
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent-50 px-2.5 py-1 text-[11px] font-bold text-accent-800 border border-accent-200/60">
            <TrendingUp className="h-3.5 w-3.5 text-accent-600" />
            <span>{totalVolume.toLocaleString('en-IN')}+ Units Bought</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200/60">
            <Zap className="h-3.5 w-3.5 text-amber-600" />
            <span>Peak: {peakMonth.split(' ')[0]}</span>
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e9ee" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#727c93', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#e7e9ee' }}
              tickLine={{ stroke: '#e7e9ee' }}
            />
            <YAxis
              tick={{ fill: '#727c93', fontSize: 11 }}
              axisLine={{ stroke: '#e7e9ee' }}
              tickLine={{ stroke: '#e7e9ee' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="units" radius={[6, 6, 0, 0]} maxBarSize={44}>
              {monthlyData.map((entry) => {
                const isPeak = entry.units === maxUnits;
                return (
                  <Cell
                    key={entry.month}
                    fill={isPeak ? '#059669' : '#1ea864'}
                    opacity={isPeak ? 1 : 0.85}
                    className="transition-all hover:opacity-100"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Seasonality Metrics Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-ink-50 pt-4">
        <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">
            Annual Consumer Demand
          </span>
          <span className="text-sm font-black text-ink-900 mt-1 block">
            {totalVolume.toLocaleString('en-IN')} Verified Orders
          </span>
          <span className="text-[11px] text-ink-500 mt-0.5 block">
            Estimated purchases across Amazon & Flipkart in {year}
          </span>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Peak Demand Surge
          </span>
          <span className="text-sm font-black text-amber-950 mt-1 block">
            {peakMonth}
          </span>
          <span className="text-[11px] text-amber-700 mt-0.5 block">
            Maximum buying velocity reached during festival sales
          </span>
        </div>

        <div className="rounded-xl border border-green-100 bg-green-50/30 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 block">
            Buyer Recommendation
          </span>
          <span className="text-sm font-black text-green-950 mt-1 block">
            High Availability & In Stock
          </span>
          <span className="text-[11px] text-green-700 mt-0.5 block">
            Consistent stock levels with competing retailer offers
          </span>
        </div>
      </div>
    </div>
  );
}
