/**
 * ListingCard - Carte de listing avec éléments de trust
 * Features:
 * - Badge "Vérifié" animé
 * - Compteur campagnes réussies
 * - Indicateur disponibilité temps réel
 * - Prix TTC visible
 * - Distance depuis position
 * - Note moyenne avec micro-étoiles
 * - Tag "Populaire" ou "Coup de cœur"
 */

import { useState } from 'react';

interface ListingCardProps {
  id: string;
  images: string[];
  title: string;
  location: string;
  type: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  campaignCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  availableFrom?: string;
  distance?: number;
  badge?: 'popular' | 'favorite' | 'new';
  ownerResponseTime?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? 'text-amber-400'
              : star - 0.5 <= rating
              ? 'text-amber-400'
              : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <div className="flex items-center gap-1 rounded-full bg-secondary-500 px-2 py-0.5 text-xs font-medium text-white">
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span>Vérifié</span>
    </div>
  );
}

function BadgeTag({ type }: { type: 'popular' | 'favorite' | 'new' }) {
  const config = {
    popular: { label: 'Populaire', bg: 'bg-primary-500', icon: '🔥' },
    favorite: { label: 'Coup de cœur', bg: 'bg-pink-500', icon: '❤️' },
    new: { label: 'Nouveau', bg: 'bg-blue-500', icon: '✨' },
  };
  const { label, bg, icon } = config[type];

  return (
    <div className={`flex items-center gap-1 rounded-full ${bg} px-2.5 py-1 text-xs font-semibold text-white`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function AvailabilityIndicator({ isAvailable, availableFrom }: { isAvailable: boolean; availableFrom?: string }) {
  if (isAvailable) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-green-600 font-medium">Disponible</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
      <span className="text-amber-600">Dispo. {availableFrom}</span>
    </div>
  );
}

export function ListingCard({
  images,
  title,
  location,
  type,
  price,
  priceUnit,
  rating,
  reviewCount,
  campaignCount,
  isVerified,
  isAvailable,
  availableFrom,
  distance,
  badge,
  ownerResponseTime,
}: ListingCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const formattedPrice = price.toLocaleString('fr-FR');

  return (
    <article
      className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Images */}
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${title} - Image ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {badge && <BadgeTag type={badge} />}
          {isVerified && <VerifiedBadge />}
        </div>

        {/* Favorite button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 transition-all hover:bg-white hover:scale-110"
        >
          <svg
            className={`h-5 w-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'fill-transparent text-gray-700'
            }`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Image pagination dots (on hover) */}
        {images.length > 1 && (
          <div
            className={`absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentImage
                    ? 'w-4 bg-white'
                    : 'w-1.5 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}

        {/* Arrow navigation (on hover) */}
        {images.length > 1 && isHovered && (
          <>
            <button
              onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and rating row */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <StarRating rating={rating} />
            <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({reviewCount})</span>
          </div>
        </div>

        {/* Location and type */}
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{location}</span>
          <span className="text-gray-300">•</span>
          <span>{type}</span>
          {distance && (
            <>
              <span className="text-gray-300">•</span>
              <span>{distance} km</span>
            </>
          )}
        </div>

        {/* Trust indicators */}
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <svg className="h-4 w-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>{campaignCount}</strong> campagnes réussies</span>
          </div>
          {ownerResponseTime && (
            <div className="flex items-center gap-1 text-gray-600">
              <svg className="h-4 w-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Répond en {ownerResponseTime}</span>
            </div>
          )}
        </div>

        {/* Availability and Price */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-3">
          <AvailabilityIndicator isAvailable={isAvailable} availableFrom={availableFrom} />
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formattedPrice} <span className="text-sm font-normal text-gray-600">FCFA</span>
            </div>
            <div className="text-xs text-gray-500">{priceUnit} · TTC</div>
          </div>
        </div>
      </div>
    </article>
  );
}

// Demo component to show multiple cards
export function ListingCardDemo() {
  const listings: ListingCardProps[] = [
    {
      id: '1',
      images: [
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
      ],
      title: 'Panneau LED 4x3m - Boulevard VGE',
      location: 'Marcory, Zone 4',
      type: '4x3m LED',
      price: 250000,
      priceUnit: '/mois',
      rating: 4.8,
      reviewCount: 24,
      campaignCount: 47,
      isVerified: true,
      isAvailable: true,
      distance: 2.3,
      badge: 'popular',
      ownerResponseTime: '< 1h',
    },
    {
      id: '2',
      images: [
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
      ],
      title: 'Grand Format Carrefour Solibra',
      location: 'Treichville',
      type: '12x4m',
      price: 450000,
      priceUnit: '/mois',
      rating: 4.9,
      reviewCount: 18,
      campaignCount: 32,
      isVerified: true,
      isAvailable: false,
      availableFrom: '15 Fév',
      badge: 'favorite',
      ownerResponseTime: '< 2h',
    },
    {
      id: '3',
      images: [
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80',
        'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800&q=80',
        'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&q=80',
      ],
      title: 'Panneau Classique Plateau',
      location: 'Plateau Business',
      type: '3x2m',
      price: 120000,
      priceUnit: '/mois',
      rating: 4.5,
      reviewCount: 8,
      campaignCount: 12,
      isVerified: false,
      isAvailable: true,
      distance: 0.8,
      badge: 'new',
    },
  ];

  return (
    <div className="bg-gray-50 p-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Panneaux populaires</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
    </div>
  );
}
