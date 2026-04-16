import { Router } from 'express';
import { getIdeas, createIdea, updateIdea, deleteIdea } from '../controllers/ideas.js';

const router = Router();
router.get('/', getIdeas);
router.post('/', createIdea);
router.patch('/:id', updateIdea);
router.delete('/:id', deleteIdea);
export default router;
