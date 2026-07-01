import { Router } from 'express';
import {
  getChats, createChat, getChat, updateChat,
  deleteChat, togglePin, getPinnedChats, searchChats
} from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createChatSchema } from '../validations/chat.schema';

const router = Router();

router.use(authenticate);

router.get('/', getChats);
router.post('/', validate(createChatSchema), createChat);
router.get('/pinned', getPinnedChats);
router.get('/search', searchChats);

router.get('/:id', getChat);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);
router.post('/:id/pin', togglePin);

export default router;
