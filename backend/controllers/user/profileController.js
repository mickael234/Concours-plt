import asyncHandler from "express-async-handler"
import User from "../../models/User.js"

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    console.log("Récupération du profil pour l'utilisateur:", req.user._id)

    // Option 1: Utiliser strictPopulate: false pour éviter l'erreur
    const user = await User.findById(req.user._id)
      .populate({
        path: "downloadedDocuments",
        select: "title description fileUrl fileType createdAt downloads price type",
      })
      .populate({
        path: "formations",
        select: "title description startDate endDate image price duration",
      })
      .populate("applications")
      .populate("alerts")
      .lean()
      .exec()

    if (!user) {
      console.log("Utilisateur non trouvé")
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    console.log("Profil utilisateur trouvé")
    console.log("Documents téléchargés:", user.downloadedDocuments?.length || 0)
    console.log("Formations:", user.formations?.length || 0)
    console.log("Applications:", user.applications?.length || 0)
    console.log("Alertes:", user.alerts?.length || 0)

    // S'assurer que toutes les propriétés existent pour éviter les erreurs
    const userResponse = {
      _id: user._id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      isAdmin: user.isAdmin || false,
      education: user.education || [],
      experience: user.experience || [],
      downloadedDocuments: user.downloadedDocuments || [],
      formations: user.formations || [],
      applications: user.applications || [],
      alerts: user.alerts || [],
      notificationSettings: user.notificationSettings || {
        email: true,
        sms: false,
        push: true,
      },
      profileCompletion: calculateProfileCompletion(user),
    }

    res.json(userResponse)
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    res.status(500).json({
      message: "Erreur lors de la récupération du profil",
      error: error.message,
    })
  }
})

// @desc    Update user password
// @route   PUT /api/user/profile/password
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
  try {
    console.log("Mise à jour du mot de passe pour l'utilisateur:", req.user._id)

    const user = await User.findById(req.user._id)

    if (user) {
      const { currentPassword, newPassword } = req.body
      console.log("Vérification du mot de passe actuel")

      // Vérifier si le mot de passe actuel est correct
      const isMatch = await user.matchPassword(currentPassword)

      if (!isMatch) {
        console.log("Mot de passe actuel incorrect")
        res.status(401)
        throw new Error("Mot de passe actuel incorrect")
      }

      // Mettre à jour le mot de passe
      user.password = newPassword
      await user.save()
      console.log("Mot de passe mis à jour avec succès")

      res.json({ message: "Mot de passe mis à jour avec succès" })
    } else {
      console.log("Utilisateur non trouvé")
      res.status(404)
      throw new Error("Utilisateur non trouvé")
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error)
    res.status(500)
    throw new Error("Erreur lors de la mise à jour du mot de passe: " + error.message)
  }
})

// Fonction utilitaire pour calculer le pourcentage de complétion du profil
const calculateProfileCompletion = (user) => {
  let completionScore = 0
  let totalFields = 0

  // Champs de base
  const baseFields = ["firstName", "lastName", "email", "phone"]
  baseFields.forEach((field) => {
    totalFields++
    if (user[field]) completionScore++
  })

  // Éducation
  totalFields++
  if (user.education && user.education.length > 0) completionScore++

  // Expérience
  totalFields++
  if (user.experience && user.experience.length > 0) completionScore++

  // Calcul du pourcentage
  return Math.round((completionScore / totalFields) * 100)
}


// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.firstName = req.body.firstName || user.firstName
    user.lastName = req.body.lastName || user.lastName
    user.email = req.body.email || user.email
    user.phone = req.body.phone || user.phone

    // Si un mot de passe est fourni, le mettre à jour
    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
      education: updatedUser.education || [],
      experience: updatedUser.experience || [],
      notificationSettings: updatedUser.notificationSettings || {
        email: true,
        sms: false,
        push: true,
      },
      profileCompletion: calculateProfileCompletion(updatedUser),
    })
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Add user education
// @route   POST /api/user/profile/education
// @access  Private
const addUserEducation = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    const { title, school, status, startDate, endDate, type, level } = req.body

    const newEducation = {
      title,
      school,
      status,
      startDate,
      endDate,
      type,
      level,
    }

    if (!user.education) {
      user.education = []
    }

    user.education.unshift(newEducation)

    await user.save()

    res.status(201).json(user.education)
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Delete user education
// @route   DELETE /api/user/profile/education/:id
// @access  Private
const deleteUserEducation = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    // Vérifier si l'éducation existe
    if (!user.education) {
      res.status(404)
      throw new Error("Aucune formation trouvée")
    }

    // Filtrer l'éducation à supprimer
    user.education = user.education.filter((edu) => edu._id.toString() !== req.params.id)

    await user.save()

    res.json(user.education)
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Add user experience
// @route   POST /api/user/profile/experience
// @access  Private
const addUserExperience = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    const { title, company, status, startDate, endDate, type } = req.body

    const newExperience = {
      title,
      company,
      status,
      startDate,
      endDate,
      type,
    }

    if (!user.experience) {
      user.experience = []
    }

    user.experience.unshift(newExperience)

    await user.save()

    res.status(201).json(user.experience)
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Delete user experience
// @route   DELETE /api/user/profile/experience/:id
// @access  Private
const deleteUserExperience = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    // Vérifier si l'expérience existe
    if (!user.experience) {
      res.status(404)
      throw new Error("Aucune expérience trouvée")
    }

    // Filtrer l'expérience à supprimer
    user.experience = user.experience.filter((exp) => exp._id.toString() !== req.params.id)

    await user.save()

    res.json(user.experience)
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Update notification settings
// @route   PUT /api/user/profile/notifications
// @access  Private
const updateNotificationSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.notificationSettings = {
      email: req.body.email !== undefined ? req.body.email : user.notificationSettings?.email || true,
      sms: req.body.sms !== undefined ? req.body.sms : user.notificationSettings?.sms || false,
      push: req.body.push !== undefined ? req.body.push : user.notificationSettings?.push || true,
    }

    const updatedUser = await user.save()

    res.json(updatedUser.notificationSettings)
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})


export {
  getUserProfile,
  updateUserProfile,
  addUserEducation,
  deleteUserEducation,
  addUserExperience,
  deleteUserExperience,
  updateNotificationSettings,
  updateUserPassword,
}
