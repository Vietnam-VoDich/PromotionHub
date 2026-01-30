import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = '22507000000'; // Numéro WhatsApp (sans +)
  const message = encodeURIComponent('Bonjour, je suis intéressé par vos panneaux publicitaires.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all hover:scale-110"
      aria-label="Contacter sur WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
