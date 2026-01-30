import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type AdminListing } from '@/lib/api';
import {
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-CI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminListings() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter) params.status = statusFilter;

      const data = await adminApi.getListings(params as Parameters<typeof adminApi.getListings>[0]);
      setListings(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [pagination.page, statusFilter]);

  const handleStatusUpdate = async (id: string, status: 'active' | 'inactive') => {
    setUpdating(id);
    try {
      await adminApi.updateListingStatus(id, status);
      await fetchListings();
    } catch (err) {
      console.error('Error updating listing:', err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des panneaux</h1>
        <p className="text-gray-500 mt-1">{pagination.total} panneaux au total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="booked">Réservés</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Aucun panneau trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{listing.quartier}, {listing.address}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 ${
                      listing.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : listing.status === 'booked'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Prix/mois</p>
                    <p className="font-semibold text-gray-900">{formatPrice(listing.pricePerMonth)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Réservations</p>
                    <p className="font-semibold text-gray-900">{listing._count.bookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avis</p>
                    <p className="font-semibold text-gray-900">{listing._count.reviews}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Créé le</p>
                    <p className="font-semibold text-gray-900">{formatDate(listing.createdAt)}</p>
                  </div>
                </div>

                {/* Owner */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Propriétaire</p>
                  <p className="font-medium text-gray-900">
                    {listing.owner.firstName} {listing.owner.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{listing.owner.email}</p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <Link
                  to={`/listings/${listing.id}`}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-800"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Voir
                </Link>
                <div className="flex gap-2">
                  {listing.status !== 'active' && (
                    <button
                      onClick={() => handleStatusUpdate(listing.id, 'active')}
                      disabled={updating === listing.id}
                      className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Activer
                    </button>
                  )}
                  {listing.status === 'active' && (
                    <button
                      onClick={() => handleStatusUpdate(listing.id, 'inactive')}
                      disabled={updating === listing.id}
                      className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Désactiver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} sur {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
