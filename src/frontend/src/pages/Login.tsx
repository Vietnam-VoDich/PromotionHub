import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="mt-2 text-gray-600">
            Connectez-vous à votre compte PromotionHub
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              leftIcon={<Mail className="h-5 w-5" />}
              required
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-gray-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Mot de passe oublié ?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              S'inscrire
            </Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Comptes de démonstration :</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li><strong>Admin:</strong> admin@promotionhub.ci / admin123</li>
            <li><strong>Propriétaire:</strong> owner@demo.ci / owner123</li>
            <li><strong>Annonceur:</strong> advertiser@demo.ci / advertiser123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
