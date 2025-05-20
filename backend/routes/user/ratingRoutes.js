import express from "express"
import { protect } from "../../middleware/authMiddleware.js"
import {
  getUserRatings,
  replyToBusinessResponse,
} from "../../controllers/user/ratingController.js"

const router = express.Router()

router.use(protect)

router.get("/", getUserRatings)
router.post("/:id/user-reply", protect, replyToBusinessResponse)

export default router
