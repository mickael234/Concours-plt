import express from "express"
import { incrementSiteViews, getSiteStats } from "../controllers/siteController.js"

const router = express.Router()

// Route pour incrémenter les vues du site
router.put("/view", incrementSiteViews)

// Route pour obtenir les statistiques du site
router.get("/stats", getSiteStats)

export default router

