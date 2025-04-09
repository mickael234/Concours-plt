import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname } from "path"

const router = express.Router()

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// Utiliser un chemin qui correspond à celui dans server.js
const rootDir = path.resolve(__dirname, "../..")
console.log("Upload rootDir:", rootDir)

// Créer les dossiers de destination s'ils n'existent pas
const createUploadDirs = () => {
  const dirs = [
    "uploads",
    "uploads/images",
    "uploads/documents",
    "uploads/logos",
    "uploads/formations",
    "uploads/resources",
  ]

  dirs.forEach((dir) => {
    const fullPath = path.join(rootDir, dir)
    console.log(`Checking directory: ${fullPath}`)
    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true })
        console.log(`Created directory: ${fullPath}`)
      } catch (error) {
        console.error(`Error creating directory ${fullPath}:`, error)
      }
    }
  })
}

// Create upload directories
try {
  createUploadDirs()
} catch (error) {
  console.error("Error creating upload directories:", error)
}

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Déterminer le dossier de destination en fonction du type de fichier
    let uploadDir = "uploads"

    if (req.body.type === "image") {
      uploadDir = "uploads/images"
    } else if (req.body.type === "document") {
      uploadDir = "uploads/documents"
    } else if (req.body.type === "logo") {
      uploadDir = "uploads/logos"
    } else if (req.body.type === "formation") {
      uploadDir = "uploads/formations"
    } else if (req.body.type === "resource") {
      uploadDir = "uploads/resources"
    }

    const fullPath = path.join(rootDir, uploadDir)
    console.log(`Uploading to directory: ${fullPath}`)
    cb(null, fullPath)
  },
  filename(req, file, cb) {
    const uniqueFilename = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    console.log(`Generated filename: ${uniqueFilename}`)
    cb(null, uniqueFilename)
  },
})

// Vérifier les types de fichiers
function checkFileType(file, cb) {
  const filetypes = /jpg|svg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = file.mimetype.startsWith("image/") || file.mimetype.startsWith("application/")

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error("Erreur: Images, documents et archives uniquement!"))
  }
}

// Configure multer with error handling
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb)
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).single("file")

// Route pour télécharger un fichier
router.post("/", (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error("Multer error:", err)
      return res.status(500).json({
        message: "Erreur lors du téléchargement du fichier",
        error: err.message,
      })
    } else if (err) {
      // An unknown error occurred
      console.error("Unknown error:", err)
      return res.status(500).json({
        message: "Erreur lors du téléchargement du fichier",
        error: err.message,
      })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier n'a été téléchargé" })
      }

      console.log("File uploaded successfully:", req.file)

      // Construire l'URL du fichier
      // Remove the rootDir part from the path to get the relative URL
      const relativePath = req.file.path.replace(rootDir, "")
      const fileUrl = `${relativePath.replace(/\\/g, "/")}`

      console.log("File URL:", fileUrl)

      res.json({
        message: "Fichier téléchargé avec succès",
        url: fileUrl,
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: fileUrl,
        },
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier:", error)
      res.status(500).json({
        message: "Erreur lors du téléchargement du fichier",
        error: error.message,
      })
    }
  })
})

export default router

