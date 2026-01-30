import { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import type { MarkerDragEvent, ViewStateChangeEvent, MapMouseEvent } from 'react-map-gl/mapbox';
import { Link } from 'react-router-dom';
import type { Listing } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapViewProps {
  listings: Listing[];
  selectedListing?: Listing | null;
  onListingSelect?: (listing: Listing | null) => void;
  onMapClick?: (lng: number, lat: number) => void;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  showPopups?: boolean;
  markerDraggable?: boolean;
  onMarkerDrag?: (lng: number, lat: number) => void;
  className?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price);
}

function ListingMarker({
  listing,
  isSelected,
  onClick,
}: {
  listing: Listing;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusColors = {
    active: 'bg-green-500 border-green-600',
    booked: 'bg-orange-500 border-orange-600',
    inactive: 'bg-gray-400 border-gray-500',
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-8 h-8 rounded-full border-2 shadow-lg
        transform transition-transform duration-200
        flex items-center justify-center text-white text-xs font-bold
        ${statusColors[listing.status]}
        ${isSelected ? 'scale-125 ring-2 ring-primary-400' : 'hover:scale-110'}
      `}
    >
      {listing.size === 'small' ? 'S' : listing.size === 'medium' ? 'M' : 'L'}
    </button>
  );
}

export function MapView({
  listings,
  selectedListing,
  onListingSelect,
  onMapClick,
  center = [-4.0305, 5.3364], // Abidjan
  zoom = 12,
  interactive = true,
  showPopups = true,
  markerDraggable = false,
  onMarkerDrag,
  className = '',
}: MapViewProps) {
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: center[0],
    latitude: center[1],
    zoom: zoom,
  });
  const [popupInfo, setPopupInfo] = useState<Listing | null>(null);

  const handleMarkerClick = useCallback(
    (listing: Listing) => {
      if (showPopups) {
        setPopupInfo(listing);
      }
      onListingSelect?.(listing);
    },
    [showPopups, onListingSelect]
  );

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (onMapClick) {
        onMapClick(event.lngLat.lng, event.lngLat.lat);
      }
      setPopupInfo(null);
      onListingSelect?.(null);
    },
    [onMapClick, onListingSelect]
  );

  const handleMarkerDrag = useCallback(
    (event: MarkerDragEvent) => {
      if (onMarkerDrag) {
        onMarkerDrag(event.lngLat.lng, event.lngLat.lat);
      }
    },
    [onMarkerDrag]
  );

  const markers = useMemo(
    () =>
      listings.map((listing) => (
        <Marker
          key={listing.id}
          longitude={listing.longitude}
          latitude={listing.latitude}
          anchor="center"
          draggable={markerDraggable && selectedListing?.id === listing.id}
          onDragEnd={handleMarkerDrag}
        >
          <ListingMarker
            listing={listing}
            isSelected={selectedListing?.id === listing.id || popupInfo?.id === listing.id}
            onClick={() => handleMarkerClick(listing)}
          />
        </Marker>
      )),
    [listings, selectedListing, popupInfo, markerDraggable, handleMarkerClick, handleMarkerDrag]
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <p className="text-gray-500 mb-2">Configuration Mapbox requise</p>
          <p className="text-sm text-gray-400">
            Ajoutez VITE_MAPBOX_TOKEN dans votre fichier .env
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactive={interactive}
      >
        {interactive && (
          <>
            <NavigationControl position="top-right" />
            <GeolocateControl
              position="top-right"
              trackUserLocation
              showUserHeading
            />
          </>
        )}

        {markers}

        {showPopups && popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            className="mapbox-popup"
          >
            <div className="w-64">
              {popupInfo.photos[0] && (
                <img
                  src={popupInfo.photos[0].url}
                  alt={popupInfo.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              )}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 truncate">{popupInfo.title}</h3>
                <p className="text-sm text-gray-500 truncate">{popupInfo.quartier}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary-600">
                    {formatPrice(popupInfo.pricePerMonth)}/mois
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      popupInfo.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : popupInfo.status === 'booked'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {popupInfo.status === 'active'
                      ? 'Disponible'
                      : popupInfo.status === 'booked'
                      ? 'Réservé'
                      : 'Inactif'}
                  </span>
                </div>
                <Link
                  to={`/listings/${popupInfo.id}`}
                  className="block w-full mt-3 px-3 py-2 bg-primary-600 text-white text-center text-sm rounded-lg hover:bg-primary-700"
                >
                  Voir le détail
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
