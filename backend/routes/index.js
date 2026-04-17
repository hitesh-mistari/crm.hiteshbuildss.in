import { Router } from 'express';
import authRoutes from './auth.js';
import settingsRoutes from './settings.js';
import transactionRoutes from './transactions.js';
import taskRoutes from './tasks.js';
import goalRoutes from './goals.js';
import ideaRoutes from './ideas.js';
import clientRoutes from './clients.js';
import teamRoutes from './team.js';
import inboxRoutes from './inbox.js';
import projectRoutes from './projects.js';
import focusRoutes from './focus.js';
import reviewRoutes from './reviews.js';
import subscriptionRoutes from './subscriptions.js';
import debugRoutes from './debug.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/transactions', transactionRoutes);
router.use('/tasks', taskRoutes);
router.use('/goals', goalRoutes);
router.use('/ideas', ideaRoutes);
router.use('/clients', clientRoutes);
router.use('/team', teamRoutes);
router.use('/inbox', inboxRoutes);
router.use('/projects', projectRoutes);
router.use('/focus', focusRoutes);
router.use('/reviews', reviewRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/debug', debugRoutes);

export default router;
