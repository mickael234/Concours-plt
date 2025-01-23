import express from 'express';
import { registerStudyGroup, getStudyGroups } from '../controllers/studyGroupController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerStudyGroup).get(protect, admin, getStudyGroups);

export default router;

