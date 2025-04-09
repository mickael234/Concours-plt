import express from "express"
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getBusinessDocuments,
  rateDocument,
} from "../controllers/documentController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

// Routes pour les documents
router.route("/").get(getAllDocuments).post(protect, createDocument)

router.route("/:id").get(getDocumentById).put(protect, updateDocument).delete(protect, deleteDocument)

// Route pour noter un document
router.route("/:id/rate").post(protect, rateDocument)
router.get("/documents", getBusinessDocuments)

export default router

