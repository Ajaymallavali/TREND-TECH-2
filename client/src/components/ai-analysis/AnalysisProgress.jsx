import React from 'react';
import { Zap } from 'lucide-react';

export default function AnalysisProgress({ stages }) {
  return (
    <section className="card bg-white p-8 border border-ink-100 rounded-2xl text-center shadow-sm animate-in fade-in duration-500">
      <div className="flex justify-center mb-6">
        <Zap className="h-10 w-10 text-accent-600 animate-pulse" />
      </div>
      <div className="space-y-3 max-w-sm mx-auto text-left">
        {stages.map((stage, idx) => (
          <p key={idx} className={`text-sm font-bold ${stage.startsWith('✓') ? 'text-green-600' : 'text-ink-600'} animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2`}>
            {stage}
          </p>
        ))}
      </div>
    </section>
  );
}
