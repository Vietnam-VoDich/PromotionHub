import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">Promotion<span className="text-primary-400">Hub</span></span>
            </Link>
            <p className="text-sm text-dark-400 mb-6">
              La marketplace de panneaux publicitaires en Côte d'Ivoire. Trouvez l'emplacement parfait pour votre campagne.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-dark-800 hover:bg-dark-700 rounded-lg flex items-center justify-center text-dark-400 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-dark-800 hover:bg-dark-700 rounded-lg flex items-center justify-center text-dark-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-dark-800 hover:bg-dark-700 rounded-lg flex items-center justify-center text-dark-400 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/listings" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  Tous les panneaux
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  Carte interactive
                </Link>
              </li>
              <li>
                <Link to="/signup?role=owner" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  Devenir propriétaire
                </Link>
              </li>
              <li>
                <Link to="/signup?role=advertiser" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  Devenir annonceur
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-dark-400">
                <div className="w-8 h-8 bg-dark-800 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary-400" />
                </div>
                Abidjan, Côte d'Ivoire
              </li>
              <li className="flex items-center gap-3 text-sm text-dark-400">
                <div className="w-8 h-8 bg-dark-800 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-primary-400" />
                </div>
                +225 07 00 00 00 00
              </li>
              <li className="flex items-center gap-3 text-sm text-dark-400">
                <div className="w-8 h-8 bg-dark-800 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary-400" />
                </div>
                contact@promotionhub.ci
              </li>
              <li>
                <a
                  href="https://wa.me/22507000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-dark-500">
            &copy; {new Date().getFullYear()} PromotionHub. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm text-dark-500">
            <a href="#" className="hover:text-dark-300 transition-colors">Conditions</a>
            <a href="#" className="hover:text-dark-300 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-dark-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
