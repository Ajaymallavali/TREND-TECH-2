import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const getColorForMarketplace = (name) => {
  const colors = {
    'Amazon': '#FF9900',
    'Amazon India': '#FF9900',
    'Flipkart': '#2874F0',
    'Croma': '#00BFA5',
    'Reliance Digital': '#E31837',
    'Vijay Sales': '#D32F2F',
    'Walmart': '#0071CE',
    'Best Buy': '#0046BE',
    'eBay': '#E53238',
    'Newegg': '#F27A24',
    'B&H Photo Video': '#487A7B',
    'Target': '#CC0000',
    'Costco': '#E31837',
    'Apple': '#000000',
    'Samsung': '#1428A0',
  };
  return colors[name] || '#6366F1';
};

export default function PriceHistoryChart({ data = [], selectedMarketplaces = [] }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white">
        <p className="text-sm font-semibold text-ink-400">Price history not available yet</p>
      </div>
    );
  }

  // Derive all store keys present in data
  const allStores = Array.from(
    new Set(data.flatMap((item) => Object.keys(item).filter((key) => key !== 'date')))
  );
  const activeStores = selectedMarketplaces.length > 0
    ? selectedMarketplaces.filter((s) => allStores.includes(s))
    : allStores;
  const storesToRender = activeStores.length > 0 ? activeStores : allStores;

  // Format Y-axis value to INR (using currency formatting helper or simple symbol)
  const formatYAxis = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Format X-axis date (e.g. 2026-08-25 -> Aug 25)
  const formatXAxis = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length < 3) return dateStr;
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-ink-100 bg-white p-3 shadow-card">
          <p className="mb-2 text-xs font-semibold text-ink-700">{formatXAxis(label)}</p>
          <div className="space-y-1">
            {payload.map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
                <span className="font-medium" style={{ color: p.color }}>
                  {p.name}:
                </span>
                <span className="font-bold text-ink-900">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(p.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e9ee" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: '#727c93', fontSize: 11 }}
            axisLine={{ stroke: '#e7e9ee' }}
            tickLine={{ stroke: '#e7e9ee' }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: '#727c93', fontSize: 11 }}
            domain={['auto', 'auto']}
            axisLine={{ stroke: '#e7e9ee' }}
            tickLine={{ stroke: '#e7e9ee' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            formatter={(value) => {
              return <span className="text-xs font-medium text-ink-600">{value}</span>;
            }}
          />
          {storesToRender.map((mName) => (
            <Line
              key={mName}
              type="monotone"
              dataKey={mName}
              stroke={getColorForMarketplace(mName)}
              strokeWidth={2.5}
              dot={{ r: 0 }}
              activeDot={{ r: 6 }}
              name={mName}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
