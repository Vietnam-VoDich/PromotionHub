import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, Calendar, MapPin, CreditCard, Smartphone,
  CheckCircle, Shield, AlertCircle, Loader2, CalendarDays
} from 'lucide-react';
import { listingsApi, bookingsApi } from '@/lib/api';
import { formatPrice, formatDateShort, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

const PAYMENT_METHODS = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    icon: '🟠',
    description: 'Paiement via Orange Money',
  },
  {
    id: 'mtn_money',
    name: 'MTN Mobile Money',
    icon: '🟡',
    description: 'Paiement via MTN MoMo',
  },
  {
    id: 'card',
    name: 'Carte bancaire',
    icon: '💳',
    description: 'Visa, Mastercard',
  },
];

export function Checkout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Dates par défaut: aujourd'hui + 1 mois
  const getDefaultDates = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return {
      start: today.toISOString().split('T')[0],
      end: nextMonth.toISOString().split('T')[0],
    };
  };

  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || defaults.start);
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || defaults.end);

  const [paymentMethod, setPaymentMethod] = useState('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState<'review' | 'payment' | 'processing' | 'success'>('review');

  // Mettre à jour l'URL quand les dates changent
  useEffect(() => {
    setSearchParams({ startDate, endDate }, { replace: true });
  }, [startDate, endDate, setSearchParams]);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id!),
    enabled: !!id,
  });

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const booking = await bookingsApi.create({
        listingId: id!,
        startDate,
        endDate,
        paymentMethod,
        phone: paymentMethod !== 'card' ? phoneNumber : undefined,
      });
      return booking;
    },
    onSuccess: () => {
      setStep('success');
    },
    onError: () => {
      setStep('review');
    },
  });

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();
  const pricePerDay = listing ? Math.round(listing.pricePerMonth / 30) : 0;
  const subtotal = pricePerDay * days;
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + serviceFee;

  const handlePayment = () => {
    setStep('processing');
    createBookingMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Annonce introuvable</h1>
        <Button onClick={() => navigate('/listings')} className="mt-4">
          Retour aux annonces
        </Button>
      </div>
    );
  }

  // Success screen
  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Réservation confirmée !</h1>
        <p className="text-gray-600 mb-8">
          Votre demande de réservation a été envoyée au propriétaire.
          Vous recevrez une confirmation par email et SMS.
        </p>
        <Card className="text-left mb-8">
          <CardContent className="py-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                {listing.photos[0] && (
                  <img
                    src={listing.photos[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {listing.quartier}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateShort(startDate)} - {formatDateShort(endDate)}
                </p>
              </div>
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total payé</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/dashboard')}>
            Voir mes réservations
          </Button>
          <Button variant="outline" onClick={() => navigate('/listings')}>
            Continuer à explorer
          </Button>
        </div>
      </div>
    );
  }

  // Processing screen
  if (step === 'processing') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Traitement en cours...</h1>
        <p className="text-gray-600">
          {paymentMethod === 'card'
            ? 'Vérification de votre paiement...'
            : 'Envoi de la demande de paiement sur votre téléphone...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser la réservation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review step */}
          {step === 'review' && (
            <>
              {/* Listing summary */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Votre réservation</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {listing.photos[0] && (
                        <img
                          src={listing.photos[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {listing.quartier}, {listing.address}
                      </p>
                    </div>
                  </div>

                  {/* Date selector */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-3">
                      <CalendarDays className="h-5 w-5 text-primary-600" />
                      <span className="font-medium">Période de réservation</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Date de début</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Date de fin</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Durée: <span className="font-medium text-gray-700">{days} jours</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment method selection */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Mode de paiement</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2',
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      )}>
                        {paymentMethod === method.id && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </label>
                  ))}

                  {paymentMethod !== 'card' && (
                    <Input
                      label="Numéro de téléphone"
                      placeholder="+225 07 00 00 00 00"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      leftIcon={<Smartphone className="h-5 w-5" />}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Terms */}
              <Card>
                <CardContent className="py-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">
                      J'accepte les{' '}
                      <a href="/terms" className="text-primary-600 hover:underline">
                        conditions générales
                      </a>{' '}
                      et la{' '}
                      <a href="/privacy" className="text-primary-600 hover:underline">
                        politique de confidentialité
                      </a>{' '}
                      de PromotionHub
                    </span>
                  </label>
                </CardContent>
              </Card>

              {createBookingMutation.isError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Erreur de paiement</div>
                    <div className="text-sm">Une erreur est survenue. Veuillez réessayer ou contacter le support.</div>
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="w-full"
                disabled={!acceptTerms || (paymentMethod !== 'card' && !phoneNumber) || days <= 0}
                onClick={handlePayment}
              >
                <CreditCard className="h-5 w-5" />
                Confirmer et payer {formatPrice(total)}
              </Button>
            </>
          )}
        </div>

        {/* Sidebar - Price summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <h2 className="text-lg font-semibold">Récapitulatif</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {formatPrice(pricePerDay)} x {days} jours
                </span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frais de service (5%)</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Paiement sécurisé et protection acheteur incluse</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Annulation gratuite jusqu'à 7 jours avant le début</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
