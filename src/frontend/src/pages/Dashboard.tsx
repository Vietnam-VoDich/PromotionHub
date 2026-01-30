import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Building2, Calendar, MessageSquare,
  TrendingUp, Plus, ArrowRight, Clock
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { listingsApi, bookingsApi, messagesApi } from '@/lib/api';
import { formatPrice, formatDateShort, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

function StatCard({ title, value, icon: Icon, href }: { title: string; value: string | number; icon: React.ElementType; href?: string }) {
  const content = (
    <Card className={cn(href && 'hover:shadow-md transition-shadow cursor-pointer')}>
      <CardContent className="flex items-center gap-4 py-6">
        <div className="p-3 bg-primary-50 rounded-lg">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}

export function Dashboard() {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner' || user?.role === 'admin';

  const { data: myListings } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingsApi.getMyListings({ limit: 5 }),
    enabled: isOwner,
  });

  const { data: myBookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getAll({ limit: 5 }),
  });

  const { data: ownerBookings } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn: () => bookingsApi.getAll({ asOwner: true, limit: 5 }),
    enabled: isOwner,
  });

  const { data: earnings } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => bookingsApi.getEarnings(),
    enabled: isOwner,
  });

  const { data: unreadMessages } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: () => messagesApi.getUnreadCount(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.firstName || 'Utilisateur'} !
          </h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord PromotionHub
          </p>
        </div>
        {isOwner && (
          <Link to="/listings/new">
            <Button>
              <Plus className="h-5 w-5" />
              Ajouter un panneau
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isOwner && (
          <>
            <StatCard
              title="Mes panneaux"
              value={myListings?.pagination.total || 0}
              icon={Building2}
              href="/dashboard/listings"
            />
            <StatCard
              title="Revenus totaux"
              value={formatPrice(earnings?.totalEarnings || 0)}
              icon={TrendingUp}
            />
          </>
        )}
        <StatCard
          title="Mes réservations"
          value={myBookings?.pagination.total || 0}
          icon={Calendar}
          href="/dashboard/bookings"
        />
        <StatCard
          title="Messages non lus"
          value={unreadMessages?.unreadCount || 0}
          icon={MessageSquare}
          href="/messages"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Owner: Recent booking requests */}
        {isOwner && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Demandes de réservation</h2>
              <Link to="/dashboard/bookings?asOwner=true" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {ownerBookings?.data.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune demande de réservation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ownerBookings?.data.map((booking) => (
                    <Link
                      key={booking.id}
                      to={`/bookings/${booking.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {booking.listing.photos[0] && (
                            <img
                              src={booking.listing.photos[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {booking.listing.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateShort(booking.startDate)} - {formatDateShort(booking.endDate)}
                          </div>
                        </div>
                      </div>
                      <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* My bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mes réservations</h2>
            <Link to="/dashboard/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {myBookings?.data.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune réservation</p>
                <Link to="/listings">
                  <Button variant="outline" size="sm" className="mt-3">
                    Explorer les panneaux
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings?.data.map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/bookings/${booking.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {booking.listing.photos[0] && (
                          <img
                            src={booking.listing.photos[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {booking.listing.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPrice(booking.totalPrice)}
                        </div>
                      </div>
                    </div>
                    <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Owner earnings */}
        {isOwner && earnings && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Revenus</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600">Revenus totaux</div>
                  <div className="text-xl font-bold text-green-700">
                    {formatPrice(earnings.totalEarnings)}
                  </div>
                  <div className="text-xs text-green-600">
                    {earnings.completedBookings} réservations terminées
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-yellow-600">En attente</div>
                  <div className="text-xl font-bold text-yellow-700">
                    {formatPrice(earnings.pendingEarnings)}
                  </div>
                  <div className="text-xs text-yellow-600">
                    {earnings.pendingBookings} réservations en cours
                  </div>
                </div>
              </div>
              {earnings.monthlyEarnings.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Derniers mois</div>
                  <div className="space-y-2">
                    {earnings.monthlyEarnings.slice(0, 3).map((month) => (
                      <div key={month.month} className="flex justify-between text-sm">
                        <span className="text-gray-600">{month.month}</span>
                        <span className="font-medium">{formatPrice(month.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/listings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <LayoutDashboard className="h-5 w-5 text-primary-600" />
              <span className="text-gray-700">Explorer les panneaux</span>
            </Link>
            <Link to="/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <MessageSquare className="h-5 w-5 text-primary-600" />
              <span className="text-gray-700">Voir mes messages</span>
            </Link>
            {isOwner && (
              <Link to="/listings/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="h-5 w-5 text-primary-600" />
                <span className="text-gray-700">Ajouter un panneau</span>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
