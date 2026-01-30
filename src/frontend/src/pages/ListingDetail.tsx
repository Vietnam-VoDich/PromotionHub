import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, Calendar, Ruler, ChevronLeft, ChevronRight,
  Star, MessageSquare, Phone, Mail, Share2, Eye, Heart, TrendingUp
} from 'lucide-react';
import { listingsApi, reviewsApi } from '@/lib/api';
import { formatPrice, formatDate, LISTING_SIZES, getFullName } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

function useViewingCount() {
  const [count, setCount] = useState(() => Math.floor(Math.random() * 8) + 3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        return Math.max(2, Math.min(15, newCount));
      });
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  return count;
}

function useSavedStatus(listingId: string) {
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`listing-saved-${listingId}`);
    setIsSaved(saved === 'true');
  }, [listingId]);

  const toggleSave = () => {
    const newState = !isSaved;
    setIsSaved(newState);
    localStorage.setItem(`listing-saved-${listingId}`, String(newState));
    if (newState) {
      setShowSavedNotification(true);
      setTimeout(() => setShowSavedNotification(false), 2000);
    }
  };

  return { isSaved, toggleSave, showSavedNotification };
}

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const viewingCount = useViewingCount();
  const { isSaved, toggleSave, showSavedNotification } = useSavedStatus(id || '');

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id!),
    enabled: !!id,
  });

  const { data: reviewStats } = useQuery({
    queryKey: ['listing-reviews', id],
    queryFn: () => reviewsApi.getListingStats(id!),
    enabled: !!id,
  });

  const isPopular = reviewStats && reviewStats.totalReviews >= 3 && reviewStats.averageRating >= 4;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-96 bg-gray-200 rounded-xl mb-8" />
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Panneau non trouvé</h2>
        <Button onClick={() => navigate('/listings')}>Retour aux panneaux</Button>
      </div>
    );
  }

  const photos = listing.photos.length > 0 ? listing.photos : [{ url: '', isPrimary: true, id: '0', order: 0 }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link to="/listings" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="h-5 w-5" />
        Retour aux panneaux
      </Link>

      {/* Viewing count banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-700">
          <Eye className="h-5 w-5 animate-pulse" />
          <span className="font-medium">{viewingCount} personnes consultent ce panneau</span>
        </div>
        {isPopular && (
          <div className="flex items-center gap-1 bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            <TrendingUp className="h-3 w-3" />
            Populaire
          </div>
        )}
      </div>

      {/* Saved notification */}
      {showSavedNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          Sauvegardé automatiquement
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            {isPopular && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Populaire
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-5 w-5" />
            <span>{listing.address}, {listing.quartier}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={listing.status === 'active' ? 'success' : 'warning'} size="md">
            {listing.status === 'active' ? 'Disponible' : 'Réservé'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSave}
            className={isSaved ? 'text-red-500 border-red-500' : ''}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500' : ''}`} />
            {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photo gallery */}
          <div className="relative">
            <div className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden">
              {photos[currentPhoto]?.url ? (
                <img
                  src={photos[currentPhoto].url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Pas de photo disponible
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhoto((p) => (p - 1 + photos.length) % photos.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCurrentPhoto((p) => (p + 1) % photos.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPhoto(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentPhoto ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <Card>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Caractéristiques</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <Ruler className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Dimensions</div>
                      <div className="font-medium">{LISTING_SIZES[listing.size]}</div>
                    </div>
                  </div>
                  {listing.availabilityStart && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-secondary-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Disponible à partir de</div>
                        <div className="font-medium">{formatDate(listing.availabilityStart)}</div>
                      </div>
                    </div>
                  )}
                  {reviewStats && reviewStats.totalReviews > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Note moyenne</div>
                        <div className="font-medium">
                          {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} avis)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {listing.description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-600 whitespace-pre-line">{listing.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Propriétaire</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar
                    firstName={listing.owner.firstName}
                    lastName={listing.owner.lastName}
                    size="lg"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {getFullName(listing.owner.firstName, listing.owner.lastName)}
                    </div>
                    <div className="text-sm text-gray-500">Propriétaire vérifié</div>
                  </div>
                </div>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4" />
                  Contacter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardContent className="space-y-6">
                {/* Live viewing indicator */}
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center justify-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-medium text-red-700">
                    {viewingCount} personnes consultent
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {formatPrice(listing.pricePerMonth)}
                  </div>
                  <div className="text-gray-500">par mois</div>
                </div>

                {listing.status === 'active' ? (
                  isAuthenticated ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        const today = new Date();
                        const startDate = today.toISOString().split('T')[0];
                        const endDate = new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0];
                        navigate(`/checkout/${listing.id}?startDate=${startDate}&endDate=${endDate}`);
                      }}
                    >
                      Réserver ce panneau
                    </Button>
                  ) : (
                    <Link to="/login" state={{ from: { pathname: `/listings/${listing.id}` } }}>
                      <Button className="w-full" size="lg">
                        Se connecter pour réserver
                      </Button>
                    </Link>
                  )
                ) : (
                  <Button className="w-full" size="lg" disabled>
                    Non disponible
                  </Button>
                )}

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{listing.owner.phone || 'Non disponible'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{listing.owner.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
