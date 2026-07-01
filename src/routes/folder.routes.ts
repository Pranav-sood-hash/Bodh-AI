import { Router } from 'express';
import {
  getFolders, createFolder, updateFolder, deleteFolder, addChatToFolder
} from '../controllers/folder.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getFolders);
router.post('/', createFolder);

router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);
router.post('/:id/chats', addChatToFolder);

export default router;
