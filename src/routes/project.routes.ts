import { Router } from 'express';
import {
  getProjects, createProject, getProject, updateProject,
  deleteProject, getProjectStats
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/stats', getProjectStats);

router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
