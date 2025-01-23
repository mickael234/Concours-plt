import express from "express"
import dotenv from "dotenv"
import colors from "colors"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"

// Import routes
import userRoutes from "./routes/userRoutes.js"
import concoursRoutes from "./routes/concoursRoutes.js"
import establishmentRoutes from "./routes/establishmentRoutes.js"
import resourceRoutes from "./routes/resourceRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import studyGroupRoutes from "./routes/studyGroupRoutes.js"

dotenv.config()

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get("/api/stats", async (req, res) => {
  try {
    // Fetch stats from your database
    const concoursCount = await Concours.countDocuments()
    const resourceCount = await Resource.countDocuments()
    const establishmentCount = await Establishment.countDocuments()

    res.json({
      concours: concoursCount,
      resources: resourceCount,
      establishments: establishmentCount,
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message })
  }
})

// Routes
app.use("/api/users", userRoutes)
app.use("/api/concours", concoursRoutes)
app.use("/api/establishments", establishmentRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/study-groups", studyGroupRoutes)

// Error Middleware
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Serveur en marche en mode ${process.env.NODE_ENV} sur le port ${PORT}`.yellow.bold)
})

