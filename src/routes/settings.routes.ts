import { Router } from 'express';
import {
  getSettings, updateVoiceSettings, updateLanguageSettings,
  updateNotificationSettings, updateAppearanceSettings
} from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { runWeeklyReportGenerator } from '../services/cron.service';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/voice', updateVoiceSettings);
router.put('/language', updateLanguageSettings);
router.put('/notifications', updateNotificationSettings);
router.put('/appearance', updateAppearanceSettings);
router.post('/trigger-weekly-report', async (req, res, next) => {
  try {
    await runWeeklyReportGenerator();
    res.json({ success: true, message: 'Weekly progress report triggered successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
