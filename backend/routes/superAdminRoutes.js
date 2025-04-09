import express from "express"
import {
  getStats,
  getAdminFormations,
  getBusinesses,
  getBusinessById,
  deleteBusiness,
  getAdminInscriptions,
  updateInscriptionStatus,
  deleteInscription,
} from "../controllers/adminController.js"
import { createSuperAdmin, createAdminUser } from "../controllers/userController.js"
import { protect, admin, superAdmin } from "../middleware/authMiddleware.js"
import {
  getEstablishments as getAdminEstablishments,
  getEstablishmentById,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
} from "../controllers/establishmentController.js"
import {
  getConcours as getAdminConcours,
  getConcoursById,
  createConcours,
  updateConcours,
  deleteConcours,
} from "../controllers/concoursController.js"
import {
  getResources as getAdminResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} from "../controllers/resourceController.js"

const router = express.Router()

// Route publique pour créer un super admin (protégée par clé secrète)
router.post("/create", createSuperAdmin)

// Routes protégées par superAdmin
router.post("/create-admin", protect, superAdmin, createAdminUser)

// Routes protégées par admin (accessibles par admin et superadmin)
router.get("/stats", protect, admin, getStats)
router.get("/formations", protect, admin, getAdminFormations)
router.get("/businesses", protect, admin, getBusinesses)
router.get("/businesses/:id", protect, admin, getBusinessById)
router.delete("/businesses/:id", protect, admin, deleteBusiness)
router.get("/inscriptions", protect, admin, getAdminInscriptions)
router.put("/inscriptions/:id/status", protect, admin, updateInscriptionStatus)
router.delete("/inscriptions/:id", protect, admin, deleteInscription)
// Concours routes
router.get("/concours", protect, admin, getAdminConcours)
router.post("/concours", protect, admin, createConcours)
router.get("/concours/:id", protect, admin, getConcoursById)
router.put("/concours/:id", protect, admin, updateConcours)
router.delete("/concours/:id", protect, admin, deleteConcours)

// Establishment routes
router.get("/establishments", protect, admin, getAdminEstablishments)
router.post("/establishments", protect, admin, createEstablishment)
router.get("/establishments/:id", protect, admin, getEstablishmentById)
router.put("/establishments/:id", protect, admin, updateEstablishment)
router.delete("/establishments/:id", protect, admin, deleteEstablishment)

// Resource routes
router.get("/resources", protect, admin, getAdminResources)
router.post("/resources", protect, admin, createResource)
router.get("/resources/:id", protect, admin, getResourceById)
router.put("/resources/:id", protect, admin, updateResource)
router.delete("/resources/:id", protect, admin, deleteResource)

export default router

