import { Router } from 'express';
import { getTeamMembers, createTeamMember, deleteTeamMember } from '../controllers/team.js';

const router = Router();
router.get('/', getTeamMembers);
router.post('/', createTeamMember);
router.delete('/:id', deleteTeamMember);
export default router;
