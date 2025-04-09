import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import Business from "../models/Business.js"
import Formation from "../models/Formation.js"
import Document from "../models/Document.js"
import Inscription from "../models/Inscription.js"
import Establishment from "../models/Establishment.js"
import Resource from "../models/Resource.js"
import Concours from "../models/Concours.js"

// @desc    Créer un utilisateur admin
// @route   POST /api/superadmin/create-admin
// @access  Private/SuperAdmin
export const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error("Cet utilisateur existe déjà")
  }

  // Créer l'utilisateur admin
  const user = await User.create({
    name,
    email,
    password,
    role: "admin",
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } else {
    res.status(400)
    throw new Error("Données utilisateur invalides")
  }
})

// @desc    Obtenir les statistiques du site
// @route   GET /api/superadmin/stats
// @access  Private/Admin
export const getStats = asyncHandler(async (req, res) => {
  // Compter les utilisateurs
  const userCount = await User.countDocuments()

  // Compter les entreprises
  const businessCount = await Business.countDocuments()

  // Compter les formations
  const formationCount = await Formation.countDocuments()

  // Compter les documents
  const documentCount = await Document.countDocuments()

  // Compter les inscriptions
  const inscriptionCount = await Inscription.countDocuments()

  res.json({
    users: userCount,
    businesses: businessCount,
    formations: formationCount,
    documents: documentCount,
    inscriptions: inscriptionCount,
  })
})

// @desc    Obtenir toutes les formations (admin)
// @route   GET /api/superadmin/formations
// @access  Private/Admin
export const getAdminFormations = asyncHandler(async (req, res) => {
  const formations = await Formation.find({}).populate("business", "structureName email").sort({ createdAt: -1 })

  res.json(formations)
})

// @desc    Obtenir toutes les entreprises (admin)
// @route   GET /api/superadmin/businesses
// @access  Private/Admin
export const getBusinesses = asyncHandler(async (req, res) => {
  const businesses = await Business.find({}).select("-password")

  res.json(businesses)
})

// @desc    Obtenir une entreprise par ID (admin)
// @route   GET /api/superadmin/businesses/:id
// @access  Private/Admin
export const getBusinessById = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id).select("-password")

  if (business) {
    res.json(business)
  } else {
    res.status(404)
    throw new Error("Entreprise non trouvée")
  }
})

// @desc    Supprimer une entreprise (admin)
// @route   DELETE /api/superadmin/businesses/:id
// @access  Private/Admin
export const deleteBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id)

  if (business) {
    await business.deleteOne()
    res.json({ message: "Entreprise supprimée" })
  } else {
    res.status(404)
    throw new Error("Entreprise non trouvée")
  }
})

// @desc    Obtenir toutes les inscriptions (admin)
// @route   GET /api/superadmin/inscriptions
// @access  Private/Admin
export const getAdminInscriptions = asyncHandler(async (req, res) => {
  const inscriptions = await Inscription.find({})
    .populate("user", "name email")
    .populate("formation", "title")
    .populate("business", "structureName")
    .sort({ createdAt: -1 })

  res.json(inscriptions)
})

// @desc    Mettre à jour le statut d'une inscription (admin)
// @route   PUT /api/admin/inscriptions/:id/status
// @access  Private/Admin
export const updateInscriptionStatus = asyncHandler(async (req, res) => {
  try {
    const { status, paymentStatus } = req.body
    console.log("Données reçues pour mise à jour:", req.body)

    // Récupérer l'inscription existante
    const inscription = await Inscription.findById(req.params.id)

    if (!inscription) {
      res.status(404)
      throw new Error("Inscription non trouvée")
    }

    // Créer un objet de mise à jour avec les champs existants
    const updateData = {}

    // Mettre à jour le statut uniquement s'il est fourni
    if (status !== undefined) {
      updateData.status = status

      // Si le statut est "confirmed", enregistrer la date de confirmation
      if (status === "confirmed" && !inscription.confirmedAt) {
        updateData.confirmedAt = Date.now()
      }
    }

    // Mettre à jour le statut de paiement uniquement s'il est fourni
    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus

      // Si le statut de paiement est "paid", enregistrer la date de paiement
      if (paymentStatus === "paid" && !inscription.paidAt) {
        updateData.paidAt = Date.now()
      }
    }

    console.log("Données de mise à jour:", updateData)

    // Utiliser findByIdAndUpdate avec { new: true } pour obtenir le document mis à jour
    const updatedInscription = await Inscription.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })

    console.log("Inscription mise à jour avec succès:", updatedInscription)

    res.json(updatedInscription)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error)
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut",
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    })
  }
})
// Concours Admin Functions
export const getAdminConcours = asyncHandler(async (req, res) => {
  const concours = await Concours.find({}).sort({ createdAt: -1 })
  res.json(concours)
})

// Establishment Admin Functions
export const getAdminEstablishments = asyncHandler(async (req, res) => {
  const establishments = await Establishment.find({}).sort({ createdAt: -1 })
  res.json(establishments)
})

// Resource Admin Functions
export const getAdminResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({}).sort({ createdAt: -1 })
  res.json(resources)
})





// @desc    Supprimer une inscription (admin)
// @route   DELETE /api/superadmin/inscriptions/:id
// @access  Private/Admin
export const deleteInscription = asyncHandler(async (req, res) => {
  const inscription = await Inscription.findById(req.params.id)

  if (inscription) {
    await inscription.deleteOne()
    res.json({ message: "Inscription supprimée" })
  } else {
    res.status(404)
    throw new Error("Inscription non trouvée")
  }
})

