import asyncHandler from "express-async-handler"
import User from "../../models/User.js"
import Concours from "../../models/Concours.js"

// @desc    Obtenir toutes les alertes d'un utilisateur
// @route   GET /api/user/alerts
// @access  Private
const getUserAlerts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("alerts.concours")

  if (!user) {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }

  res.json(user.alerts || [])
})

// @desc    Ajouter une alerte pour un utilisateur
// @route   POST /api/user/alerts
// @access  Private
const addUserAlert = asyncHandler(async (req, res) => {
  const { concoursId } = req.body

  if (!concoursId) {
    res.status(400)
    throw new Error("ID du concours requis")
  }

  const concours = await Concours.findById(concoursId)

  if (!concours) {
    res.status(404)
    throw new Error("Concours non trouvé")
  }

  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }

  // Vérifier si l'alerte existe déjà
  const alertExists = user.alerts && user.alerts.some((alert) => alert.concours.toString() === concoursId)

  if (alertExists) {
    res.status(400)
    throw new Error("Cette alerte existe déjà")
  }

  // Ajouter l'alerte
  if (!user.alerts) {
    user.alerts = []
  }

  user.alerts.push({
    concours: concoursId,
    createdAt: Date.now(),
  })

  await user.save()

  res.status(201).json({
    message: "Alerte ajoutée avec succès",
    alert: {
      concours: concours,
      createdAt: new Date(),
    },
  })
})

// @desc    Supprimer une alerte d'un utilisateur
// @route   DELETE /api/user/alerts/:id
// @access  Private
const deleteUserAlert = asyncHandler(async (req, res) => {
  const concoursId = req.params.id

  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }

  if (!user.alerts) {
    res.status(404)
    throw new Error("Aucune alerte trouvée")
  }

  // Filtrer les alertes pour supprimer celle avec l'ID spécifié
  user.alerts = user.alerts.filter((alert) => alert.concours.toString() !== concoursId)

  await user.save()

  res.json({ message: "Alerte supprimée avec succès" })
})

export { getUserAlerts, addUserAlert, deleteUserAlert }

