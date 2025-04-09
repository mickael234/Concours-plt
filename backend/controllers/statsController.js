import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import Concours from "../models/Concours.js"
import Establishment from "../models/Establishment.js"
import SiteStats from "../models/SiteStats.js"
import ConcoursStats from "../models/ConcoursStats.js"
import Formation from "../models/Formation.js"
import Document from "../models/Document.js"

const getStats = asyncHandler(async (req, res) => {
  console.log("Fetching statistics...")

  try {
    // Compter les utilisateurs
    const totalUsers = await User.countDocuments()
    console.log("Total users:", totalUsers)

    // Compter les concours
    const totalConcours = await Concours.countDocuments()
    console.log("Total concours:", totalConcours)

    // Compter les établissements
    const totalEstablishments = await Establishment.countDocuments()
    console.log("Total establishments:", totalEstablishments)

    // Compter les formations
    const totalFormations = await Formation.countDocuments()
    console.log("Total formations:", totalFormations)

    // Compter les documents
    const totalDocuments = await Document.countDocuments()
    console.log("Total documents:", totalDocuments)

    // Récupérer ou créer les statistiques du site
    let siteStats = await SiteStats.findOne()
    if (!siteStats) {
      siteStats = await SiteStats.create({
        totalVisits: 0,
        uniqueVisitors: 0,
      })
    }

    const totalSiteVisits = siteStats.totalVisits || 0
    const uniqueVisitors = siteStats.uniqueVisitors || 0
    console.log("Site stats:", { totalSiteVisits, uniqueVisitors })

    // Calculer les vues totales des concours
    const concoursStats = await ConcoursStats.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ])
    const totalConcoursViews = concoursStats.length > 0 ? concoursStats[0].totalViews : 0
    console.log("Total concours views:", totalConcoursViews)

    // Calculer les vues totales des formations
    const formationViews = await Formation.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ])
    const totalFormationViews = formationViews.length > 0 ? formationViews[0].totalViews : 0
    console.log("Total formation views:", totalFormationViews)

    // Calculer les vues totales des documents
    const documentViews = await Document.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ])
    const totalDocumentViews = documentViews.length > 0 ? documentViews[0].totalViews : 0
    console.log("Total document views:", totalDocumentViews)

    // Calculer les téléchargements totaux des documents
    const documentDownloads = await Document.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: "$downloads" },
        },
      },
    ])
    const totalDocumentDownloads = documentDownloads.length > 0 ? documentDownloads[0].totalDownloads : 0
    console.log("Total document downloads:", totalDocumentDownloads)

    // Assembler les statistiques
    const stats = {
      totalUsers,
      totalConcours,
      totalEstablishments,
      totalFormations,
      totalDocuments,
      totalSiteVisits,
      uniqueVisitors,
      totalConcoursViews,
      totalFormationViews,
      totalDocumentViews,
      totalDocumentDownloads,
    }

    console.log("Sending stats:", stats)
    res.json(stats)
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    })
  }
})

export { getStats }

