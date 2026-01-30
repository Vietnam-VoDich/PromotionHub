import { Router } from 'express';
import { newsletterController } from '../controllers/newsletter.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// subscribe to newsletter
router.post('/subscribe', newsletterController.subscribe);

// confirm subscription
router.get('/confirm', newsletterController.confirmSubscription);

// unsubscribe
router.get('/unsubscribe', newsletterController.unsubscribe);

// ============================================
// ADMIN ROUTES (protected)
// ============================================

// get stats
router.get('/admin/stats', authenticate, adminMiddleware, newsletterController.getStats);

// get all subscribers
router.get('/admin/subscribers', authenticate, adminMiddleware, newsletterController.getSubscribers);

// campaigns CRUD
router.get('/admin/campaigns', authenticate, adminMiddleware, newsletterController.getCampaigns);
router.post('/admin/campaigns', authenticate, adminMiddleware, newsletterController.createCampaign);
router.get('/admin/campaigns/:id', authenticate, adminMiddleware, newsletterController.getCampaign);
router.put('/admin/campaigns/:id', authenticate, adminMiddleware, newsletterController.updateCampaign);
router.delete('/admin/campaigns/:id', authenticate, adminMiddleware, newsletterController.deleteCampaign);

// send campaign
router.post('/admin/campaigns/:id/send', authenticate, adminMiddleware, newsletterController.sendCampaign);

export default router;
