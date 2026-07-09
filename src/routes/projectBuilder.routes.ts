import { Router } from 'express';
import { generateProjectSteps, submitProjectStep, validateProjectStep } from '../controllers/projectBuilder.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/:projectId/steps/generate', generateProjectSteps);
router.post('/steps/:stepId/submit', submitProjectStep);
router.post('/steps/:stepId/validate', validateProjectStep);

export default router;
