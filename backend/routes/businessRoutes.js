import express from "express"
import {
  loginBusiness,
  registerBusiness,
  getBusinessProfile,
  updateBusinessProfile,
  getBusinessFormations,
  getBusinessInscriptions,
  updateBusinessPassword,
  requestPasswordReset,
  resetPassword,
} from "../controllers/businessController.js"
import { getBusinessDocuments } from "../controllers/documentController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

// Routes d'authentification
router.post("/login", loginBusiness)
router.post("/register", registerBusiness)
router.post("/password-reset-request", requestPasswordReset)
router.post("/reset-password", resetPassword)

// Routes protégées pour les entreprises
router.get("/profile", protect, getBusinessProfile)
router.put("/profile", protect, updateBusinessProfile)
router.put("/profile/password", protect, updateBusinessPassword)
router.get("/formations", protect, getBusinessFormations)
router.get("/documents", protect, getBusinessDocuments)
router.get("/inscriptions", protect, getBusinessInscriptions)

export default router

