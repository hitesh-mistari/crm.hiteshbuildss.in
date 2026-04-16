import { Router } from 'express';
import { getSettings, upsertSettings } from '../controllers/settings.js';

const router = Router();
router.get('/', getSettings);
router.post('/', upsertSettings);
export default router;
