import express from "express"
import { admin, protect } from "../middleware/authMiddleware.js"
import { getAdminFormations } from "../controllers/formationController.js"
import { getBusinesses, getBusinessById, deleteBusiness } from "../controllers/businessController.js"
import { updateInscriptionStatus } from "../controllers/inscriptionController.js"
import {
    getEstablishmentById,
    createEstablishment,
    updateEstablishment,
    deleteEstablishment,
  } from "../controllers/establishmentController.js"
  import { getConcoursById, createConcours, updateConcours, deleteConcours } from "../controllers/concoursController.js"
  import { getResourceById, createResource, updateResource, deleteResource } from "../controllers/resourceController.js"
  import { getAdminConcours, getAdminEstablishments, getAdminResources } from "../controllers/adminController.js"
const router = express.Router()

// Protéger toutes les routes admin
router.use(protect)
router.use(admin)

// Routes pour les formations
router.get("/formations", getAdminFormations)

// Routes pour les entreprises
router.get("/businesses", getBusinesses)
router.get("/businesses/:id", getBusinessById)
router.delete("/businesses/:id", deleteBusiness)
// Concours routes
router.get("/concours", getAdminConcours)
router.post("/concours", createConcours)
router.get("/concours/:id", getConcoursById)
router.put("/concours/:id", updateConcours)
router.delete("/concours/:id", deleteConcours)

// Establishment routes
router.get("/establishments", getAdminEstablishments)
router.post("/establishments", createEstablishment)
router.get("/establishments/:id", getEstablishmentById)
router.put("/establishments/:id", updateEstablishment)
router.delete("/establishments/:id", deleteEstablishment)

// Resource routes
router.get("/resources", getAdminResources)
router.post("/resources", createResource)
router.get("/resources/:id", getResourceById)
router.put("/resources/:id", updateResource)
router.delete("/resources/:id", deleteResource)

export default router

