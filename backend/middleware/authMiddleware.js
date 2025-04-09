import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import Business from "../models/Business.js"

// Middleware unifié pour protéger les routes
const protect = asyncHandler(async (req, res, next) => {
  console.log("Middleware protect appelé")
  let token

  // Vérifiez si le token est présent dans les en-têtes
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Récupérez le token
      token = req.headers.authorization.split(" ")[1]
      console.log("Token trouvé:", token ? "Présent" : "Absent")

      // Vérifiez le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log("Token décodé:", decoded)

      // Vérifiez si c'est un utilisateur ou une entreprise
      if (decoded.type === "business") {
        // C'est une entreprise
        const business = await Business.findById(decoded.id).select("-password")

        if (!business) {
          console.error("Entreprise non trouvée avec l'ID:", decoded.id)
          res.status(401)
          throw new Error("Non autorisé, entreprise non trouvée")
        }

        req.business = business
        req.user = {
          ...business.toObject(),
          userType: "business",
          type: "business",
        }
        console.log("Entreprise authentifiée:", req.business._id)
      } else {
        // C'est un utilisateur
        // Ajout de populate pour charger les références aux entreprises
        const user = await User.findById(decoded.id).select("-password").populate("business employeeOf")

        if (!user) {
          console.error("Utilisateur non trouvé avec l'ID:", decoded.id)
          res.status(401)
          throw new Error("Non autorisé, utilisateur non trouvé")
        }

        req.user = {
          ...user.toObject(),
          userType: decoded.type || user.userType || user.type || "user",
          type: decoded.type || user.userType || user.type || "user",
        }

        // Si l'utilisateur est un employé, ajouter l'ID de l'entreprise
        if (user.employeeOf) {
          req.user.employeeOf = user.employeeOf
          console.log("Utilisateur employé de l'entreprise:", user.employeeOf._id || user.employeeOf)
        }

        // Si l'utilisateur est propriétaire d'une entreprise
        if (user.business) {
          req.user.business = user.business
          console.log("Utilisateur propriétaire de l'entreprise:", user.business._id || user.business)
        }

        console.log("Utilisateur authentifié:", req.user._id, "Type:", req.user.userType)
      }

      next()
    } catch (error) {
      console.error("Erreur d'authentification:", error)
      res.status(401)
      throw new Error("Non autorisé, token invalide: " + error.message)
    }
  } else if (!token) {
    console.error("Aucun token fourni")
    res.status(401)
    throw new Error("Non autorisé, aucun token")
  }
})

// Middleware pour protéger les routes business
const protectBusiness = asyncHandler(async (req, res, next) => {
  console.log("Middleware protectBusiness appelé")
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Récupérer le token du header
      token = req.headers.authorization.split(" ")[1]
      console.log("Token business trouvé:", token ? "Présent" : "Absent")

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log("Token business décodé:", decoded)

      // Vérifier si c'est un token business
      if (decoded.type === "business") {
        // Récupérer le business sans le mot de passe
        req.business = await Business.findById(decoded.id).select("-password")
        req.user = req.business // Pour la compatibilité avec le code existant

        if (!req.business) {
          console.error("Business non trouvé avec l'ID:", decoded.id)
          res.status(401)
          throw new Error("Non autorisé, business non trouvé")
        }

        console.log("Business authentifié:", req.business._id)
        next()
      } else {
        // Vérifier si c'est un utilisateur associé à une entreprise
        const user = await User.findById(decoded.id).select("-password").populate("business employeeOf")

        if (user && (user.business || user.employeeOf)) {
          // Déterminer l'ID de l'entreprise
          const businessId = user.business ? user.business._id : user.employeeOf._id

          // Récupérer les détails de l'entreprise
          const business = await Business.findById(businessId).select("-password")

          if (business) {
            req.business = business
            req.user = {
              ...user.toObject(),
              businessId: businessId,
              userType: "employee",
              type: "employee",
            }
            console.log("Utilisateur associé à l'entreprise:", businessId)
            return next()
          }
        }

        console.error("Token non valide pour un business")
        res.status(401)
        throw new Error("Non autorisé, ce n'est pas un token business")
      }
    } catch (error) {
      console.error("Erreur d'authentification business:", error)
      res.status(401)
      throw new Error("Non autorisé, token business invalide")
    }
  } else if (!token) {
    console.error("Aucun token business fourni")
    res.status(401)
    throw new Error("Non autorisé, pas de token business")
  }
})

// Middleware pour vérifier si l'utilisateur est admin
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.role === "admin" || req.user.role === "superadmin")) {
    next()
  } else {
    res.status(401)
    throw new Error("Non autorisé, accès admin requis")
  }
})

// Middleware pour vérifier si l'utilisateur est superadmin
const superAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next()
  } else {
    res.status(401)
    throw new Error("Non autorisé, accès superadmin requis")
  }
})

// Middleware pour vérifier si l'utilisateur est admin ou business
const adminOrBusiness = asyncHandler(async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null

  if (!token) {
    res.status(401)
    throw new Error("Non autorisé, pas de token")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Essayer de trouver un business
    const business = await Business.findById(decoded.id).select("-password")
    if (business) {
      req.business = business
      req.user = {
        ...business.toObject(),
        userType: "business",
        type: "business",
      }
      return next()
    }

    // Essayer de trouver un utilisateur admin ou associé à une entreprise
    const user = await User.findById(decoded.id).select("-password").populate("business employeeOf")

    if (user) {
      req.user = {
        ...user.toObject(),
        userType: user.userType || user.type || "user",
        type: user.userType || user.type || "user",
      }

      // Vérifier si c'est un admin
      if (user.isAdmin || user.role === "admin" || user.role === "superadmin") {
        return next()
      }

      // Vérifier si l'utilisateur est associé à une entreprise
      if (user.business || user.employeeOf) {
        const businessId = user.business ? user.business._id : user.employeeOf._id
        req.user.businessId = businessId

        // Récupérer les détails de l'entreprise
        const businessDetails = await Business.findById(businessId).select("-password")
        if (businessDetails) {
          req.business = businessDetails
          return next()
        }
      }
    }

    res.status(401)
    throw new Error("Non autorisé, accès admin ou business requis")
  } catch (error) {
    console.error("Erreur d'authentification:", error)
    res.status(401)
    throw new Error("Non autorisé, token invalide")
  }
})

export { protect, protectBusiness, admin, superAdmin, adminOrBusiness }
