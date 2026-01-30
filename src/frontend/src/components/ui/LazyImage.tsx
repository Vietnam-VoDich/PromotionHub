import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  blurHash?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

export function LazyImage({
  src,
  alt,
  placeholderSrc,
  className,
  aspectRatio = '4/3',
  objectFit = 'cover',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // start loading 100px before visible
        threshold: 0,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={{ aspectRatio }}
    >
      {/* placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {/* actual image - only load when in view */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          className={cn(
            'h-full w-full transition-opacity duration-300',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}

      {/* error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// optimized image with srcset for responsive loading
interface ResponsiveImageProps extends LazyImageProps {
  sizes?: string;
  srcSet?: string;
}

export function ResponsiveImage({
  src,
  srcSet,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props
}: ResponsiveImageProps) {
  // generate srcset for Cloudinary/Pexels images
  const generateSrcSet = (baseUrl: string): string => {
    // for Pexels images
    if (baseUrl.includes('pexels.com')) {
      return [
        `${baseUrl.replace(/w=\d+/, 'w=400')} 400w`,
        `${baseUrl.replace(/w=\d+/, 'w=800')} 800w`,
        `${baseUrl.replace(/w=\d+/, 'w=1200')} 1200w`,
      ].join(', ');
    }

    // for Cloudinary images
    if (baseUrl.includes('cloudinary.com')) {
      const parts = baseUrl.split('/upload/');
      if (parts.length === 2) {
        return [
          `${parts[0]}/upload/w_400,c_limit/${parts[1]} 400w`,
          `${parts[0]}/upload/w_800,c_limit/${parts[1]} 800w`,
          `${parts[0]}/upload/w_1200,c_limit/${parts[1]} 1200w`,
        ].join(', ');
      }
    }

    return '';
  };

  const computedSrcSet = srcSet || generateSrcSet(src);

  return (
    <LazyImage
      src={src}
      srcSet={computedSrcSet || undefined}
      sizes={computedSrcSet ? sizes : undefined}
      {...props}
    />
  );
}
