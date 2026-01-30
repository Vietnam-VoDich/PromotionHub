# Pricing SMS vs WhatsApp - Afrique de l'Ouest

## SMS - Africa's Talking

| Pays | Prix/SMS | 1000 SMS/mois | 10000 SMS/mois |
|------|----------|---------------|----------------|
| **Côte d'Ivoire** | 0.025€ | 25€ | 250€ |
| **Sénégal** | 0.02€ | 20€ | 200€ |
| **Mali** | 0.025€ | 25€ | 250€ |
| **Burkina Faso** | 0.025€ | 25€ | 250€ |
| **Nigeria** | 0.015€ | 15€ | 150€ |
| **Ghana** | 0.018€ | 18€ | 180€ |

**Source:** https://africastalking.com/pricing

## WhatsApp Business API (Meta)

| Type de message | Prix | Notes |
|-----------------|------|-------|
| **User-initiated** | GRATUIT | L'utilisateur écrit en premier |
| **Business-initiated (template)** | 0.005-0.01€ | Templates pré-approuvés par Meta |
| **Session 24h** | GRATUIT | Réponses illimitées pendant 24h |

**Économie:** WhatsApp = **5x moins cher** que SMS

### Calcul pour 1000 notifications/mois

| Canal | Coût mensuel |
|-------|-------------|
| SMS (Africa's Talking) | 25€ |
| WhatsApp (templates) | 5-10€ |
| WhatsApp (user-initiated) | 0€ |

## Recommandation

1. **Utiliser WhatsApp en priorité** pour les notifications
2. **SMS en fallback** si l'utilisateur n'a pas WhatsApp
3. **Stratégie hybride:**
   - Notifications transactionnelles → WhatsApp
   - Marketing → Email (SendGrid gratuit jusqu'à 100/jour)
   - Urgences → SMS

## Setup WhatsApp Business API

1. Créer un compte Meta Business: https://business.facebook.com
2. Créer une app WhatsApp: https://developers.facebook.com/apps
3. Obtenir le Phone Number ID et Access Token
4. Soumettre les templates pour approbation (2-24h)

### Templates recommandés pour PromotionHub

```
1. booking_created (fr)
"Bonjour {{1}}, vous avez reçu une nouvelle demande de réservation pour {{2}}. Connectez-vous pour répondre."

2. booking_confirmed (fr)
"Bonjour {{1}}, votre réservation pour {{2}} est confirmée ! Dates: {{3}}"

3. payment_received (fr)
"Paiement de {{1}} XOF reçu. Référence: {{2}}. Merci !"

4. welcome_message (fr)
"Bienvenue sur PromotionHub {{1}} ! Votre compte est prêt."
```

## Variables d'environnement

```bash
# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_SUPPORT_PHONE=2250700000000

# Africa's Talking (SMS fallback)
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your-api-key
```
