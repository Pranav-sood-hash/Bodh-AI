import { Router } from 'express';
import {
  sendMessage, streamMessage, getMessages, deleteMessage
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { aiLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import { sendMessageSchema } from '../validations/chat.schema';

const router = Router();

router.use(authenticate);

router.post('/send', aiLimiter, validate(sendMessageSchema), sendMessage);
router.post('/stream', aiLimiter, streamMessage);
router.get('/:chatId', getMessages);
router.delete('/:id', deleteMessage);

export default router;
