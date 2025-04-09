import express from "express"
import {
  getConcours,
  getConcoursById,
  createConcours,
  updateConcours,
  deleteConcours,
  incrementConcoursViews,
  rateConcours,
} from "../controllers/concoursController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/").get(getConcours).post(protect, admin, createConcours)
router.route("/:id").get(getConcoursById).put(protect, admin, updateConcours).delete(protect, admin, deleteConcours)
router.route("/:id/view").post(incrementConcoursViews).put(incrementConcoursViews) // Ajout de la méthode PUT
router.route("/:id/rate").post(protect, rateConcours)

export default router

