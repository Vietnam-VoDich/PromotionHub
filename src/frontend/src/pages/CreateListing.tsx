import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, X, Plus, ArrowLeft, Save, Image } from 'lucide-react';
import { listingsApi } from '@/lib/api';
import { QUARTIERS, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

const LISTING_TYPES = [
  { value: 'billboard', label: 'Panneau 4x3' },
  { value: 'digital', label: 'Écran digital' },
  { value: 'bus_shelter', label: 'Abribus' },
  { value: 'wall', label: 'Mur peint' },
  { value: 'rooftop', label: 'Toiture' },
];

const SIZES = [
  { value: 'small', label: 'Petit (2x3m)', dimensions: '2x3m' },
  { value: 'medium', label: 'Moyen (4x3m)', dimensions: '4x3m' },
  { value: 'large', label: 'Grand (12x4m)', dimensions: '12x4m' },
];

export function CreateListing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'billboard',
    size: 'medium',
    quartier: '',
    address: '',
    latitude: '',
    longitude: '',
    pricePerMonth: '',
    minBookingDays: '30',
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const listing = await listingsApi.create({
        title: formData.title,
        description: formData.description || null,
        size: formData.size as 'small' | 'medium' | 'large',
        quartier: formData.quartier,
        address: formData.address,
        pricePerMonth: parseInt(formData.pricePerMonth),
        latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 0,
      });

      // TODO: Photo upload will be added when the API supports it

      return listing;
    },
    onSuccess: (listing) => {
      navigate(`/listings/${listing.id}`);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      alert('Maximum 5 photos autorisées');
      return;
    }

    setPhotos([...photos, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const isStep1Valid = formData.title && formData.type && formData.size && formData.quartier;
  const isStep2Valid = formData.pricePerMonth && formData.address;
  const isStep3Valid = photos.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Ajouter un panneau</h1>
        <p className="text-gray-600 mt-1">
          Remplissez les informations de votre emplacement publicitaire
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Informations' },
          { num: 2, label: 'Localisation' },
          { num: 3, label: 'Photos' },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => setStep(s.num)}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors',
                step >= s.num
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              )}
            >
              {s.num}
            </button>
            <span className={cn(
              'ml-3 font-medium hidden sm:block',
              step >= s.num ? 'text-gray-900' : 'text-gray-500'
            )}>
              {s.label}
            </span>
            {i < 2 && (
              <div className={cn(
                'w-12 sm:w-24 h-1 mx-4 rounded',
                step > s.num ? 'bg-primary-600' : 'bg-gray-200'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Informations générales</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Titre de l'annonce *"
              placeholder="Ex: Panneau premium Boulevard Lagunaire"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Type de panneau *"
                value={formData.type}
                onChange={(e) => updateFormData('type', e.target.value)}
                options={LISTING_TYPES}
              />
              <Select
                label="Taille *"
                value={formData.size}
                onChange={(e) => updateFormData('size', e.target.value)}
                options={SIZES}
              />
            </div>

            <Select
              label="Quartier *"
              value={formData.quartier}
              onChange={(e) => updateFormData('quartier', e.target.value)}
              options={[
                { value: '', label: 'Sélectionnez un quartier' },
                ...QUARTIERS.map((q) => ({ value: q, label: q })),
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="Décrivez votre emplacement: visibilité, trafic, environnement..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!isStep1Valid}>
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Location & Price */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Localisation et tarif</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Adresse complète *"
              placeholder="Ex: Boulevard Lagunaire, près du pont Houphouët-Boigny"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              leftIcon={<MapPin className="h-5 w-5" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Latitude (optionnel)"
                placeholder="5.3364"
                value={formData.latitude}
                onChange={(e) => updateFormData('latitude', e.target.value)}
              />
              <Input
                type="number"
                label="Longitude (optionnel)"
                placeholder="-4.0266"
                value={formData.longitude}
                onChange={(e) => updateFormData('longitude', e.target.value)}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">Tarification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Prix par mois (FCFA) *"
                  placeholder="150000"
                  value={formData.pricePerMonth}
                  onChange={(e) => updateFormData('pricePerMonth', e.target.value)}
                />
                <Input
                  type="number"
                  label="Durée minimum (jours)"
                  placeholder="30"
                  value={formData.minBookingDays}
                  onChange={(e) => updateFormData('minBookingDays', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Précédent
              </Button>
              <Button onClick={() => setStep(3)} disabled={!isStep2Valid}>
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Photos */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Photos du panneau</h2>
            <p className="text-sm text-gray-500">
              Ajoutez jusqu'à 5 photos de votre emplacement. La première sera la photo principale.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Photo principale
                    </div>
                  )}
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Ajouter photo</span>
                </label>
              )}
            </div>

            {photos.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  Ajoutez au moins une photo de votre panneau
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Les annonces avec photos reçoivent 3x plus de réservations
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Précédent
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!isStep3Valid || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Publier l'annonce
                  </>
                )}
              </Button>
            </div>

            {createMutation.isError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                Une erreur est survenue. Veuillez réessayer.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
