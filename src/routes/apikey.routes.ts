import { Router } from 'express';
import {
  addApiKey, getApiKeys, updateApiKey, setPrimaryApiKey,
  configureRouting, deleteApiKey, revokeAllApiKeys,
  getUsageStats, testApiKey
} from '../controllers/apikey.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addKeySchema, updateKeySchema, routingSchema } from '../validations/apikey.schema';

const router = Router();

router.use(authenticate);

router.get('/', getApiKeys);
router.post('/', validate(addKeySchema), addApiKey);
router.get('/usage', getUsageStats);

router.put('/:id', validate(updateKeySchema), updateApiKey);
router.put('/:id/primary', setPrimaryApiKey);
router.put('/:id/routing', validate(routingSchema), configureRouting);
router.delete('/:id', deleteApiKey);
router.delete('/revoke-all', revokeAllApiKeys);
router.post('/test/:id', testApiKey);

export default router;
