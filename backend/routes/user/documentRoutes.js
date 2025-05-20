import express from "express"
import { protect } from "../../middleware/authMiddleware.js"
import { getUserDocuments, addUserDocument, deleteUserDocument } from "../../controllers/user/documentController.js"

const router = express.Router()

// Protéger toutes les routes
router.use(protect)

// Vérifier que les routes sont correctement définies
console.log("Routes documentRoutes.js chargées:")
console.log("GET /api/user/documents -> getUserDocuments")
console.log("POST /api/user/documents -> addUserDocument")
console.log("DELETE /api/user/documents/:id -> deleteUserDocument")

router.route("/").get(getUserDocuments).post(addUserDocument)
router.route("/:id").delete(deleteUserDocument)

export default router
