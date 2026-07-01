import { Router } from 'express';
import {
  getProfile, updateProfile, uploadAvatar, getStats,
  updatePreferences, saveOnboarding, getSessions,
  revokeSession, revokeAllSessions, deleteAccount
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema, onboardingSchema, updatePreferencesSchema } from '../validations/user.schema';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.get('/stats', getStats);
router.put('/preferences', validate(updatePreferencesSchema), updatePreferences);
router.put('/onboarding', validate(onboardingSchema), saveOnboarding);

// Sessions
router.get('/sessions', getSessions);
router.delete('/sessions/:id', revokeSession);
router.delete('/sessions', revokeAllSessions);

router.delete('/account', deleteAccount);

export default router;
