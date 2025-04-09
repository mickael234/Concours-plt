import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import colors from "colors"
import morgan from "morgan"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import connectDB from "./config/db.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"
import fs from "fs"
import jwt from "jsonwebtoken"

// Routes
import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import concoursRoutes from "./routes/concoursRoutes.js"
import establishmentRoutes from "./routes/establishmentRoutes.js"
import businessRoutes from "./routes/businessRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import resourceRoutes from "./routes/resourceRoutes.js"
import formationRoutes from "./routes/formationRoutes.js"
import documentRoutes from "./routes/documentRoutes.js"
import inscriptionRoutes from "./routes/inscriptionRoutes.js"
import statsRoutes from "./routes/statsRoutes.js"
import superAdminRoutes from "./routes/superAdminRoutes.js"
import downloadRoutes from "./routes/downloadRoutes.js"

// Routes utilisateur
import userAlertRoutes from "./routes/user/alertRoutes.js"
import userDocumentRoutes from "./routes/user/documentRoutes.js"
import userFormationRoutes from "./routes/user/formationRoutes.js"
import userProfileRoutes from "./routes/user/profileRoutes.js"
import userApplicationRoutes from "./routes/user/applicationRoutes.js"

// Activer les couleurs dans la console
colors.enable()

// Charger les variables d'environnement
dotenv.config()

// Connexion à la base de données
connectDB()

const app = express()

// Middleware pour parser le JSON
app.use(express.json())

// Middleware pour les logs en développement
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Configurez morgan pour afficher plus de détails sur les requêtes
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))
morgan.token("body", (req) => {
  if (req.method === "POST" || req.method === "PUT") {
    return JSON.stringify(req.body)
  }
  return ""
})

// Configuration CORS
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))

// Ajoutez ce middleware pour déboguer les tokens
app.use((req, res, next) => {
  if (req.headers.authorization) {
    console.log("Authorization header present:", req.headers.authorization.substring(0, 20) + "...")
    try {
      const token = req.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log("Token décodé:", decoded)
    } catch (error) {
      console.error("Erreur de décodage du token:", error.message)
    }
  } else {
    console.log("No authorization header")
  }
  next()
})

// Routes API
app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/concours", concoursRoutes)
app.use("/api/establishments", establishmentRoutes)
app.use("/api/business", businessRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/formations", formationRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/inscriptions", inscriptionRoutes)
app.use("/api/stats", statsRoutes)
app.use("/api/superadmin", superAdminRoutes)
app.use("/api/download", downloadRoutes)
app.use("/api/admin/inscriptions", inscriptionRoutes)

// Routes utilisateur
app.use("/api/user/alerts", userAlertRoutes)
app.use("/api/user/documents", userDocumentRoutes)
app.use("/api/user/formations", userFormationRoutes)
app.use("/api/user/profile", userProfileRoutes)
app.use("/api/user/applications", userApplicationRoutes)

// Servir les fichiers statiques
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Utiliser le même rootDir que dans uploadRoutes.js
const rootDir = path.resolve(__dirname, "../")

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(rootDir, "uploads")
console.log("Server uploadsDir:", uploadsDir)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Utiliser le même chemin que dans uploadRoutes.js
app.use("/uploads", express.static(path.join(rootDir, "uploads")))
console.log("Server static path:", path.join(rootDir, "uploads"))

// Route de base pour vérifier que l'API fonctionne
app.get("/", (req, res) => {
  res.json({ message: "L'API fonctionne..." })
})

// Middleware pour gérer les erreurs
app.use(notFound)
app.use(errorHandler)

// Créer le serveur HTTP
const httpServer = createServer(app)

// Configurer Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions,
})

// Gérer les connexions WebSocket
io.on("connection", (socket) => {
  console.log("Nouvelle connexion WebSocket:", socket.id)

  socket.on("disconnect", () => {
    console.log("Déconnexion WebSocket:", socket.id)
  })

  // Ajouter d'autres événements WebSocket ici
})

// Démarrer le serveur
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Serveur fonctionnant en mode ${process.env.NODE_ENV} sur le port ${PORT}`.yellow.bold)
  console.log(`Le serveur WebSocket fonctionne également sur le port ${PORT}`.cyan.bold)
})

