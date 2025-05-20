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

// Vérifier que les routes sont correctement définies
console.log("Routes profileRoutes.js chargées:")
console.log("GET /api/user/profile -> getUserProfile")
console.log("PUT /api/user/profile -> updateUserProfile")
console.log("PUT /api/user/profile/password -> updateUserPassword")

// Route pour récupérer le profil utilisateur
router.route("/").get(getUserProfile).put(updateUserProfile)
router.route("/education").post(addUserEducation)
router.route("/education/:id").delete(deleteUserEducation)
router.route("/experience").post(addUserExperience)
router.route("/experience/:id").delete(deleteUserExperience)
router.route("/notifications").put(updateNotificationSettings)
router.route("/password").put(updateUserPassword)

export default router
