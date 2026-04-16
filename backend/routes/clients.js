import { Router } from 'express';
import { getClients, createClient, updateClient, deleteClient } from '../controllers/clients.js';

const router = Router();
router.get('/', getClients);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);
export default router;
