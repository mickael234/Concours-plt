import asyncHandler from "express-async-handler"
import Formation from "../../models/Formation.js"

// Récupération des avis utilisateur
export const getUserRatings = asyncHandler(async (req, res) => {
  const formations = await Formation.find({ "ratings.user": req.user._id }).select("title description image ratings")

  const userRatings = []

  formations.forEach((formation) => {
    const filteredRatings = formation.ratings.filter((rating) =>
      rating.user.toString() === req.user._id.toString()
    )

    filteredRatings.forEach((rating) => {
      userRatings.push({
        ...rating.toObject(),
        formation: {
          _id: formation._id,
          title: formation.title,
          description: formation.description,
          image: formation.image,
        },
        formationId: formation._id,
      })
    })
  })

  res.json(userRatings)
})

// Répondre à une réponse d'entreprise
export const replyToBusinessResponse = asyncHandler(async (req, res) => {
  const { ratingId } = req.params
  const { text } = req.body

  const formation = await Formation.findOne({ "ratings._id": ratingId })

  if (!formation) {
    return res.status(404).json({ message: "Formation ou évaluation introuvable" })
  }

  const rating = formation.ratings.id(ratingId)

  if (!rating || rating.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Non autorisé à répondre à ce commentaire" })
  }

  if (!rating.businessResponse) {
    return res.status(400).json({ message: "Pas de réponse d'entreprise pour cet avis" })
  }

  rating.businessResponse.userReply = {
    text,
    createdAt: new Date(),
  }

  await formation.save()

  res.json({ message: "Réponse utilisateur enregistrée", userReply: rating.businessResponse.userReply })
})

export default {
  getUserRatings,
  replyToBusinessResponse,
}
