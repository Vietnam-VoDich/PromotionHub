import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Calendar, MapPin, User, Phone, Mail,
  CreditCard, FileText, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { bookingsApi } from '@/lib/api';
import { formatPrice, formatDateShort, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { BlockchainBadge } from '@/components/blockchain/BlockchainBadge';

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Réservation introuvable</h2>
          <p className="text-gray-600 mb-4">Cette réservation n'existe pas ou vous n'y avez pas accès.</p>
          <Link to="/dashboard">
            <Button variant="outline">Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusIcon = {
    pending: <Clock className="h-5 w-5 text-yellow-500" />,
    confirmed: <CheckCircle className="h-5 w-5 text-green-500" />,
    rejected: <XCircle className="h-5 w-5 text-red-500" />,
    completed: <CheckCircle className="h-5 w-5 text-blue-500" />,
    cancelled: <XCircle className="h-5 w-5 text-gray-500" />,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Détails de la réservation</h1>
          <p className="text-gray-500 text-sm">ID: {booking.id}</p>
        </div>
        <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
          {statusIcon[booking.status]}
          <span className="ml-1">{BOOKING_STATUS_LABELS[booking.status]}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Listing info */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Panneau réservé</h2>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {booking.listing.photos[0] && (
                  <img
                    src={booking.listing.photos[0].url}
                    alt={booking.listing.title}
                    className="w-32 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <Link
                    to={`/listings/${booking.listing.id}`}
                    className="font-medium text-gray-900 hover:text-primary-600"
                  >
                    {booking.listing.title}
                  </Link>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin className="h-4 w-4" />
                    {booking.listing.address}, {booking.listing.quartier}
                  </div>
                  <div className="text-primary-600 font-medium mt-2">
                    {formatPrice(booking.listing.pricePerMonth)} / mois
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Période de réservation</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Date de début</span>
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatDateShort(booking.startDate)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Date de fin</span>
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatDateShort(booking.endDate)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Certification */}
          <BlockchainBadge
            bookingId={booking.id}
            blockchainHash={booking.blockchainHash}
            blockchainTxId={booking.blockchainTxId}
            blockchainNetwork={booking.blockchainNetwork}
            certifiedAt={booking.certifiedAt}
            showCertifyButton={booking.status === 'confirmed' || booking.status === 'completed'}
          />

          {/* Payments */}
          {booking.payments && booking.payments.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Paiements</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatPrice(payment.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.paymentMethod.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          payment.status === 'success' ? 'success' :
                          payment.status === 'pending' ? 'warning' : 'danger'
                        }
                      >
                        {payment.status === 'success' ? 'Payé' :
                         payment.status === 'pending' ? 'En attente' : 'Échoué'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price summary */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Récapitulatif</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Prix mensuel</span>
                  <span>{formatPrice(booking.listing.pricePerMonth)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(booking.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner contact */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Propriétaire</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.listing.owner.firstName} {booking.listing.owner.lastName}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <a
                    href={`mailto:${booking.listing.owner.email}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600 text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    {booking.listing.owner.email}
                  </a>
                  {booking.listing.owner.phone && (
                    <a
                      href={`tel:${booking.listing.owner.phone}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary-600 text-sm"
                    >
                      <Phone className="h-4 w-4" />
                      {booking.listing.owner.phone}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract */}
          {booking.contractUrl && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Contrat</h2>
              </CardHeader>
              <CardContent>
                <a
                  href={booking.contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                >
                  <FileText className="h-5 w-5" />
                  <span>Voir le contrat</span>
                </a>
                {booking.contractSignedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Signé le {formatDateShort(booking.contractSignedAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
