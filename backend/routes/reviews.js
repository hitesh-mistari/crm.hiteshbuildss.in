import { Router } from 'express';
import { getWeeklyReviews, upsertWeeklyReview, getOneThing, upsertOneThing } from '../controllers/reviews.js';

const router = Router();
router.get('/', getWeeklyReviews);
router.post('/', upsertWeeklyReview);
router.get('/one-thing', getOneThing);
router.post('/one-thing', upsertOneThing);
export default router;
