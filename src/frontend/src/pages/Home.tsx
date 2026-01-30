import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Shield, TrendingUp, ArrowRight, Star,
  CheckCircle, Users, Clock, Camera, MessageCircle, CreditCard,
  ChevronLeft, ChevronRight, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QUARTIERS } from '@/lib/utils';

// Images d'Abidjan - Photos réelles de la ville (Pexels & Unsplash)
const heroImages = [
  {
    id: 1,
    url: 'https://images.pexels.com/photos/7381783/pexels-photo-7381783.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Échangeur Autoroute',
    location: 'Plateau, Abidjan',
    price: '350 000 FCFA/mois',
    size: '4x3m',
  },
  {
    id: 2,
    url: 'https://images.pexels.com/photos/7381786/pexels-photo-7381786.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Boulevard Lagunaire',
    location: 'Cocody, Abidjan',
    price: '280 000 FCFA/mois',
    size: '6x4m',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1590845947376-2638caa89b99?w=1920&q=80',
    title: 'Marché Adjamé',
    location: 'Adjamé, Abidjan',
    price: '420 000 FCFA/mois',
    size: '8x4m',
  },
  {
    id: 4,
    url: 'https://images.pexels.com/photos/19733047/pexels-photo-19733047.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Stade Alassane Ouattara',
    location: 'Ebimpé, Abidjan',
    price: '180 000 FCFA/mois',
    size: '3x2m',
  },
];

// Catégories de panneaux
const categories = [
  { id: 'visibility', label: 'Haute Visibilité', icon: '👁️', color: 'bg-orange-500', count: 124 },
  { id: 'premium', label: 'Premium', icon: '⭐', color: 'bg-amber-500', count: 45 },
  { id: 'budget', label: 'Budget', icon: '💰', color: 'bg-green-500', count: 89 },
  { id: 'center', label: 'Centre-ville', icon: '🏙️', color: 'bg-blue-500', count: 67 },
  { id: 'axes', label: 'Axes Express', icon: '🛣️', color: 'bg-purple-500', count: 156 },
  { id: 'digital', label: 'Digital', icon: '📺', color: 'bg-pink-500', count: 23 },
];

// Stats animées
const stats = [
  { value: 500, suffix: '+', label: 'Panneaux disponibles', icon: MapPin },
  { value: 1200, suffix: '+', label: 'Campagnes réalisées', icon: TrendingUp },
  { value: 98, suffix: '%', label: 'Clients satisfaits', icon: Star },
  { value: 10, suffix: '', label: 'Quartiers couverts', icon: Users },
];

// Panneaux en vedette (Featured) - Photos réelles d'Afrique de l'Ouest
const featuredListings = [
  {
    id: '1',
    title: 'Panneau Premium Plateau',
    location: 'Plateau',
    price: 450000,
    size: '8x4m',
    rating: 4.9,
    reviews: 32,
    image: 'https://images.pexels.com/photos/7381783/pexels-photo-7381783.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    verified: true,
  },
  {
    id: '2',
    title: 'Emplacement Cocody Riviera',
    location: 'Cocody',
    price: 320000,
    size: '6x3m',
    rating: 4.7,
    reviews: 18,
    image: 'https://images.pexels.com/photos/7381786/pexels-photo-7381786.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    verified: true,
  },
  {
    id: '3',
    title: 'Panneau Marcory Zone 4',
    location: 'Marcory',
    price: 180000,
    size: '4x3m',
    rating: 4.5,
    reviews: 24,
    image: 'https://images.pexels.com/photos/19733052/pexels-photo-19733052.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    verified: false,
  },
  {
    id: '4',
    title: 'Affichage Treichville Port',
    location: 'Treichville',
    price: 280000,
    size: '5x3m',
    rating: 4.8,
    reviews: 41,
    image: 'https://images.pexels.com/photos/19733047/pexels-photo-19733047.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: false,
    verified: true,
  },
];

// Témoignages
const testimonials = [
  {
    id: 1,
    name: 'Kouamé Yao',
    role: 'Directeur Marketing, Solibra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    content: "PromotionHub a révolutionné notre façon de faire de la publicité extérieure. En quelques clics, nous avons trouvé les meilleurs emplacements à Abidjan.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Aminata Diallo',
    role: 'Propriétaire, 12 panneaux',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    content: "Depuis que j'utilise PromotionHub, mes panneaux sont occupés à 95% du temps. La plateforme m'a permis d'augmenter mes revenus de 40%.",
    rating: 5,
  },
  {
    id: 3,
    name: 'Jean-Pierre Kassi',
    role: 'CEO, Kassi Distribution',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    content: "La transparence des prix et la vérification des emplacements nous ont fait gagner un temps précieux. Je recommande vivement!",
    rating: 5,
  },
];

// Images et données par quartier - Photos d'Abidjan et Afrique de l'Ouest (Pexels)
const quartierData: Record<string, { image: string; count: number }> = {
  'Plateau': { image: 'https://images.pexels.com/photos/7381783/pexels-photo-7381783.jpeg?auto=compress&cs=tinysrgb&w=600', count: 87 },
  'Cocody': { image: 'https://images.pexels.com/photos/7381786/pexels-photo-7381786.jpeg?auto=compress&cs=tinysrgb&w=600', count: 124 },
  'Marcory': { image: 'https://images.pexels.com/photos/19733052/pexels-photo-19733052.jpeg?auto=compress&cs=tinysrgb&w=600', count: 56 },
  'Treichville': { image: 'https://images.pexels.com/photos/19733047/pexels-photo-19733047.jpeg?auto=compress&cs=tinysrgb&w=600', count: 43 },
  'Yopougon': { image: 'https://images.pexels.com/photos/17290985/pexels-photo-17290985.jpeg?auto=compress&cs=tinysrgb&w=600', count: 78 },
  'Adjamé': { image: 'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=600', count: 35 },
  'Abobo': { image: 'https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg?auto=compress&cs=tinysrgb&w=600', count: 29 },
  'Koumassi': { image: 'https://images.pexels.com/photos/3889827/pexels-photo-3889827.jpeg?auto=compress&cs=tinysrgb&w=600', count: 22 },
  'Port-Bouët': { image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', count: 18 },
  'Bingerville': { image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=600', count: 12 },
};

// Animated Counter Component
function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
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
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${value}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span id={`counter-${value}`} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  return (
    <div className="overflow-x-hidden">
      {/* ============ HERO SECTION - Immersif avec Carrousel ============ */}
      <section className="relative h-[90vh] min-h-[700px] overflow-hidden bg-gray-900">
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-sm transition hover:bg-white/30"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-sm transition hover:bg-white/30"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Hero Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
          {/* Badge */}
          <div className="mb-6 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="text-sm font-medium text-white">
              🇨🇮 La 1ère marketplace de panneaux publicitaires en Côte d'Ivoire
            </span>
          </div>

          {/* Main Title */}
          <h1 className="mb-6 text-center text-4xl font-bold text-white drop-shadow-lg md:text-5xl lg:text-7xl">
            Trouvez l'emplacement
            <span className="mt-2 block bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
              parfait pour votre pub
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 max-w-2xl text-center text-lg text-white/90 md:text-xl">
            Réservez des panneaux publicitaires à Abidjan en quelques clics.
            Paiement sécurisé, vérification garantie.
          </p>

          {/* Search Bar */}
          <div className="mb-8 w-full max-w-3xl">
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl sm:flex-row sm:rounded-full">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par quartier, type de panneau..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                />
              </div>
              <Link to={`/listings${searchQuery ? `?q=${searchQuery}` : ''}`}>
                <Button size="lg" className="w-full sm:w-auto sm:rounded-full">
                  <Search className="h-5 w-5" />
                  Rechercher
                </Button>
              </Link>
            </div>
          </div>

          {/* Category Chips */}
          <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-5 sm:py-2.5 ${
                  selectedCategory === category.id
                    ? `${category.color} text-white shadow-lg scale-105`
                    : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-md'
                }`}
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.label}</span>
                <span className="text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex gap-4">
            <Link to="/listings">
              <Button variant="outline" className="border-white/50 text-white hover:bg-white/10">
                Voir tous les panneaux
              </Button>
            </Link>
            <Link to="/signup?role=owner">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Proposer mon panneau
              </Button>
            </Link>
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
        <div className="absolute bottom-8 right-8 z-10 hidden rounded-xl bg-black/50 p-4 backdrop-blur-sm lg:block">
          <p className="font-semibold text-white">{heroImages[currentSlide].title}</p>
          <p className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-3 w-3" />
            {heroImages[currentSlide].location}
          </p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <span className="text-lg font-bold text-primary-400">
              {heroImages[currentSlide].price}
            </span>
            <span className="rounded bg-white/20 px-2 py-1 text-xs text-white">
              {heroImages[currentSlide].size}
            </span>
          </div>
        </div>
      </section>

      {/* ============ STATS SECTION ============ */}
      <section className="relative -mt-16 z-20 mx-4 lg:mx-auto lg:max-w-6xl">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-xl md:grid-cols-4 md:gap-8 md:p-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 md:text-3xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED LISTINGS ============ */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Panneaux en vedette
              </h2>
              <p className="mt-2 text-gray-600">
                Les emplacements les plus populaires à Abidjan
              </p>
            </div>
            <Link to="/listings" className="hidden items-center gap-2 text-primary-600 hover:text-primary-700 sm:flex">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {listing.verified && (
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                      <CheckCircle className="h-3 w-3" />
                      Vérifié
                    </div>
                  )}
                  {!listing.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white">
                        Réservé
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {listing.location}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {listing.size}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-primary-600">
                    {listing.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(listing.price)}
                      <span className="text-sm font-normal text-gray-500">/mois</span>
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{listing.rating}</span>
                      <span className="text-gray-400">({listing.reviews})</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/listings">
              <Button variant="outline">
                Voir tous les panneaux
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ QUARTIERS AVEC IMAGES ============ */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Explorez par quartier
            </h2>
            <p className="mt-2 text-gray-600">
              Découvrez les emplacements disponibles dans chaque zone d'Abidjan
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {QUARTIERS.map((quartier) => (
              <Link
                key={quartier}
                to={`/listings?quartier=${quartier}`}
                className="group relative aspect-square overflow-hidden rounded-2xl"
              >
                <img
                  src={quartierData[quartier]?.image || 'https://images.pexels.com/photos/7381783/pexels-photo-7381783.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={quartier}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white">{quartier}</h3>
                  <p className="text-sm text-white/80">
                    {quartierData[quartier]?.count || 0} panneaux
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMMENT CA MARCHE ============ */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mt-2 text-gray-600">
              Réservez votre espace publicitaire en 3 étapes simples
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: 1,
                icon: Search,
                title: 'Trouvez votre panneau',
                description: 'Parcourez notre catalogue de panneaux par quartier, taille ou budget. Filtrez selon vos besoins.',
                color: 'bg-primary-500',
              },
              {
                step: 2,
                icon: CreditCard,
                title: 'Réservez en ligne',
                description: 'Choisissez vos dates, validez le contrat et payez en toute sécurité via Mobile Money ou carte.',
                color: 'bg-secondary-500',
              },
              {
                step: 3,
                icon: Camera,
                title: 'Vérifiez votre affichage',
                description: 'Recevez une photo de preuve que votre publicité est bien affichée. Suivi garanti.',
                color: 'bg-blue-500',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                {item.step < 3 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gray-200 md:block" />
                )}
                <div className={`relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${item.color}`}>
                  <item.icon className="h-10 w-10 text-white" />
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES / AVANTAGES ============ */}
      <section className="bg-gray-900 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Pourquoi choisir PromotionHub ?
            </h2>
            <p className="mt-2 text-gray-400">
              La solution complète pour votre publicité extérieure
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Search,
                title: 'Recherche intelligente',
                description: 'Filtres avancés par quartier, taille, prix et disponibilité. Trouvez le panneau parfait en quelques secondes.',
                color: 'text-primary-400',
              },
              {
                icon: Shield,
                title: 'Paiement sécurisé',
                description: 'Orange Money, MTN Mobile Money ou carte bancaire. Votre argent est protégé jusqu\'à validation.',
                color: 'text-green-400',
              },
              {
                icon: Camera,
                title: 'Vérification photo',
                description: 'Recevez une preuve photo que votre publicité est bien affichée. Transparence totale.',
                color: 'text-blue-400',
              },
              {
                icon: MessageCircle,
                title: 'Chat intégré',
                description: 'Communiquez directement avec les propriétaires. Négociez et posez vos questions.',
                color: 'text-purple-400',
              },
              {
                icon: TrendingUp,
                title: 'Analytics en temps réel',
                description: 'Suivez vos campagnes, visualisez les performances et optimisez votre ROI.',
                color: 'text-amber-400',
              },
              {
                icon: Clock,
                title: 'Réservation instantanée',
                description: 'Réservez 24h/24, 7j/7. Confirmation immédiate, contrat digital automatique.',
                color: 'text-cyan-400',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-800 bg-gray-800/50 p-8 transition-all hover:border-gray-700 hover:bg-gray-800"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-700 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Ils nous font confiance
            </h2>
            <p className="mt-2 text-gray-600">
              Découvrez ce que nos clients disent de PromotionHub
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6">
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="mb-4 h-8 w-8 text-primary-200" />
                <p className="mb-6 text-gray-600">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 py-16 lg:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
            Prêt à booster votre visibilité ?
          </h2>
          <p className="mb-8 text-lg text-primary-100 md:text-xl">
            Rejoignez des centaines d'annonceurs qui font confiance à PromotionHub
            pour leurs campagnes publicitaires à Abidjan.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                Créer mon compte gratuit
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/listings">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Explorer les panneaux
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-primary-200">
            ✓ Inscription gratuite &nbsp;&nbsp; ✓ Pas de frais cachés &nbsp;&nbsp; ✓ Support 24/7
          </p>
        </div>
      </section>
    </div>
  );
}
