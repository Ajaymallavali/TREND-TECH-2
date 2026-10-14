import { History, Calendar, Flame, Tag, CheckCircle2, TrendingDown } from 'lucide-react';

const formatINR = (val) => {
  if (!val) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function HistoricalOfferReport({ report }) {
  if (!report) return null;

  const {
    lastMonthOffer,
    lastWeekOffer,
    lowestPrice30Days,
    currentBestPrice,
    dealVerdict,
  } = report;

  return (
    <div className="card shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-accent-600" />
            <h3 className="text-base font-bold text-ink-900">
              Historical Deal & Offer Intelligence Report
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-ink-400">
            Past month and last week promotional records compared with current verified pricing
          </p>
        </div>

        {dealVerdict && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-bold text-accent-800 border border-accent-200 self-start sm:self-auto">
            <span>{dealVerdict.badge}</span>
          </span>
        )}
      </div>

      {/* 4 Cards Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Last Month's Offer */}
        {lastMonthOffer && (
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/40 to-white p-4 flex flex-col justify-between hover:border-blue-200 transition-all">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-700">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Last Month
                </span>
                <span className="rounded bg-blue-100/80 px-1.5 py-0.5 text-[10px] font-black uppercase text-blue-800">
                  {lastMonthOffer.discountPercentage}% OFF
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-ink-950">
                {formatINR(lastMonthOffer.price)}
              </div>
              <div className="mt-1 text-[11px] text-ink-500 font-medium">
                Store: <span className="font-bold text-ink-800">{lastMonthOffer.store}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-blue-100/60 text-[10px] text-blue-800/80 font-medium flex items-center justify-between">
              <span>{lastMonthOffer.event}</span>
              <span className="text-ink-400">{lastMonthOffer.timing}</span>
            </div>
          </div>
        )}

        {/* Card 2: Last Week's Offer */}
        {lastWeekOffer && (
          <div className="rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50/40 to-white p-4 flex flex-col justify-between hover:border-purple-200 transition-all">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-purple-700">
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> Last Week
                </span>
                <span className="rounded bg-purple-100/80 px-1.5 py-0.5 text-[10px] font-black uppercase text-purple-800">
                  {lastWeekOffer.discountPercentage}% OFF
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-ink-950">
                {formatINR(lastWeekOffer.price)}
              </div>
              <div className="mt-1 text-[11px] text-ink-500 font-medium">
                Store: <span className="font-bold text-ink-800">{lastWeekOffer.store}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-purple-100/60 text-[10px] text-purple-800/80 font-medium flex items-center justify-between">
              <span>{lastWeekOffer.event}</span>
              <span className="text-ink-400">{lastWeekOffer.timing}</span>
            </div>
          </div>
        )}

        {/* Card 3: 30-Day Lowest Record */}
        {lowestPrice30Days && (
          <div className="rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50/40 to-white p-4 flex flex-col justify-between hover:border-amber-200 transition-all">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-700">
                <span className="inline-flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" /> 30-Day Low
                </span>
                <span className="rounded bg-amber-100/80 px-1.5 py-0.5 text-[10px] font-black uppercase text-amber-800">
                  Lowest
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-ink-950">
                {formatINR(lowestPrice30Days.price)}
              </div>
              <div className="mt-1 text-[11px] text-ink-500 font-medium">
                Recorded at: <span className="font-bold text-ink-800">{lowestPrice30Days.store}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-amber-100/60 text-[10px] text-amber-800 font-semibold">
              Save {formatINR(lowestPrice30Days.savingsVsMRP)} vs MRP
            </div>
          </div>
        )}

        {/* Card 4: Current Live Best Price */}
        {currentBestPrice && (
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white p-4 flex flex-col justify-between hover:border-emerald-300 transition-all">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700">
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Current Best Deal
                </span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-emerald-800">
                  {currentBestPrice.discountPercentage}% OFF
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-emerald-950">
                {formatINR(currentBestPrice.price)}
              </div>
              <div className="mt-1 text-[11px] text-ink-500 font-medium">
                Live at: <span className="font-bold text-emerald-800">{currentBestPrice.store}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-emerald-100 text-[10px] text-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Verified In Stock & Ready to Buy</span>
            </div>
          </div>
        )}
      </div>

      {/* Intelligence Verdict Banner */}
      {dealVerdict && (
        <div className="mt-5 rounded-xl border border-ink-100 bg-ink-50/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-ink-900 block">
              {dealVerdict.headline}
            </span>
            <p className="text-[11px] text-ink-500 leading-relaxed">
              {dealVerdict.summary}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink-800 border border-ink-200 shadow-2xs flex-shrink-0 self-stretch sm:self-auto text-center justify-center">
            <span>Verified Price History Signal</span>
          </span>
        </div>
      )}
    </div>
  );
}
