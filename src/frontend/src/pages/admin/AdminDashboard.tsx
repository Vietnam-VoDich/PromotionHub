import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type AdminStats, type RecentActivity } from '@/lib/api';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  PhotoIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'primary' | 'green' | 'orange' | 'red';
}) {
  const colors = {
    primary: 'bg-primary-100 text-primary-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getRecentActivity(10),
        ]);
        setStats(statsData);
        setActivity(activityData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Erreur inconnue'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de la plateforme PromotionHub</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Utilisateurs"
          value={stats.users.total}
          subtitle={`${stats.users.owners} owners, ${stats.users.advertisers} annonceurs`}
          icon={UsersIcon}
          color="primary"
        />
        <StatCard
          title="Panneaux"
          value={stats.listings.total}
          subtitle={`${stats.listings.active} actifs`}
          icon={BuildingOfficeIcon}
          color="green"
        />
        <StatCard
          title="Réservations"
          value={stats.bookings.total}
          subtitle={`${stats.bookings.pending} en attente, ${stats.bookings.completed} terminées`}
          icon={CalendarDaysIcon}
          color="orange"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={formatPrice(stats.revenue.total)}
          subtitle="Total des réservations terminées"
          icon={BanknotesIcon}
          color="primary"
        />
      </div>

      {/* Pending Verifications Alert */}
      {stats.pendingVerifications > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <PhotoIcon className="h-6 w-6 text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-orange-800">
                  {stats.pendingVerifications} photo(s) en attente de validation
                </p>
                <p className="text-sm text-orange-600">Vérifiez et approuvez les photos de campagne</p>
              </div>
            </div>
            <Link
              to="/admin/verifications"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
            >
              Voir les photos
            </Link>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/users"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg mr-4">
              <UsersIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Gestion des utilisateurs</p>
              <p className="text-sm text-gray-500">Voir, modifier, suspendre</p>
            </div>
          </div>
        </Link>
        <Link
          to="/admin/listings"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Gestion des panneaux</p>
              <p className="text-sm text-gray-500">Modérer, activer, désactiver</p>
            </div>
          </div>
        </Link>
        <Link
          to="/admin/newsletter"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <CalendarDaysIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Newsletter</p>
              <p className="text-sm text-gray-500">Abonnés, campagnes</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      {activity && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Nouveaux utilisateurs</h3>
            <div className="space-y-4">
              {activity.users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.firstName} {user.lastName || user.email}
                    </p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(user.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Nouveaux panneaux</h3>
            <div className="space-y-4">
              {activity.listings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">{listing.title}</p>
                    <p className="text-sm text-gray-500">
                      {listing.owner.firstName} {listing.owner.lastName}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      listing.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Dernières réservations</h3>
            <div className="space-y-4">
              {activity.bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">
                      {booking.listing.title}
                    </p>
                    <p className="text-sm text-gray-500">{formatPrice(booking.totalPrice)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : booking.status === 'pending'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
