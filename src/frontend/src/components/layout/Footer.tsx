import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">PromotionHub</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              La marketplace de panneaux publicitaires en Côte d'Ivoire
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/listings" className="text-sm hover:text-white">
                  Tous les panneaux
                </Link>
              </li>
              <li>
                <Link to="/signup?role=owner" className="text-sm hover:text-white">
                  Devenir propriétaire
                </Link>
              </li>
              <li>
                <Link to="/signup?role=advertiser" className="text-sm hover:text-white">
                  Devenir annonceur
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-white">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white">
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary-500" />
                Abidjan, Côte d'Ivoire
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary-500" />
                +225 07 00 00 00 00
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary-500" />
                contact@promotionhub.ci
              </li>
              <li>
                <a
                  href="https://wa.me/22507000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} PromotionHub. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
