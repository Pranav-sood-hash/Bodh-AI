import { Router } from 'express';
import {
  getProgress, getActivityHeatmap, getProgressStats,
  logActivity, addMilestone
} from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getProgress);
router.get('/heatmap', getActivityHeatmap);
router.get('/stats', getProgressStats);
router.post('/log-activity', logActivity);
router.post('/milestones', addMilestone);

export default router;
