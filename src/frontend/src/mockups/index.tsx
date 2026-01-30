/**
 * Mockups Demo Page
 * Présente toutes les maquettes UX/UI redesign pour PromotionHub
 */

import { useState } from 'react';
import { HeroSection } from './HeroSection';
import { ListingCardDemo } from './ListingCard';
import { BookingFlow } from './BookingFlow';

type MockupView = 'hero' | 'cards' | 'booking' | 'all';

export function MockupsDemo() {
  const [activeView, setActiveView] = useState<MockupView>('all');

  const views = [
    { id: 'all', label: 'Vue complète', icon: '🎨' },
    { id: 'hero', label: 'Hero Section', icon: '🏠' },
    { id: 'cards', label: 'Listing Cards', icon: '📋' },
    { id: 'booking', label: 'Booking Flow', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold text-primary-600">
                PromotionHub
              </h1>
              <p className="text-sm text-gray-500">UX Mockups Preview</p>
            </div>
            <div className="flex gap-2">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as MockupView)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeView === view.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{view.icon}</span>
                  <span className="hidden sm:inline">{view.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {/* Hero Section */}
        {(activeView === 'all' || activeView === 'hero') && (
          <section>
            {activeView === 'all' && (
              <div className="bg-gray-900 py-4 text-center text-sm text-white">
                <span className="rounded-full bg-primary-500 px-3 py-1 font-medium">
                  Hero Section
                </span>
                <span className="ml-2 text-gray-400">
                  Carrousel immersif + Catégories émotionnelles + Stats animées
                </span>
              </div>
            )}
            <HeroSection />
          </section>
        )}

        {/* Listing Cards */}
        {(activeView === 'all' || activeView === 'cards') && (
          <section className="py-12">
            {activeView === 'all' && (
              <div className="mb-8 text-center">
                <span className="rounded-full bg-secondary-500 px-3 py-1 text-sm font-medium text-white">
                  Listing Cards
                </span>
                <p className="mt-2 text-gray-600">
                  Badges trust + Prix TTC + Disponibilité temps réel
                </p>
              </div>
            )}
            <ListingCardDemo />
          </section>
        )}

        {/* Booking Flow */}
        {(activeView === 'all' || activeView === 'booking') && (
          <section>
            {activeView === 'all' && (
              <div className="bg-primary-50 py-4 text-center">
                <span className="rounded-full bg-primary-500 px-3 py-1 text-sm font-medium text-white">
                  Booking Flow
                </span>
                <p className="mt-2 text-gray-600">
                  3 étapes: Dates → Paiement → Confirmation
                </p>
              </div>
            )}
            <BookingFlow />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-gray-600">
            PromotionHub UX Redesign - Inspiré par Airbnb, Wave & Orange Money
          </p>
          <p className="mt-2 text-sm text-gray-400">
            BMAD Method v6 - 54 idées générées, 5 key insights
          </p>
        </div>
      </footer>
    </div>
  );
}

export { HeroSection } from './HeroSection';
export { ListingCard, ListingCardDemo } from './ListingCard';
export { BookingFlow } from './BookingFlow';
