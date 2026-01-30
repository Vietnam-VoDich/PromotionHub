import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export function Signup() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'advertiser';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: defaultRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phone: formData.phone || undefined,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inscription</h1>
          <p className="mt-2 text-gray-600">
            Créez votre compte PromotionHub
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Select
              name="role"
              label="Je suis"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'advertiser', label: 'Annonceur - Je cherche des panneaux' },
                { value: 'owner', label: 'Propriétaire - Je propose des panneaux' },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="Prénom"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Jean"
                leftIcon={<User className="h-5 w-5" />}
              />
              <Input
                name="lastName"
                label="Nom"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Dupont"
              />
            </div>

            <Input
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              leftIcon={<Mail className="h-5 w-5" />}
              required
            />

            <Input
              type="tel"
              name="phone"
              label="Téléphone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+225 07 00 00 00 00"
              leftIcon={<Phone className="h-5 w-5" />}
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              label="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              leftIcon={<Lock className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
              required
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              label="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              leftIcon={<Lock className="h-5 w-5" />}
              required
            />

            <div className="text-xs text-gray-500">
              En vous inscrivant, vous acceptez nos{' '}
              <a href="#" className="text-primary-600 hover:underline">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="#" className="text-primary-600 hover:underline">
                politique de confidentialité
              </a>
              .
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
