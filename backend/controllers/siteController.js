import asyncHandler from "express-async-handler"
import SiteStats from "../models/SiteStats.js"

// @desc    Incrémenter les vues du site
// @route   PUT /api/site/view
// @access  Public
const incrementSiteViews = asyncHandler(async (req, res) => {
  try {
    // Récupérer ou créer les statistiques du site
    let stats = await SiteStats.findOne()

    if (!stats) {
      // Si les statistiques n'existent pas, les créer
      stats = new SiteStats({
        views: 1,
        lastUpdated: Date.now(),
      })
    } else {
      // Sinon, incrémenter les vues
      stats.views += 1
      stats.lastUpdated = Date.now()
    }

    // Sauvegarder les statistiques
    await stats.save()

    res.status(200).json({ success: true, views: stats.views })
  } catch (error) {
    console.error("Erreur lors de l'incrémentation des vues:", error)
    res.status(500)
    throw new Error("Erreur lors de l'incrémentation des vues")
  }
})

// @desc    Obtenir les statistiques du site
// @route   GET /api/site/stats
// @access  Public
const getSiteStats = asyncHandler(async (req, res) => {
  try {
    // Récupérer les statistiques du site
    const stats = await SiteStats.findOne()

    if (!stats) {
      // Si les statistiques n'existent pas, retourner des valeurs par défaut
      return res.status(200).json({ views: 0, lastUpdated: null })
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des statistiques")
  }
})

export { incrementSiteViews, getSiteStats }

