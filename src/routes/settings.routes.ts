import { Router } from 'express';
import {
  getSettings, updateVoiceSettings, updateLanguageSettings,
  updateNotificationSettings, updateAppearanceSettings
} from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/voice', updateVoiceSettings);
router.put('/language', updateLanguageSettings);
router.put('/notifications', updateNotificationSettings);
router.put('/appearance', updateAppearanceSettings);

export default router;
