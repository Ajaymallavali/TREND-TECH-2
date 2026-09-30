import React from 'react';
import ProductIdentityCard from './ProductIdentityCard';
import { BestDealCard } from './BestDealCard';
import { DealMetricsCard } from './DealMetricsCard';
import { MarketplaceComparison } from './MarketplaceComparison';
import { AIExplanationCard } from './AIExplanationCard';
import { SourceEvidence } from './SourceEvidence';

export default function ExternalProductResult({ data, formatINR }) {
  if (!data || data.status !== 'SUCCESS_EXTERNAL') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest mb-1">External Web Product</p>
        <p className="text-xs font-medium">This product is not in our local verified catalog. Information was gathered via live AI web research.</p>
      </div>

      <ProductIdentityCard data={data} />
      <BestDealCard bestDeal={data.bestDeal} formatINR={formatINR} />
      <DealMetricsCard 
        identity={data.identity} 
        dealMetrics={data.dealMetrics} 
        bestDeal={data.bestDeal} 
        preferredDeal={data.preferredDeal} 
        sourceInfo={data.sourceInfo} 
        formatINR={formatINR} 
      />
      <MarketplaceComparison marketplaces={data.marketplaces} formatINR={formatINR} />
      <AIExplanationCard data={data} />
      <SourceEvidence data={data} />
    </div>
  );
}
