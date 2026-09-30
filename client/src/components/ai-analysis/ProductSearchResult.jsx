import React from 'react';
import ProductIdentityCard from './ProductIdentityCard';
import { BestDealCard } from './BestDealCard';
import { DealMetricsCard } from './DealMetricsCard';
import { DealScannerCard } from './DealScannerCard';
import { MarketplaceComparison } from './MarketplaceComparison';
import { AIExplanationCard } from './AIExplanationCard';
import { SourceEvidence } from './SourceEvidence';

export default function ProductSearchResult({ data, formatINR }) {
  if (!data || data.status !== 'SUCCESS') return null;
  // If it's a URL analysis, that's handled by URLAnalysisResult
  if (data.urlIntelligence && data.urlIntelligence.isValid) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
      <DealScannerCard dealScanner={data.dealScanner} formatINR={formatINR} />
      <MarketplaceComparison marketplaces={data.marketplaces} formatINR={formatINR} />
      <AIExplanationCard data={data} />
      <SourceEvidence data={data} />
    </div>
  );
}
