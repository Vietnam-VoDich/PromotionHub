import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Shield, TrendingUp, ArrowRight, Star,
  CheckCircle, Users, Clock, Camera, MessageCircle, CreditCard,
  ChevronLeft, ChevronRight, Quote, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QUARTIERS } from '@/lib/utils';

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

const categories = [
  { id: 'visibility', label: 'Haute Visibilité', icon: '👁️', color: 'from-orange-500 to-amber-500', count: 124 },
  { id: 'premium', label: 'Premium', icon: '⭐', color: 'from-amber-500 to-yellow-500', count: 45 },
  { id: 'budget', label: 'Budget', icon: '💰', color: 'from-emerald-500 to-green-500', count: 89 },
  { id: 'center', label: 'Centre-ville', icon: '🏙️', color: 'from-blue-500 to-cyan-500', count: 67 },
  { id: 'axes', label: 'Axes Express', icon: '🛣️', color: 'from-purple-500 to-violet-500', count: 156 },
  { id: 'digital', label: 'Digital', icon: '📺', color: 'from-pink-500 to-rose-500', count: 23 },
];

const stats = [
  { value: 500, suffix: '+', label: 'Panneaux disponibles', icon: MapPin },
  { value: 1200, suffix: '+', label: 'Campagnes réalisées', icon: TrendingUp },
  { value: 98, suffix: '%', label: 'Clients satisfaits', icon: Star },
  { value: 10, suffix: '', label: 'Quartiers couverts', icon: Users },
];

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
    <div className="overflow-x-hidden bg-dark-950">
      {/* HERO SECTION */}
      <section className="relative h-[90vh] min-h-[700px] overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-b from-dark-950/70 via-dark-950/40 to-dark-950" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-xl bg-dark-800/80 p-3 backdrop-blur-sm transition hover:bg-dark-700"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-xl bg-dark-800/80 p-3 backdrop-blur-sm transition hover:bg-dark-700"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Hero Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-4 py-2 backdrop-blur-sm border border-primary-500/30">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">
              La 1ère marketplace de panneaux publicitaires en Côte d'Ivoire
            </span>
          </div>

          {/* Main Title */}
          <h1 className="mb-6 text-center text-4xl font-bold text-white drop-shadow-lg md:text-5xl lg:text-7xl">
            Trouvez l'emplacement
            <span className="mt-2 block bg-gradient-to-r from-primary-400 via-primary-300 to-primary-500 bg-clip-text text-transparent">
              parfait pour votre pub
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 max-w-2xl text-center text-lg text-dark-200 md:text-xl">
            Réservez des panneaux publicitaires à Abidjan en quelques clics.
            Paiement sécurisé, vérification garantie.
          </p>

          {/* Search Bar */}
          <div className="mb-8 w-full max-w-3xl">
            <div className="flex flex-col gap-3 rounded-2xl bg-dark-800/90 backdrop-blur-md p-3 shadow-2xl border border-dark-700/50 sm:flex-row sm:rounded-full">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Rechercher par quartier, type de panneau..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent py-3 text-white placeholder-dark-400 focus:outline-none"
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
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                    : 'bg-dark-800/80 text-dark-200 hover:bg-dark-700 border border-dark-700/50'
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
              <Button variant="outline" size="lg">
                Voir tous les panneaux
              </Button>
            </Link>
            <Link to="/signup?role=owner">
              <Button variant="ghost" size="lg" className="text-dark-200 hover:text-white">
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
                  ? 'w-8 bg-primary-400'
                  : 'w-2 bg-dark-500 hover:bg-dark-400'
              }`}
            />
          ))}
        </div>

        {/* Current Slide Info */}
        <div className="absolute bottom-8 right-8 z-10 hidden rounded-xl bg-dark-800/90 backdrop-blur-md p-4 border border-dark-700/50 lg:block">
          <p className="font-semibold text-white">{heroImages[currentSlide].title}</p>
          <p className="flex items-center gap-1 text-sm text-dark-300">
            <MapPin className="h-3 w-3" />
            {heroImages[currentSlide].location}
          </p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <span className="text-lg font-bold text-primary-400">
              {heroImages[currentSlide].price}
            </span>
            <span className="rounded-lg bg-dark-700 px-2 py-1 text-xs text-dark-200">
              {heroImages[currentSlide].size}
            </span>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative -mt-16 z-20 mx-4 lg:mx-auto lg:max-w-6xl">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-dark-800/90 backdrop-blur-md p-6 shadow-xl border border-dark-700/50 md:grid-cols-4 md:gap-8 md:p-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30">
                <stat.icon className="h-6 w-6 text-primary-400" />
              </div>
              <div className="text-2xl font-bold text-white md:text-3xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-dark-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Panneaux en vedette
              </h2>
              <p className="mt-2 text-dark-400">
                Les emplacements les plus populaires à Abidjan
              </p>
            </div>
            <Link to="/listings" className="hidden items-center gap-2 text-primary-400 hover:text-primary-300 sm:flex">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                className="group overflow-hidden rounded-2xl bg-dark-800 border border-dark-700/50 transition-all hover:border-dark-600 hover:shadow-xl hover:shadow-dark-950/50"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {listing.verified && (
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-white">
                      <CheckCircle className="h-3 w-3" />
                      Vérifié
                    </div>
                  )}
                  {!listing.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-950/60 backdrop-blur-sm">
                      <span className="rounded-full bg-red-500/90 px-4 py-2 text-sm font-medium text-white">
                        Réservé
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-dark-400">
                      <MapPin className="h-4 w-4" />
                      {listing.location}
                    </span>
                    <span className="rounded-lg bg-dark-700 px-2 py-1 text-xs text-dark-300">
                      {listing.size}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {listing.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-400">
                      {formatPrice(listing.price)}
                      <span className="text-sm font-normal text-dark-500">/mois</span>
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-white">{listing.rating}</span>
                      <span className="text-dark-500">({listing.reviews})</span>
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

      {/* QUARTIERS */}
      <section className="py-16 lg:py-24 bg-dark-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Explorez par quartier
            </h2>
            <p className="mt-2 text-dark-400">
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
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white">{quartier}</h3>
                  <p className="text-sm text-dark-300">
                    {quartierData[quartier]?.count || 0} panneaux
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mt-2 text-dark-400">
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
                gradient: 'from-primary-500 to-orange-500',
              },
              {
                step: 2,
                icon: CreditCard,
                title: 'Réservez en ligne',
                description: 'Choisissez vos dates, validez le contrat et payez en toute sécurité via Mobile Money ou carte.',
                gradient: 'from-secondary-500 to-emerald-500',
              },
              {
                step: 3,
                icon: Camera,
                title: 'Vérifiez votre affichage',
                description: 'Recevez une photo de preuve que votre publicité est bien affichée. Suivi garanti.',
                gradient: 'from-blue-500 to-cyan-500',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                {item.step < 3 && (
                  <div className="absolute left-1/2 top-14 hidden h-0.5 w-full bg-dark-700 md:block" />
                )}
                <div className={`relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                  <item.icon className="h-12 w-12 text-white" />
                  <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-dark-800 text-sm font-bold text-white border-2 border-dark-700">
                    {item.step}
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-dark-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 lg:py-24 bg-dark-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Pourquoi choisir PromotionHub ?
            </h2>
            <p className="mt-2 text-dark-400">
              La solution complète pour votre publicité extérieure
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Search,
                title: 'Recherche intelligente',
                description: 'Filtres avancés par quartier, taille, prix et disponibilité. Trouvez le panneau parfait en quelques secondes.',
                gradient: 'from-primary-500/20 to-orange-500/20',
                iconColor: 'text-primary-400',
              },
              {
                icon: Shield,
                title: 'Paiement sécurisé',
                description: 'Orange Money, MTN Mobile Money ou carte bancaire. Votre argent est protégé jusqu\'à validation.',
                gradient: 'from-emerald-500/20 to-green-500/20',
                iconColor: 'text-emerald-400',
              },
              {
                icon: Camera,
                title: 'Vérification photo',
                description: 'Recevez une preuve photo que votre publicité est bien affichée. Transparence totale.',
                gradient: 'from-blue-500/20 to-cyan-500/20',
                iconColor: 'text-blue-400',
              },
              {
                icon: MessageCircle,
                title: 'Chat intégré',
                description: 'Communiquez directement avec les propriétaires. Négociez et posez vos questions.',
                gradient: 'from-purple-500/20 to-violet-500/20',
                iconColor: 'text-purple-400',
              },
              {
                icon: TrendingUp,
                title: 'Analytics en temps réel',
                description: 'Suivez vos campagnes, visualisez les performances et optimisez votre ROI.',
                gradient: 'from-amber-500/20 to-yellow-500/20',
                iconColor: 'text-amber-400',
              },
              {
                icon: Clock,
                title: 'Réservation instantanée',
                description: 'Réservez 24h/24, 7j/7. Confirmation immédiate, contrat digital automatique.',
                gradient: 'from-cyan-500/20 to-teal-500/20',
                iconColor: 'text-cyan-400',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-dark-700/50 bg-dark-800/50 p-8 transition-all hover:border-dark-600 hover:bg-dark-800"
              >
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} border border-dark-700/50 ${feature.iconColor}`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-dark-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Ils nous font confiance
            </h2>
            <p className="mt-2 text-dark-400">
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
                <Quote className="mb-4 h-8 w-8 text-primary-500/30" />
                <p className="mb-6 text-dark-300">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-dark-700"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-dark-400">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-dark-900 to-primary-800/20" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-4 py-2 border border-primary-500/30">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">Commencez gratuitement</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
            Prêt à booster votre visibilité ?
          </h2>
          <p className="mb-8 text-lg text-dark-300 md:text-xl">
            Rejoignez des centaines d'annonceurs qui font confiance à PromotionHub
            pour leurs campagnes publicitaires à Abidjan.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg">
                Créer mon compte gratuit
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/listings">
              <Button size="lg" variant="outline">
                Explorer les panneaux
              </Button>
            </Link>
          </div>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-dark-400">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Inscription gratuite
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Pas de frais cachés
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Support 24/7
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
