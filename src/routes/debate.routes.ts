import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  startDebate,
  streamDebate,
  getDebateSession
} from '../controllers/debate.controller';

const router = Router();

router.use(authenticate);

router.post('/start', startDebate);
router.post('/stream', streamDebate);
router.get('/:sessionId', getDebateSession);

export default router;
