import React from 'react';
import { Search, Activity, TrendingUp, Play } from 'lucide-react';

export default function AIAnalysisInput({ 
  inputData, 
  setInputData, 
  contextData, 
  setContextData, 
  preferredStore, 
  setPreferredStore, 
  handleSubmit, 
  handleClear, 
  isLoading, 
  searchSuggestions 
}) {
  return (
    <section className="card bg-white p-6 shadow-sm border border-ink-100 rounded-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-accent-600" /> Search Input
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search a product, compare products, or paste a URL..."
                className="input-field text-sm py-3 w-full border-2 border-accent-100 focus:border-accent-600"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                disabled={isLoading}
                list="product-suggestions"
                autoComplete="off"
              />
              {inputData.length > 2 && !inputData.startsWith('http') && searchSuggestions && searchSuggestions.length > 0 && (
                <datalist id="product-suggestions">
                  {searchSuggestions.slice(0, 10).map((prod) => (
                    <option key={prod._id} value={prod.name} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-ink-400" /> Additional Context (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 256GB under ₹80,000"
                className="input-field text-xs py-2 border-dashed w-full"
                value={contextData}
                onChange={(e) => setContextData(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-ink-400" /> Preferred Store
              </label>
              <select
                className="input-field text-xs py-2 w-full"
                value={preferredStore}
                onChange={(e) => setPreferredStore(e.target.value)}
                disabled={isLoading}
              >
                <option value="Any">Any Verified Store</option>
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Myntra">Myntra</option>
                <option value="Croma">Croma</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-ink-100">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading || (!inputData && !contextData)}
              className="btn-outline py-2 px-4 text-xs font-bold w-full sm:w-auto"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => { 
                const samples = ["Samsung Galaxy S25 Ultra", "best gaming laptop under 100000", "Compare Galaxy S25 Ultra and iPhone 17 Pro", "Sony WH-1000XM5"];
                setInputData(samples[Math.floor(Math.random() * samples.length)]);
              }}
              disabled={isLoading}
              className="btn-secondary py-2 px-4 text-xs font-bold w-full sm:w-auto flex items-center justify-center gap-1"
            >
              <Play className="h-3 w-3" /> Random
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !inputData.trim()}
            className="btn-primary py-3 px-8 text-sm w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>
    </section>
  );
}
