import asyncHandler from "express-async-handler"
import Formation from "../../models/Formation.js"
import Inscription from "../../models/Inscription.js"

// @desc    Récupérer les formations de l'utilisateur
// @route   GET /api/user/formations
// @access  Private
export const getUserFormations = asyncHandler(async (req, res) => {
  try {
    // Récupérer les inscriptions de l'utilisateur
    const inscriptions = await Inscription.find({
      user: req.user._id,
      type: "formation",
    })
      .populate({
        path: "formation",
        select: "title description startDate endDate image price duration",
        populate: {
          path: "business",
          select: "structureName logo",
        },
      })
      .sort({ createdAt: -1 })

    res.json(inscriptions)
  } catch (error) {
    console.error("Erreur lors de la récupération des formations de l'utilisateur:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des formations de l'utilisateur")
  }
})

// @desc    S'inscrire à une formation
// @route   POST /api/user/formations/:id/register
// @access  Private
export const registerForFormation = asyncHandler(async (req, res) => {
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
      type: "formation",
    })

    if (existingInscription) {
      res.status(400)
      throw new Error("Vous êtes déjà inscrit à cette formation")
    }

    // Vérifier s'il reste des places disponibles
    if (formation.places !== undefined && formation.places <= 0) {
      res.status(400)
      throw new Error("Il n'y a plus de places disponibles pour cette formation")
    }

    // Créer l'inscription
    const inscription = new Inscription({
      user: req.user._id,
      formation: formation._id,
      business: formation.business,
      type: "formation",
      status: "pending",
      firstName: req.body.firstName || req.user.firstName,
      lastName: req.body.lastName || req.user.lastName,
      email: req.body.email || req.user.email,
      phone: req.body.phone || req.user.phone,
      motivation: req.body.motivation,
    })

    const createdInscription = await inscription.save()

    // Décrémenter le nombre de places disponibles
    if (formation.places !== undefined) {
      formation.places -= 1
      await formation.save()
    }

    res.status(201).json(createdInscription)
  } catch (error) {
    console.error("Erreur lors de l'inscription à la formation:", error)
    res.status(500)
    throw new Error("Erreur lors de l'inscription à la formation: " + error.message)
  }
})

// @desc    Annuler une inscription à une formation
// @route   DELETE /api/user/formations/:id/register
// @access  Private
export const cancelFormationRegistration = asyncHandler(async (req, res) => {
  try {
    // Trouver l'inscription
    const inscription = await Inscription.findOne({
      user: req.user._id,
      formation: req.params.id,
      type: "formation",
    })

    if (!inscription) {
      res.status(404)
      throw new Error("Inscription non trouvée")
    }

    // Vérifier si l'inscription peut être annulée
    if (inscription.status !== "pending") {
      res.status(400)
      throw new Error("Vous ne pouvez annuler que les inscriptions en attente")
    }

    // Supprimer l'inscription
    await Inscription.deleteOne({ _id: inscription._id })

    // Incrémenter le nombre de places disponibles
    const formation = await Formation.findById(req.params.id)
    if (formation && formation.places !== undefined) {
      formation.places += 1
      await formation.save()
    }

    res.json({ message: "Inscription annulée avec succès" })
  } catch (error) {
    console.error("Erreur lors de l'annulation de l'inscription:", error)
    res.status(500)
    throw new Error("Erreur lors de l'annulation de l'inscription: " + error.message)
  }
})

