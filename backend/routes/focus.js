import { Router } from 'express';
import { getFocusSessions, createFocusSession, getFocusStreak, upsertFocusStreak } from '../controllers/focus.js';

const router = Router();
router.get('/sessions', getFocusSessions);
router.post('/sessions', createFocusSession);
router.get('/streak', getFocusStreak);
router.post('/streak', upsertFocusStreak);
export default router;
