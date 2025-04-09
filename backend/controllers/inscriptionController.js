import asyncHandler from "express-async-handler"
import Inscription from "../models/Inscription.js"
import Formation from "../models/Formation.js"
import Concours from "../models/Concours.js"

// @desc    Créer une nouvelle inscription
// @route   POST /api/inscriptions
// @access  Private
const createInscription = asyncHandler(async (req, res) => {
  const { formationId, concoursId, motivation, selectedMonths } = req.body
  let formationData,
    concoursData,
    businessId,
    amount = 0

  // Vérifier si c'est une inscription à une formation
  if (formationId) {
    formationData = await Formation.findById(formationId)
    if (!formationData) {
      res.status(404)
      throw new Error("Formation non trouvée")
    }
    businessId = formationData.business
    amount = formationData.price || 0
  }

  // Vérifier si c'est une inscription à un concours
  if (concoursId) {
    concoursData = await Concours.findById(concoursId)
    if (!concoursData) {
      res.status(404)
      throw new Error("Concours non trouvé")
    }
    businessId = concoursData.business
    amount = concoursData.price || 0
  }

  // Vérifier si l'utilisateur est déjà inscrit
  const existingInscription = await Inscription.findOne({
    user: req.user._id,
    $or: [{ formation: formationId }, { concours: concoursId }],
  })

  if (existingInscription) {
    res.status(400)
    throw new Error("Vous êtes déjà inscrit")
  }

  // Créer l'inscription
  const inscription = new Inscription({
    user: req.user._id,
    formation: formationId || null,
    concours: concoursId || null,
    business: businessId,
    type: formationId ? "formation" : "concours",
    motivation,
    selectedMonths,
    status: "pending",
    amount: amount, // Définir explicitement le montant
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phone: req.user.phone,
  })

  console.log("Création d'une inscription avec montant:", amount, "FCFA")

  const createdInscription = await inscription.save()
  res.status(201).json(createdInscription)
})

// @desc    Obtenir une inscription par ID
// @route   GET /api/inscriptions/:id
// @access  Private/Admin/Business
const getInscriptionById = asyncHandler(async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id)
      .populate("user", "name email firstName lastName")
      .populate({
        path: "formation",
        select: "title price business",
        populate: {
          path: "business",
          select: "name structureName",
        },
      })
      .populate("business", "name structureName")

    if (inscription) {
      // Vérifier si l'utilisateur est autorisé à voir cette inscription
      const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin" || req.user.role === "superadmin")
      const isOwner = req.user && inscription.user._id.toString() === req.user._id.toString()
      const isBusiness = req.business && inscription.business._id.toString() === req.business._id.toString()

      if (isAdmin || isOwner || isBusiness) {
        // Si l'inscription n'a pas de montant mais a une formation avec un prix
        if ((!inscription.amount || inscription.amount === 0) && inscription.formation && inscription.formation.price) {
          inscription.amount = inscription.formation.price
          await inscription.save()
        }

        res.json(inscription)
      } else {
        res.status(403)
        throw new Error("Non autorisé à accéder à cette inscription")
      }
    } else {
      res.status(404)
      throw new Error("Inscription non trouvée")
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'inscription:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération de l'inscription: " + error.message)
  }
})

// @desc    Obtenir toutes les inscriptions d'un utilisateur
// @route   GET /api/inscriptions/user
// @access  Private
const getUserInscriptions = asyncHandler(async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ user: req.user._id })
      .populate({
        path: "formation",
        select: "title price startDate endDate",
        populate: {
          path: "business",
          select: "name structureName",
        },
      })
      .populate("business", "name structureName")
      .sort({ createdAt: -1 })

    // Mettre à jour les montants si nécessaire
    for (const inscription of inscriptions) {
      if ((!inscription.amount || inscription.amount === 0) && inscription.formation && inscription.formation.price) {
        inscription.amount = inscription.formation.price
        await inscription.save()
      }
    }

    res.json(inscriptions)
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions de l'utilisateur:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des inscriptions de l'utilisateur: " + error.message)
  }
})

// @desc    Obtenir toutes les inscriptions d'une entreprise
// @route   GET /api/inscriptions/business
// @access  Private/Business
const getBusinessInscriptions = asyncHandler(async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ business: req.business._id })
      .populate("user", "name email firstName lastName")
      .populate("formation", "title price")
      .sort({ createdAt: -1 })

    // Mettre à jour les montants si nécessaire
    for (const inscription of inscriptions) {
      if ((!inscription.amount || inscription.amount === 0) && inscription.formation && inscription.formation.price) {
        inscription.amount = inscription.formation.price
        await inscription.save()
      }
    }

    res.json(inscriptions)
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions de l'entreprise:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des inscriptions de l'entreprise: " + error.message)
  }
})

// @desc    Obtenir toutes les inscriptions (pour admin)
// @route   GET /api/inscriptions/admin
// @access  Private/Admin
// Fonction getAllInscriptions modifiée pour mieux peupler les données
const getAllInscriptions = asyncHandler(async (req, res) => {
  console.log("Récupération de toutes les inscriptions")
  try {
    const inscriptions = await Inscription.find({})
      .populate("user", "name email firstName lastName")
      .populate({
        path: "formation",
        select: "title startDate endDate price",
        populate: {
          path: "business",
          select: "name structureName",
        },
      })
      .populate({
        path: "concours",
        select: "title startDate endDate price",
        populate: {
          path: "business",
          select: "name structureName",
        },
      })
      .populate("business", "name structureName")
      .sort({ createdAt: -1 })

    console.log(`${inscriptions.length} inscriptions trouvées`)

    // Mettre à jour les montants si nécessaire
    for (const inscription of inscriptions) {
      if ((!inscription.amount || inscription.amount === 0) && inscription.formation && inscription.formation.price) {
        inscription.amount = inscription.formation.price
        await inscription.save()
      }
    }

    // Ajouter des logs pour déboguer les données d'entreprise et de montant
    inscriptions.forEach((inscription, index) => {
      console.log(`Inscription ${index + 1}:`)
      console.log(`- ID: ${inscription._id}`)
      console.log(`- Formation: ${inscription.formation ? inscription.formation.title : "N/A"}`)
      console.log(
        `- Business direct: ${inscription.business ? inscription.business.structureName || inscription.business.name : "N/A"}`,
      )
      console.log(
        `- Business via formation: ${inscription.formation && inscription.formation.business ? inscription.formation.business.structureName || inscription.formation.business.name : "N/A"}`,
      )
      console.log(`- Montant: ${inscription.amount || 0} FCFA`)
      console.log(`- Méthode de paiement: ${inscription.paymentMethod}`)
    })

    res.json(inscriptions)
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des inscriptions: " + error.message)
  }
})

// @desc    Mettre à jour le statut d'une inscription
// @route   PUT /api/inscriptions/:id/status
// @access  Private/Admin/Business
const updateInscriptionStatus = asyncHandler(async (req, res) => {
  try {
    const { status, paymentStatus, paymentMethod, notes, amount } = req.body

    const inscription = await Inscription.findById(req.params.id)

    if (!inscription) {
      res.status(404)
      throw new Error("Inscription non trouvée")
    }

    // Vérifier si l'utilisateur est autorisé à mettre à jour cette inscription
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin" || req.user.role === "superadmin")
    const isBusiness = req.business && inscription.business.toString() === req.business._id.toString()

    if (isAdmin || isBusiness) {
      // Mettre à jour les champs
      if (status) inscription.status = status
      if (paymentStatus) inscription.paymentStatus = paymentStatus
      if (paymentMethod) inscription.paymentMethod = paymentMethod
      if (notes) inscription.notes = notes
      if (amount !== undefined) inscription.amount = amount

      // Si le statut de paiement est passé à "paid", définir la date de paiement
      if (paymentStatus === "paid" && inscription.paymentStatus !== "paid") {
        inscription.paymentDate = new Date()
      }

      const updatedInscription = await inscription.save()

      console.log("Inscription mise à jour:", {
        id: updatedInscription._id,
        status: updatedInscription.status,
        paymentStatus: updatedInscription.paymentStatus,
        paymentMethod: updatedInscription.paymentMethod,
        amount: updatedInscription.amount,
      })

      res.json(updatedInscription)
    } else {
      res.status(403)
      throw new Error("Non autorisé à mettre à jour cette inscription")
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de l'inscription:", error)
    res.status(500)
    throw new Error("Erreur lors de la mise à jour du statut de l'inscription: " + error.message)
  }
})

// @desc    Mettre à jour la méthode de paiement d'une inscription
// @route   PUT /api/inscriptions/:id/payment-method
// @access  Private/Admin/Business
const updateInscriptionPaymentMethod = asyncHandler(async (req, res) => {
  try {
    const { paymentMethod } = req.body

    if (!paymentMethod) {
      res.status(400)
      throw new Error("La méthode de paiement est requise")
    }

    const inscription = await Inscription.findById(req.params.id)

    if (!inscription) {
      res.status(404)
      throw new Error("Inscription non trouvée")
    }

    // Vérifier si l'utilisateur est autorisé à mettre à jour cette inscription
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin" || req.user.role === "superadmin")
    const isBusiness = req.business && inscription.business.toString() === req.business._id.toString()

    if (isAdmin || isBusiness) {
      inscription.paymentMethod = paymentMethod

      const updatedInscription = await inscription.save()

      console.log("Méthode de paiement mise à jour:", {
        id: updatedInscription._id,
        paymentMethod: updatedInscription.paymentMethod,
      })

      res.json(updatedInscription)
    } else {
      res.status(403)
      throw new Error("Non autorisé à mettre à jour cette inscription")
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la méthode de paiement:", error)
    res.status(500)
    throw new Error("Erreur lors de la mise à jour de la méthode de paiement: " + error.message)
  }
})

// @desc    Supprimer une inscription
// @route   DELETE /api/inscriptions/:id
// @access  Private/Admin/Business/User
const deleteInscription = asyncHandler(async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id)

    if (!inscription) {
      res.status(404)
      throw new Error("Inscription non trouvée")
    }

    // Vérifier si l'utilisateur est autorisé à supprimer cette inscription
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin" || req.user.role === "superadmin")
    const isOwner = req.user && inscription.user.toString() === req.user._id.toString()
    const isBusiness = req.business && inscription.business.toString() === req.business._id.toString()

    if (isAdmin || isOwner || isBusiness) {
      await inscription.deleteOne()
      res.json({ message: "Inscription supprimée" })
    } else {
      res.status(403)
      throw new Error("Non autorisé à supprimer cette inscription")
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'inscription:", error)
    res.status(500)
    throw new Error("Erreur lors de la suppression de l'inscription: " + error.message)
  }
})

export {
  createInscription,
  getInscriptionById,
  getUserInscriptions,
  getBusinessInscriptions,
  getAllInscriptions,
  updateInscriptionStatus,
  updateInscriptionPaymentMethod,
  deleteInscription,
}

