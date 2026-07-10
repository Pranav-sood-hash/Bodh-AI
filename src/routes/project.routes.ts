import { Router } from 'express';
import multer from 'multer';
import {
  getProjects, createProject, getProject, updateProject,
  deleteProject, getProjectStats,
  generateProblemStatement, createStepByStepRoadmap,
  submitCompleteProject, uploadStepFile, getStepValidation
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';

const storage = multer.memoryStorage();
const uploadProjectFile = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/stats', getProjectStats);

// Step-by-step & validation paths
router.post('/steps/:id/upload', uploadProjectFile.single('file'), uploadStepFile);
router.get('/steps/:id/validation', getStepValidation);

router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/generate-problem', generateProblemStatement);
router.post('/:id/create-step-roadmap', createStepByStepRoadmap);
router.post('/:id/submit-complete', uploadProjectFile.single('file'), submitCompleteProject);

export default router;
