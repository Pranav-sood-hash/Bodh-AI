import { Router } from 'express';
import multer from 'multer';
import {
  getRoadmap, generateRoadmap, updateMilestone, reoptimizeRoadmap, suggestFocusAreas, startMilestonePractice, validateMilestoneProject
} from '../controllers/roadmap.controller';
import { authenticate } from '../middleware/auth.middleware';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.use(authenticate);

router.get('/', getRoadmap);
router.get('/suggest-focus', suggestFocusAreas);
router.post('/generate', generateRoadmap);
router.put('/milestone/:id', updateMilestone);
router.post('/reoptimize', reoptimizeRoadmap);
router.post('/milestone/:id/practice', startMilestonePractice);
router.post('/milestone/:id/validate-project', upload.single('file'), validateMilestoneProject);

export default router;
