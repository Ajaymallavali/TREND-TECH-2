import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AnalysisError({ isApiError, data, onRetry }) {
  if (isApiError) {
    return (
      <section className="card bg-red-50 p-8 border border-red-200 rounded-2xl text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-red-900">Unable to analyze this request right now.</h2>
        <p className="text-sm text-red-700 font-medium">Please check your connection or try again later.</p>
        <button onClick={onRetry} className="btn-primary py-2 px-6 text-xs mt-2">Retry</button>
      </section>
    );
  }

  if (data && data.status !== 'SUCCESS' && data.status !== 'SUCCESS_EXTERNAL' && data.status !== 'RECOMMENDATION_SUCCESS' && data.status !== 'COMPARISON_SUCCESS' && data.status !== 'PARTIAL_MATCH') {
    return (
      <section className="card bg-red-50 p-8 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-red-900">
          {data.status === 'INVALID_URL' ? 'Invalid Product URL' : 'PRODUCT NOT VERIFIED'}
        </h2>
        <p className="text-sm text-red-700 font-medium">
          {data.status === 'INVALID_URL' 
            ? data.error || 'Please provide a valid, supported marketplace URL.' 
            : data.error || 'Insufficient verified information was found to establish the exact product.'}
        </p>
      </section>
    );
  }

  return null;
}
