import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export default function URLAnalysisResult({ data, formatINR }) {
  if (!data || (data.status !== 'SUCCESS' && data.status !== 'SUCCESS_EXTERNAL')) return null;
  if (!data.urlIntelligence || !data.urlIntelligence.isValid || !data.sourceOffer) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
      className="mb-8"
    >
      <section className="card bg-ink-50 p-6 border border-ink-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest bg-white px-2 py-1 border border-ink-200 rounded-md shadow-sm">SOURCE URL OFFER</span>
          </div>
          <h3 className="text-xl font-black text-ink-900">{data.sourceOffer.marketplace}</h3>
          <div className="flex items-end gap-3 mt-2">
            <span className="text-2xl font-black text-ink-900">{formatINR(data.sourceOffer.price)}</span>
            {data.sourceOffer.mrp && data.sourceOffer.mrp > data.sourceOffer.price && (
              <span className="text-sm text-ink-500 line-through mb-1">{formatINR(data.sourceOffer.mrp)}</span>
            )}
            {data.sourceOffer.discountPercentage > 0 && (
              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1.5">{data.sourceOffer.discountPercentage}% OFF</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <a href={data.urlIntelligence.url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-ink-900 hover:bg-ink-800 text-white rounded-xl shadow-sm text-sm font-bold flex items-center gap-2 transition-all">
            OPEN ORIGINAL LINK <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    </motion.div>
  );
}
