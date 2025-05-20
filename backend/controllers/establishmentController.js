import asyncHandler from "express-async-handler"
import Establishment from "../models/Establishment.js"
import ConcoursStats from "../models/ConcoursStats.js"
import { validateEstablishmentData } from "../utils/validationUtils.js"
import User from "../models/User.js" // Ajoutez cette ligne pour importer le modèle User

// @desc    Create an establishment
// @route   POST /api/establishments
// @access  Private/Admin
const createEstablishment = asyncHandler(async (req, res) => {
  console.log("Création d'un établissement avec les données:", req.body)

  const validationErrors = validateEstablishmentData(req.body)
  if (Object.keys(validationErrors).length > 0) {
    res.status(400)
    throw new Error(JSON.stringify(validationErrors))
  }

  // Ensure socialMedia is an array of objects
  if (req.body.socialMedia && typeof req.body.socialMedia === "string") {
    try {
      req.body.socialMedia = JSON.parse(req.body.socialMedia)
    } catch (error) {
      res.status(400)
      throw new Error("Invalid socialMedia format")
    }
  }

  // Remove _id if it exists to prevent duplicate key error
  const establishmentData = { ...req.body }
  if (establishmentData._id) {
    delete establishmentData._id
  }

  const establishment = new Establishment(establishmentData)

  try {
    const createdEstablishment = await establishment.save()
    res.status(201).json(createdEstablishment)
  } catch (error) {
    console.error("Error creating establishment:", error)
    res.status(400)
    throw new Error(error.message)
  }
})

// @desc    Get all establishments
// @route   GET /api/establishments
// @access  Public
const getEstablishments = asyncHandler(async (req, res) => {
  const establishments = await Establishment.find({})
  res.json(establishments)
})

// @desc    Get establishment by ID
// @route   GET /api/establishments/:id
// @access  Public
const getEstablishmentById = asyncHandler(async (req, res) => {
  try {
    // D'abord, récupérer l'établissement avec ses concours et les utilisateurs qui ont noté
    const establishment = await Establishment.findById(req.params.id)
      .populate("concours", "title organizerName organizerLogo")
      .populate("ratings.user", "name firstName lastName")

    if (!establishment) {
      res.status(404)
      throw new Error("Établissement non trouvé")
    }

    // Transformer en objet pour pouvoir le modifier
    const responseData = establishment.toObject()

    // Ensure averageRatings exists
    if (!responseData.averageRatings) {
      responseData.averageRatings = {
        teaching: 0,
        employability: 0,
        network: 0,
        overall: 0,
      }
    }

    // Calculer la note globale
    const { teaching, employability, network } = responseData.averageRatings
    const values = [teaching || 0, employability || 0, network || 0].filter((v) => v > 0)
    responseData.averageRatings.overall =
      values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0

    // Si l'établissement a des concours associés, récupérer leurs statistiques
    if (responseData.concours && responseData.concours.length > 0) {
      // Récupérer les statistiques pour chaque concours
      const concoursIds = responseData.concours.map((c) => c._id)
      const concoursStats = await ConcoursStats.find({ concoursId: { $in: concoursIds } })

      // Créer un map des statistiques par ID de concours pour un accès facile
      const statsMap = {}
      concoursStats.forEach((stat) => {
        statsMap[stat.concoursId.toString()] = {
          averageRating: stat.averageRating || 0,
          numRatings: stat.ratings?.length || 0,
        }
      })

      // Ajouter les statistiques à chaque concours
      responseData.concours = responseData.concours.map((concours) => {
        const stats = statsMap[concours._id.toString()] || { averageRating: 0, numRatings: 0 }
        return {
          ...concours,
          averageRating: stats.averageRating,
          numRatings: stats.numRatings,
        }
      })
    }

    res.json(responseData)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'établissement:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération de l'établissement: " + error.message)
  }
})

// @desc    Update an establishment
// @route   PUT /api/establishments/:id
// @access  Private/Admin
const updateEstablishment = asyncHandler(async (req, res) => {
  console.log("Mise à jour de l'établissement ID:", req.params.id)
  console.log("Données de mise à jour:", req.body)

  const validationErrors = validateEstablishmentData(req.body)
  if (Object.keys(validationErrors).length > 0) {
    res.status(400)
    throw new Error(JSON.stringify(validationErrors))
  }

  // Ensure socialMedia is properly formatted
  if (req.body.socialMedia && typeof req.body.socialMedia === "string") {
    try {
      req.body.socialMedia = JSON.parse(req.body.socialMedia)
    } catch (error) {
      res.status(400)
      throw new Error("Invalid socialMedia format")
    }
  }

  // Find the establishment by ID
  const establishment = await Establishment.findById(req.params.id)

  if (!establishment) {
    res.status(404)
    throw new Error("Établissement non trouvé")
  }

  // Create a copy of the request body and remove _id to prevent conflicts
  const updateData = { ...req.body }
  if (updateData._id) {
    delete updateData._id
  }

  // Update the establishment with the new data
  Object.keys(updateData).forEach((key) => {
    establishment[key] = updateData[key]
  })

  try {
    const updatedEstablishment = await establishment.save()
    res.json(updatedEstablishment)
  } catch (error) {
    console.error("Error updating establishment:", error)
    res.status(400)
    throw new Error(error.message)
  }
})

// @desc    Delete an establishment
// @route   DELETE /api/establishments/:id
// @access  Private/Admin
const deleteEstablishment = asyncHandler(async (req, res) => {
  const establishment = await Establishment.findById(req.params.id)

  if (establishment) {
    await establishment.deleteOne() // Using deleteOne instead of remove which is deprecated
    res.json({ message: "Établissement supprimé" })
  } else {
    res.status(404)
    throw new Error("Établissement non trouvé")
  }
})

// @desc    Rate an establishment
// @route   POST /api/establishments/:id/ratings
// @access  Private
const rateEstablishment = asyncHandler(async (req, res) => {
  console.log("Utilisateur authentifié:", req.user._id, "Type:", req.user.type)
  console.log("POST /api/establishments/:id/rate", req.body)

  const { teaching, employability, network } = req.body
  const establishment = await Establishment.findById(req.params.id)

  if (!establishment) {
    res.status(404)
    throw new Error("Établissement non trouvé")
  }

  // Récupérer les informations complètes de l'utilisateur
  const user = await User.findById(req.user._id)

  // Initialize ratings array if it doesn't exist
  if (!establishment.ratings) {
    establishment.ratings = []
  }

  // Vérifier si l'utilisateur a déjà noté cet établissement
  const existingRatingIndex = establishment.ratings.findIndex(
    (r) => r.user && r.user.toString() === req.user._id.toString(),
  )

  if (existingRatingIndex !== -1) {
    // Mettre à jour la note existante
    establishment.ratings[existingRatingIndex].teaching = teaching
    establishment.ratings[existingRatingIndex].employability = employability
    establishment.ratings[existingRatingIndex].network = network
  } else {
    // Ajouter une nouvelle note
    const rating = {
      user: req.user._id,
      teaching,
      employability,
      network,
    }
    establishment.ratings.push(rating)
  }

  establishment.numRatings = establishment.ratings.length

  // Calculate average ratings
  const calculateAverage = (category) => {
    return establishment.ratings.reduce((acc, item) => acc + item[category], 0) / establishment.ratings.length
  }

  establishment.averageRatings = {
    teaching: calculateAverage("teaching"),
    employability: calculateAverage("employability"),
    network: calculateAverage("network"),
  }

  // Calculer la note globale
  const values = [
    establishment.averageRatings.teaching,
    establishment.averageRatings.employability,
    establishment.averageRatings.network,
  ]
  const overall = values.reduce((sum, val) => sum + val, 0) / values.length

  await establishment.save()

  res.status(201).json({
    message: "Évaluation ajoutée avec succès",
    averageRatings: {
      ...establishment.averageRatings,
      overall,
    },
    numRatings: establishment.numRatings,
    userId: req.user._id,
    userName: user ? user.name : "Utilisateur",
    userFirstName: user ? user.firstName : "",
    userLastName: user ? user.lastName : "",
  })
})

export {
  getEstablishments,
  getEstablishmentById,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  rateEstablishment,
}
