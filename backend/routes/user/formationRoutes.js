import express from "express"
import { protect } from "../../middleware/authMiddleware.js"
import {
  getUserFormations,
  registerForFormation,
  cancelFormationRegistration,
} from "../../controllers/user/formationController.js"

const router = express.Router()

// Toutes les routes sont protégées
router.use(protect)

// Routes pour les formations de l'utilisateur
router.get("/", getUserFormations)
router.post("/:id/register", registerForFormation)
router.delete("/:id/register", cancelFormationRegistration)

export default router

