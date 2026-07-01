import { Router } from 'express';
import {
  getStudySessions, createStudySession, updateStudySession,
  deleteStudySession, completeStudySession, getPlannerStats
} from '../controllers/planner.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/sessions', getStudySessions);
router.post('/sessions', createStudySession);
router.get('/stats', getPlannerStats);

router.put('/sessions/:id', updateStudySession);
router.delete('/sessions/:id', deleteStudySession);
router.put('/sessions/:id/complete', completeStudySession);

export default router;
