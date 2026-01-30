import { useState } from 'react';
import {
  User, Mail, Phone, Camera,
  Save, Shield, Bell, LogOut, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export function Profile() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // TODO: Call API when available
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    setIsSaving(true);
    // TODO: Call API when available
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="py-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 mt-3">
                  {user?.firstName} {user?.lastName}
                </h3>
                <Badge variant={user?.role === 'owner' ? 'info' : 'default'} className="mt-1">
                  {user?.role === 'owner' ? 'Propriétaire' : 'Annonceur'}
                </Badge>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                  Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Informations personnelles</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Prénom"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      leftIcon={<User className="h-5 w-5" />}
                    />
                    <Input
                      label="Nom"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    leftIcon={<Mail className="h-5 w-5" />}
                  />

                  <Input
                    label="Téléphone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    leftIcon={<Phone className="h-5 w-5" />}
                    placeholder="+225 07 00 00 00 00"
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      Enregistrer
                    </Button>
                  </div>

                  {saveSuccess && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                      Profil mis à jour avec succès !
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Sécurité du compte</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPassword} className="space-y-6">
                  <Input
                    label="Mot de passe actuel"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                  />

                  <Input
                    label="Nouveau mot de passe"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />

                  <Input
                    label="Confirmer le mot de passe"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Shield className="h-5 w-5" />
                      )}
                      Changer le mot de passe
                    </Button>
                  </div>
                </form>

                <div className="mt-8 pt-8 border-t">
                  <h3 className="font-medium text-gray-900 mb-4">Sessions actives</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Session actuelle</div>
                        <div className="text-sm text-gray-500">
                          Chrome sur macOS · Abidjan, Côte d'Ivoire
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Préférences de notification</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      title: 'Nouvelles réservations',
                      description: 'Recevoir une notification quand quelqu\'un réserve votre panneau',
                      email: true,
                      sms: true,
                    },
                    {
                      title: 'Messages',
                      description: 'Être notifié des nouveaux messages',
                      email: true,
                      sms: false,
                    },
                    {
                      title: 'Paiements',
                      description: 'Notifications de paiement reçu ou en attente',
                      email: true,
                      sms: true,
                    },
                    {
                      title: 'Rappels',
                      description: 'Rappels avant le début et la fin d\'une campagne',
                      email: true,
                      sms: false,
                    },
                    {
                      title: 'Newsletter',
                      description: 'Recevoir les actualités et promotions de PromotionHub',
                      email: false,
                      sms: false,
                    },
                  ].map((notif, index) => (
                    <div key={index} className="flex items-start justify-between py-4 border-b last:border-0">
                      <div>
                        <div className="font-medium text-gray-900">{notif.title}</div>
                        <div className="text-sm text-gray-500">{notif.description}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={notif.email}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-600">Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={notif.sms}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-600">SMS</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <Button>
                      <Save className="h-5 w-5" />
                      Enregistrer les préférences
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
