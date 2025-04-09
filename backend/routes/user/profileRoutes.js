import express from "express"
import { protect } from "../../middleware/authMiddleware.js"
import {
  getUserProfile,
  updateUserProfile,
  addUserEducation,
  deleteUserEducation,
  addUserExperience,
  deleteUserExperience,
  updateNotificationSettings,
  updateUserPassword,
} from "../../controllers/user/profileController.js"

const router = express.Router()

// Protéger toutes les routes
router.use(protect)

router.route("/").get(getUserProfile).put(updateUserProfile)

router.route("/education").post(addUserEducation)

router.route("/education/:id").delete(deleteUserEducation)

router.route("/experience").post(addUserExperience)

router.route("/experience/:id").delete(deleteUserExperience)

router.route("/notifications").put(updateNotificationSettings)

router.route("/password").put(updateUserPassword)

export default router
