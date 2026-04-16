import { Router } from 'express';
import { getInboxItems, createInboxItem, updateInboxItem, deleteInboxItem } from '../controllers/inbox.js';

const router = Router();
router.get('/', getInboxItems);
router.post('/', createInboxItem);
router.patch('/:id', updateInboxItem);
router.delete('/:id', deleteInboxItem);
export default router;
