import { Router } from 'express';
import { getSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../controllers/subscriptions.js';

const router = Router();

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.patch('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;
