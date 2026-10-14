import { useState } from 'react';
import { Smartphone, Laptop, Headphones, Watch, Tv, Shirt, Package, Image as ImageIcon } from 'lucide-react';

function getCategoryIcon(category = '', name = '') {
  const text = `${category} ${name}`.toLowerCase();
  if (text.includes('phone') || text.includes('mobile')) return <Smartphone className="w-8 h-8 text-ink-300" />;
  if (text.includes('laptop') || text.includes('computer')) return <Laptop className="w-8 h-8 text-ink-300" />;
  if (text.includes('audio') || text.includes('headphone') || text.includes('earbuds')) return <Headphones className="w-8 h-8 text-ink-300" />;
  if (text.includes('watch')) return <Watch className="w-8 h-8 text-ink-300" />;
  if (text.includes('tv') || text.includes('television')) return <Tv className="w-8 h-8 text-ink-300" />;
  if (text.includes('fashion') || text.includes('apparel') || text.includes('clothing')) return <Shirt className="w-8 h-8 text-ink-300" />;
  return <Package className="w-8 h-8 text-ink-300" />;
}

export default function ProductImage({ src, alt, category, className = '', aspectClassName = 'aspect-square' }) {
  const [error, setError] = useState(false);

  // If no image or if image fails to load
  if (!src || error) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl bg-ink-50/70 p-4 border border-ink-100/70 select-none ${aspectClassName} ${className}`}
        aria-label={alt || 'Product image pending'}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-ink-100 mb-2">
          {getCategoryIcon(category, alt)}
        </div>
        <span className="text-[11px] font-semibold text-ink-500 text-center line-clamp-1">{alt || 'Product'}</span>
        <span className="text-[9px] font-medium text-ink-400 mt-0.5">Image pending</span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-white ${aspectClassName} ${className}`}>
      <img
        src={src}
        alt={alt || 'Product image'}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
        className="h-full w-full object-contain max-h-full max-w-full transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}
