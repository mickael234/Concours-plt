import express from "express"
import { protect } from "../../middleware/authMiddleware.js"
import { getUserAlerts, addUserAlert, deleteUserAlert } from "../../controllers/user/alertController.js"

const router = express.Router()

// Protéger toutes les routes
router.use(protect)

router.route("/").get(getUserAlerts).post(addUserAlert)

router.route("/:id").delete(deleteUserAlert)

export default router

