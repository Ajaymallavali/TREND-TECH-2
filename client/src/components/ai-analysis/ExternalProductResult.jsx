import React from 'react';
import { motion } from 'framer-motion';
import ProductIdentityCard from './ProductIdentityCard';
import { BestDealCard } from './BestDealCard';
import { DealMetricsCard } from './DealMetricsCard';
import { MarketplaceComparison } from './MarketplaceComparison';
import { AIExplanationCard } from './AIExplanationCard';
import { SourceEvidence } from './SourceEvidence';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function ExternalProductResult({ data, formatINR }) {
  if (!data || data.status !== 'SUCCESS_EXTERNAL') return null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest mb-1">External Web Product</p>
        <p className="text-xs font-medium">This product is not in our local verified catalog. Information was gathered via live AI web research.</p>
      </motion.div>

      <motion.div variants={itemVariants}><ProductIdentityCard data={data} /></motion.div>
      <motion.div variants={itemVariants}><BestDealCard bestDeal={data.bestDeal} product={data.product} formatINR={formatINR} /></motion.div>
      <motion.div variants={itemVariants}>
        <DealMetricsCard 
          identity={data.identity} 
          dealMetrics={data.dealMetrics} 
          bestDeal={data.bestDeal} 
          preferredDeal={data.preferredDeal} 
          sourceInfo={data.sourceInfo} 
          product={data.product}
          formatINR={formatINR} 
        />
      </motion.div>
      <motion.div variants={itemVariants}><MarketplaceComparison marketplaces={data.marketplaces} product={data.product} formatINR={formatINR} /></motion.div>
      <motion.div variants={itemVariants}><AIExplanationCard data={data} /></motion.div>
      <motion.div variants={itemVariants}><SourceEvidence data={data} /></motion.div>
    </motion.div>
  );
}


