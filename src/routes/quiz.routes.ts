import { Router } from 'express';
import { getMilestoneQuiz, submitQuizAnswers } from '../controllers/quiz.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:milestoneId', getMilestoneQuiz);
router.post('/:milestoneId/submit', submitQuizAnswers);

export default router;
