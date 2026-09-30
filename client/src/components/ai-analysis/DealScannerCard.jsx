import React from 'react';
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';

export function DealScannerCard({ dealScanner, formatINR }) {
  if (!dealScanner || dealScanner.length === 0) return null;

  return (
    <section className="card bg-white border border-ink-100 rounded-2xl p-6">
      <h3 className="text-xs font-black text-ink-900 uppercase tracking-widest flex items-center gap-2 mb-6">
        <BarChart3 className="h-4 w-4 text-accent-600" /> Verified Deal Scanner & History
      </h3>
      <div className="space-y-4">
        {dealScanner.map((scanner, i) => (
          <div key={i} className="border border-ink-100 rounded-xl p-4 bg-ink-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-black text-ink-900 text-lg">{scanner.marketplace}</span>
                {scanner.status === 'PRICE DROP' && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><TrendingDown className="h-3 w-3" /> VERIFIED PRICE DROP</span>}
                {scanner.status === 'PRICE INCREASE' && <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><TrendingUp className="h-3 w-3" /> PRICE INCREASE</span>}
                {scanner.status === 'PRICE UNCHANGED' && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">PRICE UNCHANGED</span>}
                {scanner.status === 'NEW PRICE' && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">NEW PRICE</span>}
                {scanner.status === 'INSUFFICIENT HISTORY' && <span className="bg-ink-200 text-ink-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">INSUFFICIENT HISTORY</span>}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-ink-500 text-xs font-semibold uppercase">Current:</span>
                  <span className="ml-2 font-black text-ink-900">{formatINR(scanner.currentPrice)}</span>
                </div>
                {scanner.previousPrice && (
                  <div>
                    <span className="text-ink-500 text-xs font-semibold uppercase">Previous:</span>
                    <span className="ml-2 font-bold text-ink-700">{formatINR(scanner.previousPrice)}</span>
                  </div>
                )}
                {scanner.lowestVerified && scanner.historyCount > 1 && (
                  <div>
                    <span className="text-ink-500 text-xs font-semibold uppercase">Lowest Verified:</span>
                    <span className="ml-2 font-bold text-ink-700">{formatINR(scanner.lowestVerified)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:text-right">
              {scanner.isLowestEver ? (
                <div className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200 inline-block">
                  Matches lowest verified price in available history
                </div>
              ) : scanner.lowestVerified && scanner.currentPrice > scanner.lowestVerified ? (
                <div className="text-[10px] font-medium text-ink-500 bg-white px-3 py-2 rounded-lg border border-ink-100 inline-block max-w-[200px]">
                  {formatINR(scanner.currentPrice - scanner.lowestVerified)} above the lowest recorded verified price ({formatINR(scanner.lowestVerified)})
                </div>
              ) : scanner.historyCount <= 1 ? (
                <div className="text-[10px] font-medium text-ink-400 bg-white px-3 py-2 rounded-lg border border-ink-100 inline-block">
                  Not enough verified history to calculate this metric.
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
