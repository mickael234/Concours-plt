import asyncHandler from "express-async-handler"
import Formation from "../models/Formation.js"
import Inscription from "../models/Inscription.js"
import User from "../models/User.js"

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
    const formation = await Formation.findById(req.params.id)
      .populate("business", "structureName name logo description")
      .populate("concours", "title")
      .populate("ratings.user", "name firstName lastName") // Ajouter cette ligne pour récupérer les infos utilisateur

    if (!formation) {
      res.status(404)
      throw new Error("Formation non trouvée")
    }

    // Incrémenter le compteur de vues
    formation.views = (formation.views || 0) + 1
    await formation.save()

    res.json(formation)
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération de la formation: " + error.message)
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
  const { rating, comment } = req.body
  const formation = await Formation.findById(req.params.id)

  if (!formation) {
    res.status(404)
    throw new Error("Formation non trouvée")
  }

  // Récupérer les informations complètes de l'utilisateur
  const user = await User.findById(req.user._id)

  // Vérifier si l'utilisateur a déjà noté cette formation
  const alreadyRated = formation.ratings.find((r) => r.user && r.user.toString() === req.user._id.toString())

  if (alreadyRated) {
    // Mettre à jour la note existante
    alreadyRated.rating = rating
    alreadyRated.comment = comment
  } else {
    // Ajouter une nouvelle note
    formation.ratings.push({
      user: req.user._id,
      rating,
      comment,
      createdAt: Date.now(),
    })
  }

  // Mettre à jour le nombre d'avis et la note moyenne
  formation.numReviews = formation.ratings.length
  formation.rating = formation.ratings.reduce((acc, item) => item.rating + acc, 0) / formation.ratings.length

  await formation.save()

  res.status(201).json({
    message: "Avis ajouté avec succès",
    rating: formation.rating,
    numReviews: formation.numReviews,
    userId: req.user._id,
    userName: user ? user.name : "Utilisateur",
    userFirstName: user ? user.firstName : "",
    userLastName: user ? user.lastName : "",
  })
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
    // Récupérer toutes les formations
    const formations = await Formation.find({})
      .populate("business", "structureName logo")
      .populate("concours", "title")
      .sort({ createdAt: -1 })

    // Récupérer le nombre d'inscriptions pour chaque formation
    const formationsWithInscriptions = await Promise.all(
      formations.map(async (formation) => {
        // Compter les inscriptions pour cette formation
        const inscriptionsCount = await Inscription.countDocuments({ formation: formation._id })

        // Créer un nouvel objet avec toutes les propriétés de la formation
        const formationObj = formation.toObject()

        // Ajouter le nombre d'inscriptions
        formationObj.inscriptionsCount = inscriptionsCount

        return formationObj
      }),
    )

    res.json(formationsWithInscriptions)
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
      type: "formation", // Ajout explicite du type
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

    // Incrémenter le compteur d'inscriptions dans la formation
    await Formation.findByIdAndUpdate(formation._id, { $inc: { inscriptionsCount: 1 } })

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

