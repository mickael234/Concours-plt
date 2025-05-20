import express from "express"
import userRoutes from "./userRoutes.js"
import businessRoutes from "./businessRoutes.js"
import adminRoutes from "./adminRoutes.js"
import concoursRoutes from "./concoursRoutes.js"
import formationRoutes from "./formationRoutes.js"
import documentRoutes from "./documentRoutes.js"
import establishmentRoutes from "./establishmentRoutes.js"
import resourceRoutes from "./resourceRoutes.js"
import ratingRoutes from "./ratingRoutes.js"
import userFormationRoutes from "./user/formationRoutes.js"

const router = express.Router()

// Routes principales
router.use("/user", userRoutes)
router.use("/business", businessRoutes)
router.use("/admin", adminRoutes)
router.use("/concours", concoursRoutes)
router.use("/formations", formationRoutes)
router.use("/documents", documentRoutes)
router.use("/establishments", establishmentRoutes)
router.use("/resources", resourceRoutes)

// Routes pour les formations de l'utilisateur
router.use("/user/formations", userFormationRoutes)

// Routes pour les avis
router.use("/ratings", ratingRoutes)

export default router
