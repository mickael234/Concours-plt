import asyncHandler from "express-async-handler"
import User from "../../models/User.js"

// @desc    Update user password
// @route   PUT /api/user/profile/password
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    const { currentPassword, newPassword } = req.body

    // Vérifier si le mot de passe actuel est correct
    const isMatch = await user.matchPassword(currentPassword)

    if (!isMatch) {
      res.status(401)
      throw new Error("Mot de passe actuel incorrect")
    }

    // Mettre à jour le mot de passe
    user.password = newPassword
    await user.save()

    res.json({ message: "Mot de passe mis à jour avec succès" })
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

export { updateUserPassword }
