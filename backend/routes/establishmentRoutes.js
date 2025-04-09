import express from "express"
import {
  getEstablishments,
  getEstablishmentById,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  rateEstablishment,
} from "../controllers/establishmentController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/").get(getEstablishments).post(protect, admin, createEstablishment)
router
  .route("/:id")
  .get(getEstablishmentById)
  .put(protect, admin, updateEstablishment)
  .delete(protect, admin, deleteEstablishment)
router.route("/:id/ratings").post(protect, rateEstablishment)
router.route("/:id/rate").post(protect, rateEstablishment) // Ajout de cette route

export default router

