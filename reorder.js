const fs = require('fs');

let content = require('./extract.js');

// Helper to extract a block given a start comment and an end tag
function extractBlock(text, startStr, endStr) {
    const startIndex = text.indexOf(startStr);
    if (startIndex === -1) return null;
    const endIndex = text.indexOf(endStr, startIndex + startStr.length);
    if (endIndex === -1) return null;
    return text.substring(startIndex, endIndex + endStr.length);
}

const productIdentity = extractBlock(content, '{/* 1. PRODUCT IDENTIFIED */}', '</section>');
const bestDeal = extractBlock(content, '{/* 2. BEST VERIFIED DEAL */}', '</section>\n            )}');
const partialShield = extractBlock(content, '{data.identity.matchConfidence === \'AMBIGUOUS\' && (', '</section>\n            )}');
const metricsCards = extractBlock(content, '{/* 4 BEST METRICS CARDS */}', '})()}');
const sourceVsBest = extractBlock(content, '{/* SOURCE VS BEST MARKETPLACE */}', '</section>\n            )}');
const preferredStore = extractBlock(content, '{/* PREFERRED STORE SECTION */}', '</section>\n            )}');
const compareStores = extractBlock(content, '{/* 3. COMPARE STORES */}', '</section>');
const aiResearch = extractBlock(content, '{/* AI RESEARCH SECTIONS */}', '</section>\n            )}');

const howCalculated = `
            {/* 7. HOW THE DEAL WAS CALCULATED */}
            {(data.identity.matchConfidence === 'EXACT' || data.identity.status === 'IDENTITY_VERIFIED' || data.identity.status === 'EXTERNAL_LIVE_VERIFIED') && data.bestDeal && data.marketplaces.filter(mp => mp.isVerified && mp.price).length > 1 && (() => {
              const verifiedOffers = data.marketplaces.filter(mp => mp.isVerified && mp.price && mp.availability === 'Available').sort((a,b) => b.price - a.price);
              const highest = verifiedOffers[0];
              const lowest = data.bestDeal;
              if (highest && lowest && highest.price > lowest.price) {
                return (
                  <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black text-ink-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Zap className="h-4 w-4 text-accent-600" /> How the deal was calculated
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-ink-50 p-6 rounded-xl border border-ink-100">
                      <div className="text-center md:text-left">
                        <p className="text-[10px] font-bold text-ink-500 uppercase">Highest Verified Offer</p>
                        <p className="text-lg font-black text-ink-900 mt-1">{highest.marketplace}</p>
                        <p className="text-xl font-bold text-ink-700">{formatINR(highest.price)}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-ink-400 uppercase mb-2">Difference</span>
                        <div className="bg-white border border-ink-200 px-4 py-2 rounded-full font-black text-accent-700 shadow-sm whitespace-nowrap">
                          {formatINR(highest.price)} - {formatINR(lowest.price)} = {formatINR(highest.price - lowest.price)}
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-bold text-ink-500 uppercase">Lowest Verified Offer</p>
                        <p className="text-lg font-black text-accent-700 mt-1">{lowest.marketplace}</p>
                        <p className="text-xl font-bold text-accent-700">{formatINR(lowest.price)}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm font-semibold text-green-900">
                        <strong className="font-black">Why this is the best verified deal:</strong> Among the verified marketplace offers returned for the exact product and variant, {lowest.marketplace} has the lowest current verified price.
                      </p>
                    </div>
                  </section>
                );
              }
              return null;
            })()}
`;

const researchEvidence = `
            {/* 9. RESEARCH EVIDENCE */}
            {data.evidence && (
              <section className="card bg-ink-900 text-white p-6 border border-ink-800 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-xs font-black text-ink-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-4 w-4 text-green-400" /> AI Research Evidence
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Input</p>
                    <p className="text-sm font-black text-ink-100 line-clamp-1" title={data.evidence.input}>{data.evidence.input}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Intent</p>
                    <p className="text-sm font-black text-blue-400">{data.evidence.intent}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Research Mode</p>
                    <p className="text-sm font-black text-purple-400">{data.evidence.researchMode.replace('_', ' ')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Product Identity</p>
                    <p className="text-sm font-black text-green-400">{data.evidence.identity}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Variant</p>
                    <p className="text-sm font-black text-green-400">{data.evidence.variant}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Image</p>
                    <p className={\`text-sm font-black \${data.evidence.image === 'VERIFIED' ? 'text-green-400' : 'text-amber-400'}\`}>{data.evidence.image}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Marketplaces</p>
                    <p className="text-sm font-black text-ink-100">{data.evidence.verifiedOffers} Verified Offers</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Sources</p>
                    <p className="text-sm font-black text-ink-100">{data.evidence.sources.length} Verified Sources</p>
                  </div>
                </div>
              </section>
            )}
`;

const sourceCards = `
            {/* 10. WEB SOURCES */}
            {data.evidence && data.evidence.sources && data.evidence.sources.length > 0 && (
              <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-ink-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <LinkIcon className="h-4 w-4 text-accent-600" /> Source Traceability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.evidence.sources.map((src, idx) => {
                    let domain = 'Unknown';
                    try {
                      domain = new URL(src).hostname;
                    } catch(e) {}
                    
                    return (
                      <div key={idx} className="p-4 bg-ink-50 border border-ink-100 rounded-xl flex flex-col justify-between h-full">
                        <div>
                          <p className="text-sm font-black text-ink-900 truncate mb-1" title={src}>{domain}</p>
                          <p className="text-[10px] font-bold text-ink-500 uppercase mb-3">Verified Source</p>
                          <div className="space-y-1 mb-4">
                            <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Used for Pricing</p>
                            <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Used for Product Identity</p>
                            <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Used for AI Analysis</p>
                          </div>
                        </div>
                        <a href={src} target="_blank" rel="noopener noreferrer" className="btn-outline py-2 px-4 text-xs inline-flex items-center justify-center gap-2 mt-auto w-full">
                          OPEN SOURCE <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
`;

let modAiResearch = aiResearch.replace(
  '<Zap className="h-4 w-4 text-accent-600" /> AI Verdict',
  '<Zap className="h-4 w-4 text-accent-600" /> AI Verdict <span className="ml-auto text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200">BASED ON VERIFIED SOURCES</span>'
);
modAiResearch = modAiResearch.replace(/\{\/\* SOURCES \*\/\}[\s\S]*?\}\)/s, '');

const successStartStr = '{/* SUCCESS RESULT STATE */}';
const beforeSuccess = content.substring(0, content.indexOf(successStartStr));
const afterSuccess = content.substring(content.lastIndexOf('</main>'));

const newContent = beforeSuccess + successStartStr + '\n' +
  '        {data && !isLoading && (\n' +
  '          <div className="space-y-8 animate-in fade-in duration-500">\n' +
  (productIdentity ? productIdentity : '') + '\n' +
  (partialShield ? partialShield : '') + '\n' +
  (bestDeal ? bestDeal : '') + '\n' +
  (sourceVsBest ? sourceVsBest : '') + '\n' +
  (metricsCards ? metricsCards : '') + '\n' +
  (preferredStore ? preferredStore : '') + '\n' +
  (compareStores ? compareStores : '') + '\n' +
  howCalculated + '\n' +
  (modAiResearch ? modAiResearch : '') + '\n' +
  researchEvidence + '\n' +
  sourceCards + '\n' +
  '          </div>\n' +
  '        )}\n' +
  afterSuccess;

fs.writeFileSync('client/src/pages/AIAnalysisPage.jsx', newContent);
console.log('Reorder complete');
