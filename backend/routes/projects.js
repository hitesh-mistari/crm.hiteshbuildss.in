import { Router } from 'express';
import {
  getProjects, createProject, updateProject, deleteProject,
  getProjectTasks, createProjectTask, updateProjectTask, deleteProjectTask,
  getProjectNotes, createProjectNote, updateProjectNote, deleteProjectNote,
  getProjectLinks, createProjectLink, deleteProjectLink,
  getProjectMembers, createProjectMember, deleteProjectMember,
} from '../controllers/projects.js';

const router = Router();

router.get('/', getProjects);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

router.get('/tasks', getProjectTasks);
router.post('/tasks', createProjectTask);
router.patch('/tasks/:id', updateProjectTask);
router.delete('/tasks/:id', deleteProjectTask);

router.get('/notes', getProjectNotes);
router.post('/notes', createProjectNote);
router.patch('/notes/:id', updateProjectNote);
router.delete('/notes/:id', deleteProjectNote);

router.get('/links', getProjectLinks);
router.post('/links', createProjectLink);
router.delete('/links/:id', deleteProjectLink);

router.get('/members', getProjectMembers);
router.post('/members', createProjectMember);
router.delete('/members', deleteProjectMember);

export default router;
