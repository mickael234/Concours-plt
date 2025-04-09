import asyncHandler from "express-async-handler"
import Concours from "../../models/Concours.js"
import Application from "../../models/Application.js"

// @desc    Obtenir toutes les candidatures d'un utilisateur
// @route   GET /api/user/applications
// @access  Private
const getUserApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ user: req.user._id }).populate("concours").sort({ createdAt: -1 })

  res.json(applications)
})

// @desc    Créer une nouvelle candidature
// @route   POST /api/user/applications
// @access  Private
const createApplication = asyncHandler(async (req, res) => {
  const { concoursId, documents } = req.body

  if (!concoursId) {
    res.status(400)
    throw new Error("ID du concours requis")
  }

  const concours = await Concours.findById(concoursId)

  if (!concours) {
    res.status(404)
    throw new Error("Concours non trouvé")
  }

  // Vérifier si l'utilisateur a déjà candidaté
  const applicationExists = await Application.findOne({
    user: req.user._id,
    concours: concoursId,
  })

  if (applicationExists) {
    res.status(400)
    throw new Error("Vous avez déjà candidaté à ce concours")
  }

  // Créer la candidature
  const application = await Application.create({
    user: req.user._id,
    concours: concoursId,
    documents: documents || [],
    status: "pending",
  })

  if (application) {
    res.status(201).json({
      message: "Candidature créée avec succès",
      application: {
        ...application._doc,
        concours: concours,
      },
    })
  } else {
    res.status(400)
    throw new Error("Données de candidature invalides")
  }
})

// @desc    Obtenir les détails d'une candidature
// @route   GET /api/user/applications/:id
// @access  Private
const getApplicationDetails = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate("concours")
    .populate("documents")

  if (application) {
    res.json(application)
  } else {
    res.status(404)
    throw new Error("Candidature non trouvée")
  }
})

// @desc    Mettre à jour une candidature
// @route   PUT /api/user/applications/:id
// @access  Private
const updateApplication = asyncHandler(async (req, res) => {
  const { documents } = req.body

  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!application) {
    res.status(404)
    throw new Error("Candidature non trouvée")
  }

  // Vérifier si la candidature peut être mise à jour
  if (application.status !== "pending") {
    res.status(400)
    throw new Error("Impossible de mettre à jour une candidature qui n'est pas en attente")
  }

  if (documents) {
    application.documents = documents
  }

  const updatedApplication = await application.save()

  res.json({
    message: "Candidature mise à jour avec succès",
    application: updatedApplication,
  })
})

// @desc    Annuler une candidature
// @route   DELETE /api/user/applications/:id
// @access  Private
const cancelApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!application) {
    res.status(404)
    throw new Error("Candidature non trouvée")
  }

  // Vérifier si la candidature peut être annulée
  if (application.status !== "pending") {
    res.status(400)
    throw new Error("Impossible d'annuler une candidature qui n'est pas en attente")
  }

  application.status = "cancelled"
  await application.save()

  res.json({ message: "Candidature annulée avec succès" })
})

export { getUserApplications, createApplication, getApplicationDetails, updateApplication, cancelApplication }

