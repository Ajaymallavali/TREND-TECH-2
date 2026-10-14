import React from 'react';
import { ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';
import ProductImage from '../ProductImage';

export default function ProductIdentityCard({ data }) {
  const { product, image, identity } = data;
  
  return (
    <section className="card bg-white p-6 md:p-8 border border-ink-100 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
      <div className="w-full md:w-1/3 flex-shrink-0">
        <div className="aspect-square bg-ink-50 rounded-2xl border border-ink-100 p-6 flex items-center justify-center relative">
          {image.status === 'VERIFIED_EXACT' ? (
            <ProductImage 
              src={image.url} 
              alt={product.name} 
              category={product.category}
              className="h-full w-full object-contain"
              aspectClassName=""
            />
          ) : (
            <div className="text-center text-ink-400 space-y-2">
              <HelpCircle className="h-8 w-8 mx-auto opacity-50" />
              <p className="text-xs font-semibold">Image pending verification.</p>
            </div>
          )}
          {identity.status === 'IDENTITY_VERIFIED' ? (
            <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Catalog Verified
            </span>
          ) : identity.status === 'EXTERNAL_LIVE_VERIFIED' ? (
            <span className="absolute top-3 right-3 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase">
              <ShieldCheck className="h-3 w-3" /> External Web Product
            </span>
          ) : (
            <span className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Identity Ambiguous
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-6">
        <div>
          <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">{product.brand}</span>
          <h2 className="text-3xl font-black text-ink-900 leading-tight mt-1 mb-2">{product.name}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-ink-100 text-ink-600 px-2 py-1 rounded">Model: {product.model}</span>
            {product.variant && typeof product.variant === 'string' && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-ink-100 text-ink-600 px-2 py-1 rounded">Variant: {product.variant}</span>
            )}
          </div>
        </div>

        {(() => {
          const specsObj = product.specifications || data.specs || {};
          const isSpecsValidObject = typeof specsObj === 'object' && specsObj !== null && !Array.isArray(specsObj);
          if (!isSpecsValidObject || Object.keys(specsObj).length === 0) return null;
          
          return (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest border-b border-ink-100 pb-1">Verified Variant Specifications</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(specsObj).map(([key, value]) => (
                  value && typeof value !== 'object' && (
                    <div key={key} className="bg-ink-50 rounded-lg p-3 border border-ink-100">
                      <p className="text-[10px] font-bold text-ink-500 uppercase mb-0.5">{key}</p>
                      <p className="text-sm font-black text-ink-900">{value.toString()}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
