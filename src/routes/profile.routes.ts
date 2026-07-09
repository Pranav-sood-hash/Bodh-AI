import { Router } from 'express';
import { getPublicProfile, getProfileSettings, updateProfileSettings } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Publicly viewable portfolio/profile by slug (No auth required)
router.get('/public/:slug', getPublicProfile);

// Authenticated sharing settings
router.get('/settings', authenticate, getProfileSettings);
router.put('/settings', authenticate, updateProfileSettings);

export default router;
