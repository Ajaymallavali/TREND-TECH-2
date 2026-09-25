import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function ProductImage({ src, alt, category, className = '', aspectClassName = 'aspect-square' }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl bg-ink-50/80 p-4 border border-ink-100/60 text-ink-400 select-none ${aspectClassName} ${className}`}
        aria-label={alt || 'Verified image unavailable'}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ink-100/70 mb-1.5">
          <ImageOff className="w-4 h-4 text-ink-400" />
        </div>
        <span className="text-[11px] font-semibold text-ink-600">Verified image unavailable</span>
        <span className="text-[9px] text-ink-400 mt-0.5 text-center">Product identity preserved</span>
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
        className="h-full w-full object-contain max-h-full max-w-full"
      />
    </div>
  );
}
