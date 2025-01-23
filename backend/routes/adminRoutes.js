import express from 'express';
import { createAdminUser } from '../controllers/adminController.js';

const router = express.Router();

router.post('/create', createAdminUser);

export default router;

