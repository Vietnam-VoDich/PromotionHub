import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, DollarSign, Eye, Calendar,
  ArrowUpRight, ArrowDownRight, MapPin
} from 'lucide-react';
import { bookingsApi, listingsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

// Mock data for charts (will be replaced with real API data)
const revenueData = [
  { month: 'Jan', revenue: 450000, bookings: 3 },
  { month: 'Fév', revenue: 680000, bookings: 5 },
  { month: 'Mar', revenue: 520000, bookings: 4 },
  { month: 'Avr', revenue: 890000, bookings: 7 },
  { month: 'Mai', revenue: 720000, bookings: 6 },
  { month: 'Juin', revenue: 950000, bookings: 8 },
];

const quartierData = [
  { name: 'Plateau', value: 35, color: '#6366f1' },
  { name: 'Cocody', value: 28, color: '#8b5cf6' },
  { name: 'Marcory', value: 18, color: '#a855f7' },
  { name: 'Yopougon', value: 12, color: '#d946ef' },
  { name: 'Autres', value: 7, color: '#ec4899' },
];

const performanceData = [
  { name: 'Lun', vues: 120, clics: 45 },
  { name: 'Mar', vues: 180, clics: 62 },
  { name: 'Mer', vues: 150, clics: 55 },
  { name: 'Jeu', vues: 220, clics: 78 },
  { name: 'Ven', vues: 280, clics: 95 },
  { name: 'Sam', vues: 320, clics: 110 },
  { name: 'Dim', vues: 180, clics: 65 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="relative overflow-hidden bg-dark-800/80 border-dark-700/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-dark-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            <div className={`mt-2 flex items-center text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span className="font-medium">{Math.abs(change)}%</span>
              <span className="ml-1 text-dark-500">vs mois dernier</span>
            </div>
          </div>
          <div className={`rounded-xl p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${color}`} />
      </CardContent>
    </Card>
  );
}

export function DashboardAnalytics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: earnings } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => bookingsApi.getEarnings(),
  });

  const { data: myListings } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingsApi.getMyListings({ limit: 100 }),
  });

  const totalRevenue = earnings?.totalEarnings || 0;
  const totalBookings = earnings?.completedBookings || 0;
  const totalListings = myListings?.pagination.total || 0;
  const averageOccupancy = totalListings > 0 ? Math.round((totalBookings / totalListings) * 100) : 0;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-dark-400 mt-1">Suivez les performances de vos panneaux publicitaires</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          {[
            { id: 'week', label: 'Cette semaine' },
            { id: 'month', label: 'Ce mois' },
            { id: 'year', label: 'Cette année' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as typeof period)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === p.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 border border-dark-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Revenus totaux"
            value={formatPrice(totalRevenue)}
            change={12.5}
            icon={DollarSign}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
          />
          <StatCard
            title="Réservations"
            value={totalBookings}
            change={8.2}
            icon={Calendar}
            color="bg-gradient-to-r from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Taux d'occupation"
            value={`${averageOccupancy}%`}
            change={-2.4}
            icon={TrendingUp}
            color="bg-gradient-to-r from-purple-500 to-violet-600"
          />
          <StatCard
            title="Panneaux actifs"
            value={totalListings}
            change={5.0}
            icon={MapPin}
            color="bg-gradient-to-r from-orange-500 to-amber-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card className="bg-dark-800/80 border-dark-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Évolution des revenus</h3>
                <span className="text-sm text-dark-400">6 derniers mois</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value) => [formatPrice(value as number), 'Revenus']}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#f3f4f6'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quartier Distribution */}
          <Card className="bg-dark-800/80 border-dark-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Répartition par quartier</h3>
                <span className="text-sm text-dark-400">Réservations</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={quartierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {quartierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Part']}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#f3f4f6'
                      }}
                    />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconType="circle"
                      formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="mb-8 bg-dark-800/80 border-dark-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Performance hebdomadaire</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-500" />
                  <span className="text-dark-400">Vues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-dark-400">Clics</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#f3f4f6'
                    }}
                  />
                  <Bar dataKey="vues" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clics" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Listings */}
        <Card className="bg-dark-800/80 border-dark-700/50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Panneaux les plus performants</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myListings?.data.slice(0, 5).map((listing, index) => (
                <div key={listing.id} className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl border border-dark-600/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-dark-600">
                    {listing.photos[0] && (
                      <img
                        src={listing.photos[0].url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{listing.title}</h4>
                    <p className="text-sm text-dark-400">{listing.quartier}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatPrice(listing.pricePerMonth)}</p>
                    <p className="text-sm text-dark-500">/mois</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+{Math.floor(Math.random() * 20 + 5)}%</span>
                  </div>
                </div>
              ))}
              {(!myListings?.data || myListings.data.length === 0) && (
                <div className="text-center py-8 text-dark-400">
                  <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun panneau pour le moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
