/**
 * HeroSection - Nouveau hero immersif inspiré Airbnb
 * Features:
 * - Carrousel plein écran avec panneaux iconiques
 * - Chips catégories émotionnelles
 * - Stats animées
 * - Search bar intégré
 */

import { useState, useEffect } from 'react';

// mock data for carousel
const heroImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80',
    title: 'Plateau Business District',
    location: 'Abidjan, Côte d\'Ivoire',
    price: '250 000 FCFA/mois',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80',
    title: 'Boulevard VGE',
    location: 'Zone 4, Marcory',
    price: '180 000 FCFA/mois',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80',
    title: 'Carrefour Solibra',
    location: 'Treichville',
    price: '320 000 FCFA/mois',
  },
];

const categories = [
  { id: 'visibility', label: 'Haute Visibilité', icon: '👁️', color: 'bg-orange-500' },
  { id: 'premium', label: 'Premium', icon: '⭐', color: 'bg-amber-500' },
  { id: 'budget', label: 'Budget', icon: '💰', color: 'bg-green-500' },
  { id: 'center', label: 'Centre-ville', icon: '🏙️', color: 'bg-blue-500' },
  { id: 'axes', label: 'Axes Express', icon: '🛣️', color: 'bg-purple-500' },
  { id: 'digital', label: 'Digital', icon: '📺', color: 'bg-pink-500' },
];

const stats = [
  { value: 500, suffix: '+', label: 'Panneaux' },
  { value: 1200, suffix: '+', label: 'Campagnes' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-gray-900">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.title}
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        {/* Main Title */}
        <h1 className="mb-4 text-center text-4xl font-bold text-white drop-shadow-lg md:text-5xl lg:text-6xl">
          Trouvez l'emplacement parfait
          <span className="mt-2 block text-primary-400">pour votre campagne</span>
        </h1>

        {/* Subtitle */}
        <p className="mb-8 max-w-2xl text-center text-lg text-white/90 md:text-xl">
          La première marketplace de panneaux publicitaires en Côte d'Ivoire
        </p>

        {/* Search Bar */}
        <div className="mb-8 w-full max-w-2xl">
          <div className="flex overflow-hidden rounded-full bg-white shadow-2xl">
            <input
              type="text"
              placeholder="Rechercher par zone, type de panneau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
            />
            <button className="m-2 rounded-full bg-primary-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-600">
              <span className="hidden sm:inline">Rechercher</span>
              <svg
                className="h-5 w-5 sm:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? `${category.color} text-white shadow-lg scale-105`
                  : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-md'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-white md:text-4xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Current Slide Info */}
      <div className="absolute bottom-8 right-8 z-10 hidden rounded-lg bg-black/50 p-4 backdrop-blur-sm md:block">
        <p className="font-semibold text-white">{heroImages[currentSlide].title}</p>
        <p className="text-sm text-white/80">{heroImages[currentSlide].location}</p>
        <p className="mt-1 text-lg font-bold text-primary-400">
          {heroImages[currentSlide].price}
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-bounce md:hidden">
        <svg
          className="h-6 w-6 text-white/80"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
