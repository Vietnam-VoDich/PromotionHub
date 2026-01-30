import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { listingsApi } from '@/lib/api';
import { formatPrice, QUARTIERS, LISTING_SIZES, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Listing } from '@/types';

function ListingCard({ listing }: { listing: Listing }) {
  const primaryPhoto = listing.photos.find((p) => p.isPrimary) || listing.photos[0];

  return (
    <Link to={`/listings/${listing.id}`}>
      <Card hover className="h-full">
        <div className="aspect-[4/3] relative bg-gray-100">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Pas de photo
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant={listing.status === 'active' ? 'success' : 'warning'}>
              {listing.status === 'active' ? 'Disponible' : 'Réservé'}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{listing.title}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
            <MapPin className="h-4 w-4" />
            <span>{listing.quartier}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {LISTING_SIZES[listing.size]}
            </div>
            <div className="text-lg font-bold text-primary-600">
              {formatPrice(listing.pricePerMonth)}<span className="text-sm font-normal text-gray-500">/mois</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    quartier: searchParams.get('quartier') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () =>
      listingsApi.getAll({
        search: filters.search || undefined,
        quartier: filters.quartier || undefined,
        size: filters.size || undefined,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        status: 'active',
        limit: 20,
      }),
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const clearFilters = () => {
    setFilters({
      search: '',
      quartier: '',
      size: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panneaux publicitaires</h1>
        <p className="text-gray-600">
          {data?.pagination.total || 0} panneaux disponibles à Abidjan
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par titre, adresse..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              leftIcon={<Search className="h-5 w-5" />}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-gray-100')}
          >
            <Filter className="h-5 w-5" />
            Filtres
          </Button>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Quartier"
                value={filters.quartier}
                onChange={(e) => setFilters({ ...filters, quartier: e.target.value })}
                options={[
                  { value: '', label: 'Tous les quartiers' },
                  ...QUARTIERS.map((q) => ({ value: q, label: q })),
                ]}
              />
              <Select
                label="Taille"
                value={filters.size}
                onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                options={[
                  { value: '', label: 'Toutes les tailles' },
                  { value: 'small', label: 'Petit (2x3m)' },
                  { value: 'medium', label: 'Moyen (4x3m)' },
                  { value: 'large', label: 'Grand (12x4m)' },
                ]}
              />
              <Input
                type="number"
                label="Prix min (XOF)"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="0"
              />
              <Input
                type="number"
                label="Prix max (XOF)"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="1000000"
              />
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                  Effacer les filtres
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[4/5]" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat</h3>
          <p className="text-gray-600 mb-4">
            Aucun panneau ne correspond à vos critères de recherche.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Effacer les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.data.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
