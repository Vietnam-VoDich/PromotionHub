import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, MessageSquare, Bell, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-dark-900/95 backdrop-blur-md border-b border-dark-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">Promotion<span className="text-primary-400">Hub</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/listings"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg font-medium transition-colors"
            >
              Panneaux
            </Link>
            <Link
              to="/map"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg font-medium transition-colors"
            >
              Carte
            </Link>
            <Link
              to="/blog"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg font-medium transition-colors"
            >
              Blog
            </Link>

            <div className="w-px h-6 bg-dark-700 mx-2" />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/messages"
                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors relative"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors relative">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-dark-800/50 rounded-lg transition-colors"
                  >
                    <Avatar
                      src={user?.avatarUrl}
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      size="sm"
                    />
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-dark-800 rounded-xl shadow-xl border border-dark-700 py-2 overflow-hidden">
                      <div className="px-4 py-3 border-b border-dark-700">
                        <p className="text-sm font-medium text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-dark-400">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-700/50 hover:text-white transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Tableau de bord
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-700/50 hover:text-white transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Mon profil
                        </Link>
                      </div>
                      <div className="border-t border-dark-700 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-dark-200 hover:text-white hover:bg-dark-800/50">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25">
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn('md:hidden', isMenuOpen ? 'block' : 'hidden')}>
        <div className="px-4 pt-2 pb-4 space-y-1 bg-dark-900 border-t border-dark-700/50">
          <Link
            to="/listings"
            className="block px-4 py-3 rounded-lg text-dark-200 hover:bg-dark-800 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Panneaux
          </Link>
          <Link
            to="/map"
            className="block px-4 py-3 rounded-lg text-dark-200 hover:bg-dark-800 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Carte
          </Link>
          <Link
            to="/blog"
            className="block px-4 py-3 rounded-lg text-dark-200 hover:bg-dark-800 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Blog
          </Link>
          {isAuthenticated ? (
            <>
              <div className="border-t border-dark-700 my-2" />
              <Link
                to="/dashboard"
                className="block px-4 py-3 rounded-lg text-dark-200 hover:bg-dark-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tableau de bord
              </Link>
              <Link
                to="/messages"
                className="block px-4 py-3 rounded-lg text-dark-200 hover:bg-dark-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                to="/profile"
                className="block px-4 py-3 rounded-lg text-dark-200 hover:bg-dark-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mon profil
              </Link>
              <div className="border-t border-dark-700 my-2" />
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-dark-700 my-2" />
              <Link
                to="/login"
                className="block px-4 py-3 rounded-lg text-dark-200 hover:bg-dark-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="block px-4 py-3 rounded-lg text-primary-400 font-medium hover:bg-primary-500/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
