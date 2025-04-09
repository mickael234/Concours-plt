import asyncHandler from "express-async-handler"
import Document from "../models/Document.js"
import mongoose from "mongoose"
import Business from "../models/Business.js"


// @desc    Create a new document
// @route   POST /api/documents
// @access  Private

// @desc    Create a new document
// @route   POST /api/documents
// @access  Private
const createDocument = asyncHandler(async (req, res) => {
  console.log("Requête reçue pour créer un document:", req.body)
  console.log("Headers:", req.headers)
  console.log(
    "Utilisateur authentifié:",
    req.user ? `ID: ${req.user._id}, Type: ${req.user.userType || req.user.type}` : "Non défini",
  )
  console.log("Business authentifié:", req.business ? `ID: ${req.business._id}` : "Non défini")

  const { title, description, fileUrl, fileType, concours, price, isPublic } = req.body

  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user && !req.business) {
      res.status(401)
      throw new Error("Utilisateur non authentifié")
    }

    // Déterminer l'ID de l'entreprise
    let businessId = null

    // Si req.business existe, utiliser son ID
    if (req.business) {
      businessId = req.business._id
      console.log("ID d'entreprise depuis req.business:", businessId)
    }
    // Si req.user existe et a un type "business", utiliser son ID
    else if (req.user && (req.user.userType === "business" || req.user.type === "business")) {
      businessId = req.user._id
      console.log("ID d'entreprise depuis req.user._id (utilisateur est une entreprise):", businessId)
    }
    // Si req.user existe et a une propriété business, utiliser cette valeur
    else if (req.user && req.user.business) {
      businessId = req.user.business._id || req.user.business
      console.log("ID d'entreprise depuis req.user.business:", businessId)
    }
    // Si req.user existe et a une propriété employeeOf, utiliser cette valeur
    else if (req.user && req.user.employeeOf) {
      businessId = req.user.employeeOf._id || req.user.employeeOf
      console.log("ID d'entreprise depuis req.user.employeeOf:", businessId)
    }
    // Si req.user existe et a une propriété businessId, utiliser cette valeur
    else if (req.user && req.user.businessId) {
      businessId = req.user.businessId
      console.log("ID d'entreprise depuis req.user.businessId:", businessId)
    }
    // Si l'utilisateur est connecté avec un token business, mais que req.business n'est pas défini
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        // Extraire le token
        const token = req.headers.authorization.split(" ")[1]

        // Décoder le token pour vérifier s'il s'agit d'un token business
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.type === "business") {
          // C'est un token business, utiliser l'ID du token
          businessId = decoded.id
          console.log("ID d'entreprise extrait du token business:", businessId)
        }
      } catch (tokenError) {
        console.error("Erreur lors du décodage du token:", tokenError)
      }
    }

    // Dernier recours: utiliser l'ID de l'utilisateur
    if (!businessId && req.user) {
      businessId = req.user._id
      console.log("Utilisation de l'ID utilisateur comme ID d'entreprise:", businessId)
    } else if (!businessId) {
      console.error("Impossible de déterminer l'ID de l'entreprise")
      res.status(400)
      throw new Error("ID d'entreprise requis pour créer un document")
    }

    // Créer le document
    const document = new Document({
      title,
      description: description || "",
      fileUrl,
      fileType: fileType || "application/pdf",
      business: businessId,
      concours: concours || [],
      price: Number.parseFloat(price) || 0,
      isPublic: isPublic !== undefined ? isPublic : true,
    })

    console.log("Document à créer:", document)

    const savedDoc = await document.save()
    console.log("Document créé avec succès:", savedDoc._id)

    res.status(201).json(savedDoc)
  } catch (error) {
    console.error("Erreur lors de la création du document:", error)
    res.status(400)
    throw new Error(`Erreur lors de la création du document: ${error.message}`)
  }
})



// @desc    Get all documents
// @route   GET /api/documents
// @access  Public
const getAllDocuments = asyncHandler(async (req, res) => {
  try {
    const documents = await Document.find({})
      .populate("business", "name")
      .populate("concours", "title name")
      .sort({ createdAt: -1 })
    res.json(documents)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
// @access  Public
const getDocumentById = asyncHandler(async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("business", "name")
      .populate("concours", "title name")

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    res.json(document)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Update a document
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = asyncHandler(async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Only the business that created the document can update it
    if (document.business.toString() !== req.user._id.toString() && req.user.constructor.modelName !== "Admin") {
      return res.status(401).json({ message: "Not authorized to update this document" })
    }

    const updatedDocument = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("business", "name")
      .populate("concours", "title name")

    res.json(updatedDocument)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Only the business that created the document can delete it
    if (document.business.toString() !== req.user._id.toString() && req.user.constructor.modelName !== "Admin") {
      return res.status(401).json({ message: "Not authorized to delete this document" })
    }

    await document.remove()
    res.json({ message: "Document deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Rate a document
// @route   POST /api/documents/:id/rate
// @access  Private
const rateDocument = asyncHandler(async (req, res) => {
  const { rating } = req.body

  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if the user has already rated the document
    const alreadyRated = document.ratings.find((r) => r.user.toString() === req.user._id.toString())

    if (alreadyRated) {
      return res.status(400).json({ message: "Document already rated" })
    }

    const rate = {
      user: req.user._id,
      rating: Number(rating),
    }

    document.ratings.push(rate)
    document.numRatings = document.ratings.length
    document.rating = document.ratings.reduce((acc, item) => item.rating + acc, 0) / document.ratings.length

    await document.save()

    res.status(201).json({ message: "Document rated" })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// @desc    Get all documents for a business
// @route   GET /api/business/documents
// @access  Private/Business
const getBusinessDocuments = asyncHandler(async (req, res) => {
  console.log("Récupération des documents pour l'entreprise")
  console.log("Headers:", req.headers)
  console.log("User:", req.user ? `ID: ${req.user._id}, Type: ${req.user.userType || req.user.type}` : "Non défini")
  console.log("Business:", req.business ? `ID: ${req.business._id}` : "Non défini")

  // Déterminer l'ID de l'entreprise à utiliser
  let businessId = null

  if (req.business) {
    businessId = req.business._id
    console.log("ID d'entreprise depuis req.business:", businessId)
  } else if (req.user && (req.user.userType === "business" || req.user.type === "business")) {
    businessId = req.user._id
    console.log("ID d'entreprise depuis req.user._id (utilisateur est une entreprise):", businessId)
  } else if (req.user && req.user.business) {
    businessId = req.user.business._id || req.user.business
    console.log("ID d'entreprise depuis req.user.business:", businessId)
  } else if (req.user && req.user.employeeOf) {
    businessId = req.user.employeeOf._id || req.user.employeeOf
    console.log("ID d'entreprise depuis req.user.employeeOf:", businessId)
  } else if (req.user && req.user.businessId) {
    businessId = req.user.businessId
    console.log("ID d'entreprise depuis req.user.businessId:", businessId)
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extraire le token
      const token = req.headers.authorization.split(" ")[1]

      // Décoder le token pour vérifier s'il s'agit d'un token business
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      if (decoded.type === "business") {
        // C'est un token business, utiliser l'ID du token
        businessId = decoded.id
        console.log("ID d'entreprise extrait du token business:", businessId)
      }
    } catch (tokenError) {
      console.error("Erreur lors du décodage du token:", tokenError)
    }
  } else {
    console.log("Aucun ID d'entreprise trouvé, impossible de récupérer les documents")
    return res.status(400).json({ message: "ID d'entreprise requis" })
  }

  try {
    console.log("Recherche des documents avec business ID:", businessId)

    // Récupérer tous les documents pour déboguer
    const allDocs = await Document.find({}).select("_id title business").lean()
    console.log("Tous les documents dans la base:", allDocs)

    // Récupérer les documents de l'entreprise avec toutes les informations
    const documents = await Document.find({ business: businessId })
      .populate("concours", "title name")
      .sort({ createdAt: -1 })

    console.log(`${documents.length} documents trouvés pour l'entreprise ${businessId}`)

    res.json(documents)
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error)
    res.status(500).json({ message: "Erreur serveur lors de la récupération des documents" })
  }
})



export {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getBusinessDocuments,
  rateDocument,
}

