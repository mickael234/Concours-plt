import asyncHandler from "express-async-handler"
import Business from "../models/Business.js"
import generateToken from "../utils/generateToken.js"
import Inscription from "../models/Inscription.js"
import Document from "../models/Document.js"
import Formation from "../models/Formation.js"
import crypto from "crypto"

// @desc    Authentifier une entreprise et obtenir un token
// @route   POST /api/business/login
// @access  Public
const loginBusiness = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const business = await Business.findOne({ email })

  if (business && (await business.matchPassword(password))) {
    res.json({
      _id: business._id,
      name: business.name,
      email: business.email,
      token: generateToken(business._id, "business"),
    })
  } else {
    res.status(401)
    throw new Error("Email ou mot de passe invalide")
  }
})

// @desc    Enregistrer une nouvelle entreprise
// @route   POST /api/business/register
// @access  Public
const registerBusiness = asyncHandler(async (req, res) => {
  const { structureName, email, password, activities, firstName, lastName, birthDate } = req.body

  // Vérifier si l'entreprise existe déjà
  const businessExists = await Business.findOne({ email })

  if (businessExists) {
    res.status(400)
    throw new Error("Cette entreprise existe déjà")
  }

  // Créer une nouvelle entreprise
  const business = await Business.create({
    name: structureName, // Utiliser structureName comme name
    structureName,
    email,
    password,
    activities,
    firstName,
    lastName,
    birthDate,
  })

  if (business) {
    // Générer un token JWT
    const token = generateToken(business._id)

    res.status(201).json({
      _id: business._id,
      name: business.name,
      structureName: business.structureName,
      email: business.email,
      logo: business.logo,
      isVerified: business.isVerified,
      isActive: business.isActive,
      activities: business.activities,
      firstName: business.firstName,
      lastName: business.lastName,
      birthDate: business.birthDate,
      token,
    })
  } else {
    res.status(400)
    throw new Error("Données d'entreprise invalides")
  }
})

// Modifier la fonction updateBusinessProfile pour gérer structureName
const updateBusinessProfile = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.business._id)

  if (business) {
    // Mapper structureName à name si fourni
    if (req.body.structureName) {
      req.body.name = req.body.structureName
    }

    // Mettre à jour les champs
    business.name = req.body.name || business.name
    business.structureName = req.body.structureName || business.structureName
    business.email = req.body.email || business.email
    business.logo = req.body.logo || business.logo
    business.presentation = req.body.presentation || business.presentation
    business.website = req.body.website || business.website
    business.phone = req.body.phone || business.phone
    business.address = req.body.address || business.address

    // Mettre à jour les réseaux sociaux si fournis
    if (req.body.socialMedia) {
      business.socialMedia = {
        ...business.socialMedia,
        ...(typeof req.body.socialMedia === "string" ? JSON.parse(req.body.socialMedia) : req.body.socialMedia),
      }
    }

    // Mettre à jour les activités si fournies
    if (req.body.activities) {
      business.activities = req.body.activities
    }

    // Mettre à jour les informations personnelles si fournies
    business.firstName = req.body.firstName || business.firstName
    business.lastName = req.body.lastName || business.lastName
    business.birthDate = req.body.birthDate || business.birthDate

    // Si un nouveau mot de passe est fourni, le mettre à jour
    if (req.body.password) {
      business.password = req.body.password
    }

    const updatedBusiness = await business.save()

    res.json({
      _id: updatedBusiness._id,
      name: updatedBusiness.name,
      structureName: updatedBusiness.structureName,
      email: updatedBusiness.email,
      logo: updatedBusiness.logo,
      presentation: updatedBusiness.presentation,
      website: updatedBusiness.website,
      phone: updatedBusiness.phone,
      address: updatedBusiness.address,
      socialMedia: updatedBusiness.socialMedia,
      activities: updatedBusiness.activities,
      isVerified: updatedBusiness.isVerified,
      isActive: updatedBusiness.isActive,
      firstName: updatedBusiness.firstName,
      lastName: updatedBusiness.lastName,
      birthDate: updatedBusiness.birthDate,
    })
  } else {
    res.status(404)
    throw new Error("Entreprise non trouvée")
  }
})

// @desc    Obtenir le profil d'une entreprise
// @route   GET /api/business/profile
// @access  Private/Business
const getBusinessProfile = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.business._id)

  if (business) {
    res.json({
      _id: business._id,
      name: business.name,
      email: business.email,
      description: business.description,
      address: business.address,
      phone: business.phone,
      website: business.website,
      logo: business.logo,
      firstName: business.firstName,
      lastName: business.lastName,
      birthDate: business.birthDate,
      socialMedia: business.socialMedia || {
        facebook: "",
        instagram: "",
        linkedin: "",
        whatsapp: "",
      },
      structureName: business.structureName || business.name,
      presentation: business.presentation || "",
    })
  } else {
    res.status(404)
    throw new Error("Entreprise non trouvée")
  }
})

// @desc    Mettre à jour le profil d'une entreprise
// @route   PUT /api/business/profile
// @access  Private/Business
const updateProfile = async (req, res) => {
  try {
    console.log("Données reçues pour mise à jour:", req.body)

    // Vérifier si le business existe
    const business = await Business.findById(req.business.id)
    if (!business) {
      return res.status(404).json({ message: "Business non trouvé" })
    }

    // Vérifier si le nom est fourni et non vide
    // Modification: Vérifier uniquement si structureName est présent dans req.body
    if (req.body.hasOwnProperty("structureName") && (!req.body.structureName || req.body.structureName.trim() === "")) {
      return res.status(400).json({ message: "Le nom de l'entreprise est requis" })
    }

    // Préparer les données à mettre à jour
    const updateData = { ...req.body }

    // Traiter le logo s'il est fourni
    if (req.file) {
      updateData.logo = req.file.path
    }

    // Mettre à jour le profil
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.business.id,
      { $set: updateData },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      business: updatedBusiness,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil", error: error.message })
  }
}

// @desc    Obtenir les documents d'une entreprise
// @route   GET /api/business/documents
// @access  Private/Business
const getBusinessDocuments = asyncHandler(async (req, res) => {
  try {
    const documents = await Document.find({ business: req.business._id }).sort({ createdAt: -1 })
    res.json(documents)
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des documents")
  }
})

// @desc    Obtenir les formations d'une entreprise
// @route   GET /api/business/formations
// @access  Private/Business
const getBusinessFormations = asyncHandler(async (req, res) => {
  try {
    const formations = await Formation.find({ business: req.business._id }).sort({ createdAt: -1 })
    res.json(formations)
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des formations")
  }
})

// @desc    Obtenir les inscriptions d'une entreprise
// @route   GET /api/business/inscriptions
// @access  Private/Business
const getBusinessInscriptions = asyncHandler(async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ business: req.business._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("formation", "title")

    res.json(inscriptions)
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des inscriptions")
  }
})

// @desc    Obtenir toutes les entreprises
// @route   GET /api/admin/businesses
// @access  Private/Admin
const getBusinesses = asyncHandler(async (req, res) => {
  try {
    // Récupérer toutes les entreprises avec leurs formations et documents
    const businesses = await Business.find({})
      .select("-password")
      .populate({
        path: "formations",
        select: "title startDate endDate price",
      })
      .populate({
        path: "documents",
        select: "title fileUrl",
      })

    // Pour chaque entreprise, ajouter les compteurs
    const businessesWithCounts = businesses.map((business) => {
      const businessObj = business.toObject()
      businessObj.formationsCount = business.formations ? business.formations.length : 0
      businessObj.documentsCount = business.documents ? business.documents.length : 0
      return businessObj
    })

    res.json(businessesWithCounts)
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des entreprises: " + error.message)
  }
})

// @desc    Obtenir une entreprise par ID
// @route   GET /api/admin/businesses/:id
// @access  Private/Admin
const getBusinessById = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id).select("-password")

  if (business) {
    res.json(business)
  } else {
    res.status(404)
    throw new Error("Entreprise non trouvée")
  }
})

// @desc    Approuver une entreprise
// @route   PUT /api/admin/businesses/:id/approve
// @access  Private/Admin
const approveBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id)

  if (business) {
    business.isApproved = true
    await business.save()
    res.json({ message: "Entreprise approuvée avec succès" })
  } else {
    res.status(404)
    throw new Error("Entreprise non trouvée")
  }
})

// @desc    Supprimer une entreprise
// @route   DELETE /api/admin/businesses/:id
// @access  Private/Admin
const deleteBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id)

  if (business) {
    await business.deleteOne()
    res.json({ message: "Entreprise supprimée" })
  } else {
    res.status(404)
    throw new Error("Entreprise non trouvée")
  }
})

// @desc    Mettre à jour le mot de passe d'une entreprise
// @route   PUT /api/business/profile/password
// @access  Private/Business
const updateBusinessPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    res.status(400)
    throw new Error("Veuillez fournir le mot de passe actuel et le nouveau mot de passe")
  }

  const business = await Business.findById(req.business._id)

  if (!business) {
    res.status(404)
    throw new Error("Entreprise non trouvée")
  }

  // Vérifier si le mot de passe actuel est correct
  const isMatch = await business.matchPassword(currentPassword)

  if (!isMatch) {
    res.status(401)
    throw new Error("Mot de passe actuel incorrect")
  }

  // Mettre à jour le mot de passe
  business.password = newPassword
  await business.save()

  res.json({ message: "Mot de passe mis à jour avec succès" })
})

// @desc    Demander une réinitialisation de mot de passe
// @route   POST /api/business/password-reset-request
// @access  Public
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body

  const business = await Business.findOne({ email })

  if (!business) {
    res.status(404)
    throw new Error("Aucune entreprise trouvée avec cette adresse email")
  }

  // Générer un token de réinitialisation
  const resetToken = crypto.randomBytes(20).toString("hex")
  business.resetPasswordToken = resetToken
  business.resetPasswordExpires = Date.now() + 3600000 // 1 heure
  await business.save()

  // Ici, vous enverriez normalement un email avec le token
  res.json({
    message: "Un email de réinitialisation a été envoyé à votre adresse email",
    resetToken, // En production, ne pas retourner ceci
  })
})


// @desc    Réinitialiser le mot de passe
// @route   POST /api/business/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body

  const business = await Business.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!business) {
    res.status(400)
    throw new Error("Token de réinitialisation invalide ou expiré")
  }

  business.password = newPassword
  business.resetPasswordToken = undefined
  business.resetPasswordExpires = undefined
  await business.save()

  res.json({ message: "Mot de passe réinitialisé avec succès" })
})


export {
  loginBusiness,
  registerBusiness,
  getBusinessProfile,
  updateBusinessProfile,
  updateProfile,
  getBusinessDocuments,
  getBusinessFormations,
  getBusinessInscriptions,
  updateBusinessPassword,
  requestPasswordReset,
  resetPassword,
  getBusinesses,
  getBusinessById,
  approveBusiness,
  deleteBusiness,
}

