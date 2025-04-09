import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import generateToken from "../utils/generateToken.js"

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id, user.role)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    })

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    })
  } else {
    res.status(401)
    throw new Error("Email ou mot de passe invalide")
  }
})

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error("Cet utilisateur existe déjà")
  }

  // Par défaut, le rôle est "user"
  const userRole = role || "user"

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
  })

  if (user) {
    const token = generateToken(user._id, user.role)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    })
  } else {
    res.status(400)
    throw new Error("Données utilisateur invalides")
  }
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email

    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    })
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    await user.deleteOne()
    res.json({ message: "Utilisateur supprimé" })
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password")

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.role = req.body.role || user.role

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    })
  } else {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }
})

// @desc    Create a super admin
// @route   POST /api/superadmin/create
// @access  Public (mais protégé par une clé secrète)
const createSuperAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, secretKey } = req.body

  // Vérifier la clé secrète (à définir dans vos variables d'environnement)
  if (secretKey !== process.env.SUPER_ADMIN_SECRET_KEY) {
    res.status(401)
    throw new Error("Clé secrète invalide")
  }

  // Vérifier si un super admin existe déjà
  const superAdminExists = await User.findOne({ role: "superadmin" })
  if (superAdminExists) {
    res.status(400)
    throw new Error("Un super admin existe déjà")
  }

  // Créer le super admin
  const user = await User.create({
    name,
    email,
    password,
    role: "superadmin",
  })

  if (user) {
    const token = generateToken(user._id, user.role)

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    })
  } else {
    res.status(400)
    throw new Error("Données utilisateur invalides")
  }
})

// @desc    Créer un utilisateur admin
// @route   POST /api/superadmin/create-admin
// @access  Private/SuperAdmin
const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error("Cet utilisateur existe déjà")
  }

  // Créer l'utilisateur admin
  const user = await User.create({
    name,
    email,
    password,
    role: "admin",
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } else {
    res.status(400)
    throw new Error("Données utilisateur invalides")
  }
})

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  createSuperAdmin,
  createAdminUser,
}

