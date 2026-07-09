import { Router } from 'express';
import { createRoom, listRooms, getRoomMessages, getRoomMembers } from '../controllers/collab.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/rooms', createRoom);
router.get('/rooms', listRooms);
router.get('/rooms/:roomId/messages', getRoomMessages);
router.get('/rooms/:roomId/members', getRoomMembers);

export default router;
