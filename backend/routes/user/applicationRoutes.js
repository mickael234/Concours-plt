import express from "express"
import { protect } from "../../middleware/authMiddleware.js"
import {
  getUserApplications,
  createApplication,
  getApplicationDetails,
  updateApplication,
  cancelApplication,
} from "../../controllers/user/applicationController.js"

const router = express.Router()

// Protéger toutes les routes
router.use(protect)

router.route("/").get(getUserApplications).post(createApplication)

router.route("/:id").get(getApplicationDetails).put(updateApplication).delete(cancelApplication)

export default router

