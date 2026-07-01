import { Router } from 'express';
import {
  getRoadmap, generateRoadmap, updateMilestone, reoptimizeRoadmap, suggestFocusAreas
} from '../controllers/roadmap.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getRoadmap);
router.get('/suggest-focus', suggestFocusAreas);
router.post('/generate', generateRoadmap);
router.put('/milestone/:id', updateMilestone);
router.post('/reoptimize', reoptimizeRoadmap);

export default router;
