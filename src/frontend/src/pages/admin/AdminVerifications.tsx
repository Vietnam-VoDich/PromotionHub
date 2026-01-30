import { useState, useEffect } from 'react';
import { adminApi, type PendingVerification } from '@/lib/api';
import {
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-CI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminVerifications() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PendingVerification | null>(null);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPendingVerifications({
        page: pagination.page,
        limit: pagination.limit,
      });
      setVerifications(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [pagination.page]);

  // Note: approve/reject would require additional backend endpoints
  const handleApprove = async (id: string) => {
    console.log('Approve:', id);
    // TODO: Implement when backend endpoint is ready
    // await adminApi.approveVerification(id);
    // await fetchVerifications();
  };

  const handleReject = async (id: string) => {
    console.log('Reject:', id);
    // TODO: Implement when backend endpoint is ready
    // await adminApi.rejectVerification(id);
    // await fetchVerifications();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Validation des photos</h1>
        <p className="text-gray-500 mt-1">
          {pagination.total} photo(s) en attente de validation
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : verifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <PhotoIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune photo en attente de validation</p>
          <p className="text-sm text-gray-400 mt-2">
            Les nouvelles photos de vérification apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifications.map((verification) => (
            <div
              key={verification.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Photo */}
              <div
                className="aspect-video bg-gray-100 cursor-pointer relative group"
                onClick={() => setSelectedPhoto(verification)}
              >
                <img
                  src={verification.photoUrl}
                  alt="Photo de vérification"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white font-medium">
                    Voir en grand
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {verification.booking.listing.title}
                </h3>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{verification.booking.listing.address}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      Uploadé par {verification.uploader.firstName} {verification.uploader.lastName}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formatDate(verification.timestamp)}</span>
                  </div>
                </div>

                {/* Owner & Advertiser */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Propriétaire</p>
                    <p className="font-medium">
                      {verification.booking.listing.owner.firstName}{' '}
                      {verification.booking.listing.owner.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Annonceur</p>
                    <p className="font-medium">
                      {verification.booking.advertiser.firstName}{' '}
                      {verification.booking.advertiser.lastName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 flex justify-between">
                <button
                  onClick={() => handleReject(verification.id)}
                  className="flex items-center px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Rejeter
                </button>
                <button
                  onClick={() => handleApprove(verification.id)}
                  className="flex items-center px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Approuver
                </button>
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
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img
              src={selectedPhoto.photoUrl}
              alt="Photo de vérification"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
