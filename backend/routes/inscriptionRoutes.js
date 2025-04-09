import express from "express"
import {
  createInscription,
  getInscriptionById,
  getUserInscriptions,
  getBusinessInscriptions,
  getAllInscriptions,
  updateInscriptionStatus,
  updateInscriptionPaymentMethod,
  deleteInscription,
} from "../controllers/inscriptionController.js"
import { protect, admin, adminOrBusiness } from "../middleware/authMiddleware.js"

const router = express.Router()

// Routes utilisateur
router.route("/").post(protect, createInscription)
router.route("/user").get(protect, getUserInscriptions)

// Routes business
router.route("/business").get(protect, getBusinessInscriptions)

// Routes admin
router.route("/admin").get(protect, admin, getAllInscriptions)

// Routes communes
router.route("/:id").get(protect, adminOrBusiness, getInscriptionById)
router.route("/:id").delete(protect, adminOrBusiness, deleteInscription)
router.route("/:id/status").put(protect, adminOrBusiness, updateInscriptionStatus)
router.route("/:id/payment-method").put(protect, adminOrBusiness, updateInscriptionPaymentMethod)

export default router

