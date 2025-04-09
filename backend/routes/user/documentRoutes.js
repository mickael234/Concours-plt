import express from "express"
import { protect } from "../../middleware/authMiddleware.js"
import { getUserDocuments, addUserDocument, deleteUserDocument } from "../../controllers/user/documentController.js"

const router = express.Router()

// Protéger toutes les routes
router.use(protect)

router.route("/").get(getUserDocuments).post(addUserDocument)

router.route("/:id").delete(deleteUserDocument)

export default router

