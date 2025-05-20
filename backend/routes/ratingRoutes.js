import express from "express"
import { respondToRating, deleteRatingResponse, replyToBusinessResponse } from "../controllers/ratingController.js"
import { protectBusiness, protect } from "../middleware/authMiddleware.js"

const router = express.Router()

// Routes pour les réponses aux avis
router.post("/:id/respond", protectBusiness, respondToRating)
router.delete("/:id/respond", protectBusiness, deleteRatingResponse)
// Nouvelle route pour les réponses des utilisateurs
router.post("/:id/user-reply", protect, replyToBusinessResponse)

export default router