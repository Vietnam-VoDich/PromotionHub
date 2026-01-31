import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, MapPin, ArrowLeft } from 'lucide-react';
import { favoritesApi } from '@/lib/api';
import { formatPrice, formatDateShort } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

export function Favorites() {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getAll({ limit: 50 }),
  });

  const favorites = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-dark-950">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-dark-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Mes Favoris</h1>
          <p className="text-dark-400">
            {favorites.length} panneau{favorites.length > 1 ? 'x' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-dark-800">
              <div className="h-48 bg-dark-700 rounded-t-xl"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-dark-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-dark-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-10 w-10 text-dark-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Aucun favori</h2>
          <p className="text-dark-400 mb-6">
            Explorez les panneaux et cliquez sur le coeur pour les sauvegarder
          </p>
          <Link to="/listings">
            <Button>Explorer les panneaux</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:border-dark-600 transition-all bg-dark-800 border-dark-700/50">
              <Link to={`/listings/${listing.id}`}>
                <div className="relative h-48">
                  {listing.photos[0] ? (
                    <img
                      src={listing.photos[0].url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                      <span className="text-dark-500">Pas d'image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <FavoriteButton listingId={listing.id} initialFavorited={true} />
                  </div>
                  {listing.dailyTraffic && (
                    <div className="absolute bottom-3 left-3 bg-dark-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                      {listing.dailyTraffic.toLocaleString()} passages/jour
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <Link to={`/listings/${listing.id}`}>
                  <h3 className="font-semibold text-white hover:text-primary-400 transition-colors line-clamp-1">
                    {listing.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-1 text-dark-400 text-sm mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{listing.quartier}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-primary-400 font-bold">
                    {formatPrice(listing.pricePerMonth)}
                    <span className="text-dark-500 font-normal text-sm"> /mois</span>
                  </div>
                  <span className="text-xs text-dark-500">
                    Ajouté le {formatDateShort(listing.favoritedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
