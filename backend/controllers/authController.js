import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import generateToken from "../utils/generateToken.js"
import jwt from "jsonwebtoken"

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Vérifier que l'email et le mot de passe sont fournis
  if (!email || !password) {
    res.status(400)
    throw new Error("Email et mot de passe requis")
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email })

    if (!user) {
      res.status(401)
      throw new Error("Email ou mot de passe invalide")
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password)

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        token: generateToken(user._id, user.role),
      })
    } else {
      res.status(401)
      throw new Error("Email ou mot de passe invalide")
    }
  } catch (error) {
    console.error("Erreur d'authentification:", error)
    res.status(401)
    throw new Error(error.message || "Email ou mot de passe invalide")
  }
})

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  // Vérifier que tous les champs requis sont fournis
  if (!name || !email || !password) {
    res.status(400)
    throw new Error("Tous les champs sont requis")
  }

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error("Cet utilisateur existe déjà")
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        token: generateToken(user._id, user.role),
      })
    } else {
      res.status(400)
      throw new Error("Données utilisateur invalides")
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    res.status(400)
    throw new Error(error.message || "Erreur lors de la création de l'utilisateur")
  }
})

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body

  if (!token) {
    res.status(401)
    throw new Error("Refresh token requis")
  }

  try {
    // Vérifier le refresh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Trouver l'utilisateur
    const user = await User.findById(decoded.id)

    if (!user) {
      res.status(404)
      throw new Error("Utilisateur non trouvé")
    }

    // Générer un nouveau token d'accès
    const accessToken = generateToken(user._id, user.role)

    res.json({ accessToken })
  } catch (error) {
    res.status(401)
    throw new Error("Refresh token invalide ou expiré")
  }
})

export { login, register, refreshToken }

