import { Router } from 'express';
import { textToSpeech, previewVoice } from '../controllers/voice.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/speak', textToSpeech);
router.post('/preview', previewVoice);

export default router;
