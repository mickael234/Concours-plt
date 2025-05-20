import asyncHandler from "express-async-handler"
import Formation from "../models/Formation.js"

// @desc    Répondre à un avis
// @route   POST /api/ratings/:id/respond
// @access  Private/Business
const respondToRating = asyncHandler(async (req, res) => {
  console.log("Fonction respondToRating appelée")
  console.log("Paramètres:", req.params)
  console.log("Corps de la requête:", req.body)
  console.log("Business authentifié:", req.business?._id)

  const { text, formationId } = req.body
  const ratingId = req.params.id

  if (!text) {
    res.status(400)
    throw new Error("Le texte de la réponse est requis")
  }

  try {
    // Trouver la formation qui contient cet avis
    const formation = await Formation.findById(formationId)

    if (!formation) {
      console.error("Formation non trouvée:", formationId)
      res.status(404)
      throw new Error("Formation non trouvée")
    }

    // Vérifier que l'entreprise est bien propriétaire de cette formation
    if (formation.business.toString() !== req.business._id.toString()) {
      console.error("Entreprise non autorisée:", req.business._id, "vs", formation.business)
      res.status(403)
      throw new Error("Vous n'êtes pas autorisé à répondre à cet avis")
    }

    // Trouver l'avis dans la formation
    const ratingIndex = formation.ratings.findIndex((rating) => rating._id.toString() === ratingId)

    if (ratingIndex === -1) {
      console.error("Avis non trouvé:", ratingId)
      res.status(404)
      throw new Error("Avis non trouvé")
    }

    // Ajouter ou mettre à jour la réponse
    formation.ratings[ratingIndex].businessResponse = {
      text,
      createdAt: new Date(),
      business: req.business._id,
    }

    await formation.save()

    res.status(201).json({
      message: "Réponse ajoutée avec succès",
      response: formation.ratings[ratingIndex].businessResponse,
    })
  } catch (error) {
    console.error("Erreur lors de la réponse à l'avis:", error)
    res.status(error.statusCode || 500)
    throw new Error(error.message || "Erreur lors de la réponse à l'avis")
  }
})

// @desc    Répondre à une réponse d'entreprise
// @route   POST /api/ratings/:id/user-reply
// @access  Private/User
const replyToBusinessResponse = asyncHandler(async (req, res) => {
  console.log("Fonction replyToBusinessResponse appelée")
  console.log("Paramètres:", req.params)
  console.log("Corps de la requête:", req.body)
  console.log("Utilisateur authentifié:", req.user?._id)

  const { text, formationId } = req.body
  const ratingId = req.params.id

  if (!text) {
    res.status(400)
    throw new Error("Le texte de la réponse est requis")
  }

  try {
    // Trouver la formation qui contient cet avis
    const formation = await Formation.findById(formationId)

    if (!formation) {
      console.error("Formation non trouvée:", formationId)
      res.status(404)
      throw new Error("Formation non trouvée")
    }

    // Trouver l'avis dans la formation
    const ratingIndex = formation.ratings.findIndex((rating) => rating._id.toString() === ratingId)

    if (ratingIndex === -1) {
      console.error("Avis non trouvé:", ratingId)
      res.status(404)
      throw new Error("Avis non trouvé")
    }

    // Vérifier que l'utilisateur est bien celui qui a laissé l'avis
    if (formation.ratings[ratingIndex].user.toString() !== req.user._id.toString()) {
      console.error("Utilisateur non autorisé:", req.user._id, "vs", formation.ratings[ratingIndex].user)
      res.status(403)
      throw new Error("Vous n'êtes pas autorisé à répondre à cet avis")
    }

    // Vérifier qu'il y a bien une réponse de l'entreprise
    if (!formation.ratings[ratingIndex].businessResponse) {
      console.error("Pas de réponse d'entreprise pour l'avis:", ratingId)
      res.status(400)
      throw new Error("Il n'y a pas de réponse de l'entreprise à laquelle répondre")
    }

    // Ajouter ou mettre à jour la réponse de l'utilisateur
    formation.ratings[ratingIndex].businessResponse.userReply = {
      text,
      createdAt: new Date(),
    }

    await formation.save()

    res.status(201).json({
      message: "Réponse ajoutée avec succès",
      userReply: formation.ratings[ratingIndex].businessResponse.userReply,
    })
  } catch (error) {
    console.error("Erreur lors de la réponse à l'entreprise:", error)
    res.status(error.statusCode || 500)
    throw new Error(error.message || "Erreur lors de la réponse à l'entreprise")
  }
})

// @desc    Supprimer une réponse à un avis
// @route   DELETE /api/ratings/:id/respond
// @access  Private/Business
const deleteRatingResponse = asyncHandler(async (req, res) => {
  const ratingId = req.params.id

  try {
    // Trouver la formation qui contient cet avis
    const formation = await Formation.findOne({
      "ratings._id": ratingId,
    })

    if (!formation) {
      res.status(404)
      throw new Error("Avis non trouvé")
    }

    // Vérifier que l'entreprise est bien propriétaire de cette formation
    if (formation.business.toString() !== req.business._id.toString()) {
      res.status(403)
      throw new Error("Vous n'êtes pas autorisé à supprimer cette réponse")
    }

    // Trouver l'avis dans la formation
    const ratingIndex = formation.ratings.findIndex((rating) => rating._id.toString() === ratingId)

    if (ratingIndex === -1) {
      res.status(404)
      throw new Error("Avis non trouvé")
    }

    // Supprimer la réponse
    formation.ratings[ratingIndex].businessResponse = undefined

    await formation.save()

    res.json({ message: "Réponse supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la réponse:", error)
    res.status(error.statusCode || 500)
    throw new Error(error.message || "Erreur lors de la suppression de la réponse")
  }
})

export { respondToRating, deleteRatingResponse, replyToBusinessResponse }
