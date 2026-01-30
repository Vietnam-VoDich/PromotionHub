/**
 * BookingFlow - Flow de réservation en 3 étapes
 * Features:
 * - Stepper 3 étapes: Dates → Paiement → Confirmation
 * - Calendrier visuel avec prix par période
 * - Résumé sticky (desktop sidebar / mobile bottom sheet)
 * - Orange Money / Wave en 1 tap
 * - Guest checkout avec email uniquement
 * - Estimation audience/visibilité
 */

import { useState } from 'react';

type Step = 'dates' | 'payment' | 'confirmation';

interface BookingData {
  startDate: string | null;
  endDate: string | null;
  duration: number;
  email: string;
  phone: string;
  paymentMethod: 'orange' | 'wave' | 'card' | null;
  promoCode: string;
}

// Mock listing data
const listing = {
  id: '1',
  title: 'Panneau LED 4x3m - Boulevard VGE',
  location: 'Marcory, Zone 4',
  image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
  pricePerMonth: 250000,
  rating: 4.8,
  reviewCount: 24,
  estimatedViews: 150000,
  owner: {
    name: 'Kouadio Entreprises',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    responseTime: '< 1h',
  },
};

function Stepper({ currentStep }: { currentStep: Step }) {
  const steps = [
    { id: 'dates', label: 'Dates', icon: '📅' },
    { id: 'payment', label: 'Paiement', icon: '💳' },
    { id: 'confirmation', label: 'Confirmation', icon: '✅' },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div
              className={`flex items-center gap-2 ${
                index <= currentIndex ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold transition-all ${
                  index < currentIndex
                    ? 'bg-primary-500 text-white'
                    : index === currentIndex
                    ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index < currentIndex ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span className="hidden font-medium sm:block">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 flex-1 transition-colors ${
                  index < currentIndex ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DateSelection({
  data,
  onChange,
  onNext,
}: {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
  onNext: () => void;
}) {
  const months = ['Fév 2026', 'Mars 2026', 'Avr 2026'];
  const [selectedMonth, setSelectedMonth] = useState(0);

  // mock calendar days with prices
  const days = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    available: i !== 5 && i !== 6 && i !== 20,
    price: i < 15 ? 250000 : 220000, // early month premium
    selected: data.startDate === `2026-02-${String(i + 1).padStart(2, '0')}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Choisissez vos dates
        </h2>
        <p className="text-gray-600">
          Sélectionnez la période de votre campagne publicitaire
        </p>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(index)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedMonth === index
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="mb-4 grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for alignment */}
          {[...Array(3)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => (
            <button
              key={day.day}
              disabled={!day.available}
              onClick={() =>
                onChange({
                  startDate: `2026-02-${String(day.day).padStart(2, '0')}`,
                  duration: 30,
                })
              }
              className={`relative rounded-lg p-2 text-center transition-all ${
                !day.available
                  ? 'cursor-not-allowed bg-gray-50 text-gray-300 line-through'
                  : day.selected
                  ? 'bg-primary-500 text-white'
                  : 'hover:bg-primary-50'
              }`}
            >
              <div className="text-sm font-medium">{day.day}</div>
              {day.available && (
                <div
                  className={`text-xs ${
                    day.selected ? 'text-white/80' : 'text-gray-400'
                  }`}
                >
                  {(day.price / 1000).toFixed(0)}k
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Duration selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Durée de la campagne
        </label>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => onChange({ duration: days })}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                data.duration === days
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} jours
            </button>
          ))}
        </div>
      </div>

      {/* Audience estimate */}
      <div className="rounded-xl bg-secondary-50 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary-100 p-2">
            <svg
              className="h-5 w-5 text-secondary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-secondary-900">
              Estimation: ~{((listing.estimatedViews * data.duration) / 30 / 1000).toFixed(0)}k vues
            </p>
            <p className="text-sm text-secondary-700">
              Basé sur {data.duration} jours de campagne
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!data.startDate}
        className="w-full rounded-xl bg-primary-500 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Continuer vers le paiement
      </button>
    </div>
  );
}

function PaymentStep({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const paymentMethods = [
    {
      id: 'orange',
      name: 'Orange Money',
      icon: '🟠',
      color: 'border-orange-500 bg-orange-50',
      description: 'Paiement instantané',
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: '🔵',
      color: 'border-blue-500 bg-blue-50',
      description: 'Transfert gratuit',
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: '💳',
      color: 'border-gray-500 bg-gray-50',
      description: 'Visa, Mastercard',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Informations de paiement
        </h2>
        <p className="text-gray-600">
          Entrez vos coordonnées et choisissez votre mode de paiement
        </p>
      </div>

      {/* Contact info */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="votre@email.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Téléphone (optionnel)
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+225 07 XX XX XX XX"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Payment methods */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Mode de paiement
        </label>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onChange({ paymentMethod: method.id as any })}
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                data.paymentMethod === method.id
                  ? method.color
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{method.name}</p>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  data.paymentMethod === method.id
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}
              >
                {data.paymentMethod === method.id && (
                  <svg
                    className="h-full w-full text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Promo code */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Code promo (optionnel)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={data.promoCode}
            onChange={(e) => onChange({ promoCode: e.target.value })}
            placeholder="PROMO2026"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button className="rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-700 hover:bg-gray-200">
            Appliquer
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border border-gray-300 py-4 font-semibold text-gray-700 transition-all hover:bg-gray-50"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          disabled={!data.email || !data.paymentMethod}
          className="flex-1 rounded-xl bg-primary-500 py-4 font-semibold text-white transition-all hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Confirmer et payer
        </button>
      </div>
    </div>
  );
}

function ConfirmationStep({ data }: { data: BookingData }) {
  return (
    <div className="space-y-6 text-center">
      {/* Success animation */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100">
        <svg
          className="h-10 w-10 text-secondary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Réservation confirmée !
        </h2>
        <p className="text-gray-600">
          Un email de confirmation a été envoyé à {data.email}
        </p>
      </div>

      {/* Booking details */}
      <div className="rounded-xl bg-gray-50 p-6 text-left">
        <h3 className="mb-4 font-semibold text-gray-900">Détails de la réservation</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Panneau</span>
            <span className="font-medium">{listing.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date de début</span>
            <span className="font-medium">{data.startDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Durée</span>
            <span className="font-medium">{data.duration} jours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Paiement</span>
            <span className="font-medium capitalize">{data.paymentMethod}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-gray-900">Total payé</span>
            <span className="font-bold text-primary-600">
              {((listing.pricePerMonth * data.duration) / 30).toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
        <h4 className="mb-2 font-semibold text-primary-900">Prochaines étapes</h4>
        <ul className="space-y-2 text-left text-sm text-primary-800">
          <li className="flex items-start gap-2">
            <span className="text-primary-500">1.</span>
            Le propriétaire va confirmer votre réservation sous 24h
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">2.</span>
            Envoyez votre visuel de campagne via la messagerie
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">3.</span>
            Votre campagne démarre à la date prévue
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 rounded-xl border border-gray-300 py-4 font-semibold text-gray-700 transition-all hover:bg-gray-50">
          Voir mes réservations
        </button>
        <button className="flex-1 rounded-xl bg-primary-500 py-4 font-semibold text-white transition-all hover:bg-primary-600">
          Contacter le propriétaire
        </button>
      </div>
    </div>
  );
}

function BookingSummary({ data }: { data: BookingData }) {
  const totalPrice = (listing.pricePerMonth * data.duration) / 30;
  const serviceFee = totalPrice * 0.1;
  const total = totalPrice + serviceFee;

  return (
    <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      {/* Listing preview */}
      <div className="mb-4 flex gap-4">
        <img
          src={listing.image}
          alt={listing.title}
          className="h-20 w-20 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {listing.title}
          </h3>
          <p className="text-sm text-gray-500">{listing.location}</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <span className="text-amber-500">★</span>
            <span className="font-medium">{listing.rating}</span>
            <span className="text-gray-400">({listing.reviewCount} avis)</span>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      {/* Price breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {listing.pricePerMonth.toLocaleString('fr-FR')} FCFA × {data.duration} jours
          </span>
          <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Frais de service</span>
          <span>{serviceFee.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <hr />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total TTC</span>
          <span className="text-primary-600">{total.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {/* Owner info */}
      <div className="mt-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
        <img
          src={listing.owner.avatar}
          alt={listing.owner.name}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-medium">{listing.owner.name}</p>
          <p className="text-xs text-gray-500">
            Répond en {listing.owner.responseTime}
          </p>
        </div>
        <div className="rounded-full bg-secondary-100 px-2 py-1 text-xs font-medium text-secondary-700">
          ✓ Vérifié
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Paiement sécurisé
        </div>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Satisfaction garantie
        </div>
      </div>
    </div>
  );
}

export function BookingFlow() {
  const [step, setStep] = useState<Step>('dates');
  const [data, setData] = useState<BookingData>({
    startDate: null,
    endDate: null,
    duration: 30,
    email: '',
    phone: '',
    paymentMethod: null,
    promoCode: '',
  });

  const updateData = (updates: Partial<BookingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6">
          <button className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au panneau
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Réserver ce panneau</h1>
        </div>

        {/* Stepper */}
        <Stepper currentStep={step} />

        {/* Main content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {step === 'dates' && (
                <DateSelection
                  data={data}
                  onChange={updateData}
                  onNext={() => setStep('payment')}
                />
              )}
              {step === 'payment' && (
                <PaymentStep
                  data={data}
                  onChange={updateData}
                  onNext={() => setStep('confirmation')}
                  onBack={() => setStep('dates')}
                />
              )}
              {step === 'confirmation' && <ConfirmationStep data={data} />}
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="hidden lg:block">
            <BookingSummary data={data} />
          </div>
        </div>

        {/* Mobile sticky summary */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-lg lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total TTC</p>
              <p className="text-xl font-bold text-primary-600">
                {(
                  ((listing.pricePerMonth * data.duration) / 30) * 1.1
                ).toLocaleString('fr-FR')}{' '}
                FCFA
              </p>
            </div>
            <button className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white">
              Voir le détail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
