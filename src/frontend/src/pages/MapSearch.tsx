import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingsApi } from '@/lib/api';
import { MapView } from '@/components/map';
import type { Listing } from '@/types';
import {
  FunnelIcon,
  MapIcon,
  ListBulletIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price);
}

const QUARTIERS = [
  'Plateau',
  'Cocody',
  'Marcory',
  'Treichville',
  'Yopougon',
  'Abobo',
  'Adjamé',
  'Koumassi',
  'Port-Bouët',
  'Bingerville',
];

export function MapSearch() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('split');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    quartier: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    status: 'active',
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (filters.quartier) params.quartier = filters.quartier;
      if (filters.minPrice) params.minPrice = parseInt(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseInt(filters.maxPrice);
      if (filters.size) params.size = filters.size;
      if (filters.status) params.status = filters.status;
      params.limit = 100;

      const data = await listingsApi.getAll(params as Parameters<typeof listingsApi.getAll>[0]);
      setListings(data.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      quartier: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      status: 'active',
    });
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v && v !== 'active').length;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Recherche sur carte</h1>
            <span className="text-sm text-gray-500">{listings.length} panneaux</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 rounded-lg border ${
                showFilters ? 'bg-primary-50 border-primary-200' : 'border-gray-200'
              }`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 ${viewMode === 'map' ? 'bg-primary-100 text-primary-600' : ''}`}
              >
                <MapIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`p-2 border-x border-gray-200 ${
                  viewMode === 'split' ? 'bg-primary-100 text-primary-600' : ''
                }`}
              >
                <div className="flex gap-0.5">
                  <div className="w-2 h-5 bg-current rounded-sm" />
                  <div className="w-2 h-5 bg-current rounded-sm" />
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : ''}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-4">
              {/* Quartier */}
              <select
                value={filters.quartier}
                onChange={(e) => handleFilterChange('quartier', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2"
              >
                <option value="">Tous les quartiers</option>
                {QUARTIERS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Prix min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Prix max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>

              {/* Size */}
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2"
              >
                <option value="">Toutes tailles</option>
                <option value="small">Petit</option>
                <option value="medium">Moyen</option>
                <option value="large">Grand</option>
              </select>

              {/* Status */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2"
              >
                <option value="">Tous statuts</option>
                <option value="active">Disponibles</option>
                <option value="booked">Réservés</option>
              </select>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2' : 'w-full'}>
            {loading ? (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : (
              <MapView
                listings={listings}
                selectedListing={selectedListing}
                onListingSelect={setSelectedListing}
                className="h-full"
              />
            )}
          </div>
        )}

        {/* List */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2 border-l border-gray-200' : 'w-full'
            } overflow-y-auto bg-gray-50`}
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
              </div>
            ) : listings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun panneau trouvé avec ces filtres
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => setSelectedListing(listing)}
                    className={`bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${
                      selectedListing?.id === listing.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="flex">
                      {/* Photo */}
                      <div className="w-32 h-32 flex-shrink-0">
                        {listing.photos[0] ? (
                          <img
                            src={listing.photos[0].url}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <MapPinIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {listing.quartier}, {listing.address}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              listing.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : listing.status === 'booked'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {listing.status === 'active'
                              ? 'Disponible'
                              : listing.status === 'booked'
                              ? 'Réservé'
                              : 'Inactif'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className="text-lg font-bold text-primary-600">
                              {formatPrice(listing.pricePerMonth)}
                            </span>
                            <span className="text-sm text-gray-500">/mois</span>
                          </div>
                          <Link
                            to={`/listings/${listing.id}`}
                            className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Voir
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
