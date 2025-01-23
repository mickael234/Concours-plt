import express from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  incrementDownload,
} from '../controllers/resourceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getResources).post(protect, admin, createResource);
router
  .route('/:id')
  .get(getResourceById)
  .put(protect, admin, updateResource)
  .delete(protect, admin, deleteResource);
router.route('/:id/download').put(incrementDownload);

export default router;

