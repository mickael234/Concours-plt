import express from "express"
import {
  createFormation,
  getFormations,
  getFormationById,
  updateFormation,
  deleteFormation,
  rateFormation,
  getBusinessFormations,
  getAdminFormations,
  registerForFormation,
} from "../controllers/formationController.js"
import { protect, protectBusiness, adminOrBusiness, admin } from "../middleware/authMiddleware.js"
import multer from "multer"
import path from "path"

const router = express.Router()

// Configuration de multer pour le téléchargement des images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/formations/")
  },
  filename(req, file, cb) {
    cb(null, `formation-${Date.now()}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|svg|jpg|png|webp/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error("Seules les images sont autorisées!"))
    }
  },
})

// Routes publiques
router.get("/", getFormations)
router.get("/:id", getFormationById)

// Routes protégées (utilisateur)
router.post("/:id/rate", protect, rateFormation)
router.post("/:id/inscriptions", protect, registerForFormation)

// Routes protégées (admin/business)
router.post("/", protectBusiness, upload.single("image"), createFormation)
router.put("/:id", adminOrBusiness, upload.single("image"), updateFormation)
router.delete("/:id", adminOrBusiness, deleteFormation)

// Routes business
router.get("/business/formations", protectBusiness, getBusinessFormations)

// Routes admin
router.get("/admin/formations", admin, getAdminFormations)

export default router

