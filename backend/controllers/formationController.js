import asyncHandler from "express-async-handler"
import Formation from "../models/Formation.js"
import Inscription from "../models/Inscription.js"

// @desc    Récupérer toutes les formations
// @route   GET /api/formations
// @access  Public
const getFormations = asyncHandler(async (req, res) => {
  try {
    const formations = await Formation.find({ isPublic: true })
      .populate("business", "structureName logo")
      .populate("concours", "title")
      .sort({ createdAt: -1 })

    res.json(formations)
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des formations")
  }
})

// @desc    Récupérer une formation par ID
// @route   GET /api/formations/:id
// @access  Public
const getFormationById = asyncHandler(async (req, res) => {
  try {
    // Vérifier si l'ID est "business" et rediriger vers getBusinessFormations
    if (req.params.id === "business") {
      return getBusinessFormations(req, res)
    }

    const formation = await Formation.findById(req.params.id)
      .populate("business", "structureName logo")
      .populate("concours", "title")

    if (formation) {
      res.json(formation)
    } else {
      res.status(404)
      throw new Error("Formation non trouvée")
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation:", error)
    res.status(error.kind === "ObjectId" ? 404 : 500)
    throw new Error("Erreur lors de la récupération de la formation")
  }
})

// @desc    Créer une nouvelle formation
// @route   POST /api/formations
// @access  Private/Business
const createFormation = asyncHandler(async (req, res) => {
  try {
    console.log("Requête reçue pour créer une formation:", req.body)

    const {
      title,
      description,
      type,
      price,
      startDate,
      endDate,
      level,
      places,
      onlinePlatform,
      location,
      additionalComment,
      hasMultipleMonths,
      concours,
    } = req.body

    // Vérifier les champs obligatoires
    if (!title || !type || !startDate || !endDate) {
      res.status(400)
      throw new Error("Veuillez remplir tous les champs obligatoires")
    }

    // Calculer la durée en jours entre la date de début et la date de fin
    const start = new Date(startDate)
    const end = new Date(endDate)
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1

    // Créer une nouvelle formation
    const formation = new Formation({
      title,
      description: description || "",
      type: type, // Assurez-vous que ce champ est bien défini
      price: Number(price) || 0,
      startDate: start,
      endDate: end,
      duration: durationInDays, // Utiliser une valeur numérique pour la durée
      level: level || "all",
      places: Number(places) || 0,
      onlinePlatform: onlinePlatform || "",
      location: location || "",
      additionalComment: additionalComment || "",
      hasMultipleMonths: hasMultipleMonths === "true" || hasMultipleMonths === true,
      business: req.business._id,
      concours: concours ? JSON.parse(concours) : [],
    })

    // Ajouter l'image si elle existe
    if (req.file) {
      formation.image = req.file.path
    }

    console.log("Formation à créer:", formation)

    const createdFormation = await formation.save()
    console.log("Formation créée avec succès:", createdFormation._id)

    res.status(201).json(createdFormation)
  } catch (error) {
    console.error("Erreur lors de la création de la formation:", error)
    res.status(500)
    throw new Error("Erreur lors de la création de la formation: " + error.message)
  }
})


// @desc    Mettre à jour une formation
// @route   PUT /api/formations/:id
// @access  Private/Business
const updateFormation = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      duration,
      startDate,
      endDate,
      location,
      maxParticipants,
      isOnline,
      isPublic,
      concours,
    } = req.body

    const formation = await Formation.findById(req.params.id)

    if (!formation) {
      res.status(404)
      throw new Error("Formation non trouvée")
    }

    // Vérifier si l'entreprise est propriétaire de la formation
    if (formation.business.toString() !== req.business._id.toString()) {
      res.status(403)
      throw new Error("Non autorisé, vous n'êtes pas le propriétaire de cette formation")
    }

    // Mettre à jour les champs
    formation.title = title || formation.title
    formation.description = description || formation.description
    formation.price = price !== undefined ? price : formation.price
    formation.duration = duration || formation.duration
    formation.startDate = startDate || formation.startDate
    formation.endDate = endDate || formation.endDate
    formation.location = location || formation.location
    formation.maxParticipants = maxParticipants !== undefined ? maxParticipants : formation.maxParticipants
    formation.isOnline = isOnline === "true" || isOnline === true || isOnline === undefined ? formation.isOnline : false
    formation.isPublic = isPublic === "true" || isPublic === true || isPublic === undefined ? formation.isPublic : false
    formation.concours = concours ? JSON.parse(concours) : formation.concours

    // Mettre à jour l'image si une nouvelle a été téléchargée
    if (req.file) {
      formation.image = req.file.path
    }

    const updatedFormation = await formation.save()
    res.json(updatedFormation)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la formation:", error)
    res.status(500)
    throw new Error("Erreur lors de la mise à jour de la formation: " + error.message)
  }
})

// @desc    Supprimer une formation
// @route   DELETE /api/formations/:id
// @access  Private/Business or Admin
const deleteFormation = asyncHandler(async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id)

    if (!formation) {
      res.status(404)
      throw new Error("Formation non trouvée")
    }

    // Vérifier si l'utilisateur est admin ou si l'entreprise est propriétaire de la formation
    const isOwner = req.business && formation.business.toString() === req.business._id.toString()
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin" || req.user.role === "superadmin")

    if (!isOwner && !isAdmin) {
      res.status(403)
      throw new Error("Non autorisé, vous n'êtes pas le propriétaire de cette formation ou un administrateur")
    }

    await formation.deleteOne()
    res.json({ message: "Formation supprimée" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la formation:", error)
    res.status(500)
    throw new Error("Erreur lors de la suppression de la formation: " + error.message)
  }
})

// @desc    Noter une formation
// @route   POST /api/formations/:id/rate
// @access  Private
const rateFormation = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body

    if (!rating) {
      res.status(400)
      throw new Error("La note est requise")
    }

    // Vérifier que la note est entre 1 et 5
    if (rating < 1 || rating > 5) {
      res.status(400)
      throw new Error("La note doit être comprise entre 1 et 5")
    }

    const formation = await Formation.findById(req.params.id)

    if (!formation) {
      res.status(404)
      throw new Error("Formation non trouvée")
    }

    // Vérifier si l'utilisateur a déjà noté cette formation
    const alreadyRated = formation.ratings.find((r) => r.user && r.user.toString() === req.user._id.toString())

    if (alreadyRated) {
      // Mettre à jour la note existante
      alreadyRated.rating = Number(rating)
      alreadyRated.comment = comment || alreadyRated.comment
      alreadyRated.createdAt = Date.now()
    } else {
      // Ajouter une nouvelle note
      formation.ratings.push({
        user: req.user._id,
        rating: Number(rating),
        comment: comment || "",
        createdAt: Date.now(),
      })
    }

    // Recalculer la note moyenne
    formation.numReviews = formation.ratings.length
    formation.rating = formation.ratings.reduce((acc, item) => item.rating + acc, 0) / formation.ratings.length

    await formation.save()
    res.status(201).json({
      message: "Avis ajouté avec succès",
      rating: formation.rating,
      numReviews: formation.numReviews,
    })
  } catch (error) {
    console.error("Erreur lors de la notation de la formation:", error)
    res.status(error.statusCode || 500)
    throw new Error(error.message || "Erreur lors de la notation de la formation")
  }
})

// @desc    Récupérer les formations d'une entreprise
// @route   GET /api/formations/business/formations
// @access  Private/Business
const getBusinessFormations = asyncHandler(async (req, res) => {
  try {
    // Vérifier si l'entreprise est connectée
    if (!req.business) {
      res.status(401)
      throw new Error("Non autorisé, veuillez vous connecter en tant qu'entreprise")
    }

    const formations = await Formation.find({ business: req.business._id })
      .populate("concours", "title")
      .sort({ createdAt: -1 })

    res.json(formations)
  } catch (error) {
    console.error("Erreur lors de la récupération des formations de l'entreprise:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des formations de l'entreprise: " + error.message)
  }
})

// @desc    Récupérer toutes les formations pour l'admin
// @route   GET /api/formations/admin/formations
// @access  Private/Admin
const getAdminFormations = asyncHandler(async (req, res) => {
  try {
    const formations = await Formation.find({})
      .populate("business", "structureName logo")
      .populate("concours", "title")
      .sort({ createdAt: -1 })

    res.json(formations)
  } catch (error) {
    console.error("Erreur lors de la récupération des formations admin:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des formations admin: " + error.message)
  }
})

// @desc    S'inscrire à une formation
// @route   POST /api/formations/:id/inscriptions
// @access  Private
const registerForFormation = asyncHandler(async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id)

    if (!formation) {
      res.status(404)
      throw new Error("Formation non trouvée")
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const existingInscription = await Inscription.findOne({
      user: req.user._id,
      formation: formation._id,
    })

    if (existingInscription) {
      res.status(400)
      throw new Error("Vous êtes déjà inscrit à cette formation")
    }

    // Vérifier s'il reste des places disponibles
    if (
      formation.maxParticipants > 0 &&
      formation.inscriptions &&
      formation.inscriptions.length >= formation.maxParticipants
    ) {
      res.status(400)
      throw new Error("Il n'y a plus de places disponibles pour cette formation")
    }

    // Créer l'inscription
    const inscription = new Inscription({
      user: req.user._id,
      formation: formation._id,
      business: formation.business,
      status: "pending",
      paymentStatus: "pending",
      amount: formation.price || 0,
      firstName: req.body.firstName || req.user.firstName || req.user.name,
      lastName: req.body.lastName || req.user.lastName,
      email: req.body.email || req.user.email,
      phone: req.body.phone || req.user.phone,
      paymentMethod: req.body.paymentMethod || "mobile_money",
    })

    const createdInscription = await inscription.save()

    // Ajouter l'inscription à la formation
    if (!formation.inscriptions) {
      formation.inscriptions = []
    }
    formation.inscriptions.push(createdInscription._id)
    await formation.save()

    res.status(201).json(createdInscription)
  } catch (error) {
    console.error("Erreur lors de l'inscription à la formation:", error)
    res.status(error.statusCode || 500)
    throw new Error(error.message || "Erreur lors de l'inscription à la formation")
  }
})

export {
  getFormations,
  getFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
  rateFormation,
  getBusinessFormations,
  getAdminFormations,
  registerForFormation,
}

