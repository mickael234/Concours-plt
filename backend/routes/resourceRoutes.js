import express from "express"
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  incrementDownload,
  rateResource,
  getAllResources, // Assurez-vous que cette fonction est bien importée
} from "../controllers/resourceController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

// Important: Placez la route /all AVANT les routes avec des paramètres
router.route("/all").get(getAllResources)

router.route("/").get(getResources).post(protect, createResource)
router.route("/:id").get(getResourceById).put(protect, updateResource).delete(protect, admin, deleteResource)
router.route("/:id/download").post(incrementDownload)
router.route("/:id/rate").post(protect, rateResource)

export default router

