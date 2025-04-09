import express from "express"
import { login, register, refreshToken } from "../controllers/authController.js"
import { loginBusiness, registerBusiness } from "../controllers/businessController.js"

const router = express.Router()

// Routes d'authentification utilisateur
router.post("/login", login)
router.post("/register", register)
router.post("/refresh-token", refreshToken)

// Routes d'authentification business
router.post("/business/login", loginBusiness)
router.post("/business/register", registerBusiness)

export default router

