import asyncHandler from "express-async-handler"
import Resource from "../models/Resource.js"
// Remove the require statements and use ES module imports

// @desc    Fetch all resources
// @route   GET /api/resources
// @access  Public
const getResources = asyncHandler(async (req, res) => {
  console.log("Fetching resources from database...")
  const resources = await Resource.find({}).populate("concoursId", "name")
  console.log(`Found ${resources.length} resources:`, resources)
  res.json(resources)
})

// @desc    Fetch single resource
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id)

  if (resource) {
    res.json(resource)
  } else {
    res.status(404)
    throw new Error("Ressource non trouvée")
  }
})

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private/Admin
const createResource = asyncHandler(async (req, res) => {
  console.log("Creating resource with data:", req.body)
  const { title, type, description, fileUrl, subject, year, price, concoursId, imageUrl } = req.body

  const resource = new Resource({
    title: title || "Titre de la ressource",
    type: type || "past_paper",
    description: description || "Description de la ressource",
    fileUrl: fileUrl || "url_du_fichier",
    imageUrl: imageUrl || "",
    subject: subject || "Matière",
    year: year || new Date().getFullYear(),
    price: price || 0,
    concoursId: concoursId || null,
  })

  const createdResource = await resource.save()
  console.log("Resource created successfully:", createdResource)
  res.status(201).json(createdResource)
})

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
const updateResource = asyncHandler(async (req, res) => {
  const { title, type, description, fileUrl, imageUrl, subject, year, price, concoursId } = req.body

  const resource = await Resource.findById(req.params.id)

  if (resource) {
    resource.title = title || resource.title
    resource.type = type || resource.type
    resource.description = description || resource.description
    resource.fileUrl = fileUrl || resource.fileUrl
    resource.imageUrl = imageUrl || resource.imageUrl
    resource.subject = subject || resource.subject
    resource.year = year || resource.year
    resource.price = price !== undefined ? price : resource.price
    resource.concoursId = concoursId || resource.concoursId

    const updatedResource = await resource.save()
    res.json(updatedResource)
  } else {
    res.status(404)
    throw new Error("Ressource non trouvée")
  }
})

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id)

  if (resource) {
    await resource.deleteOne() // Utilisation de deleteOne() au lieu de remove()
    res.json({ message: "Ressource supprimée" })
  } else {
    res.status(404)
    throw new Error("Ressource non trouvée")
  }
})

// @desc    Increment download count for a resource
// @route   PUT /api/resources/:id/download
// @access  Public
const incrementDownload = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id)

  if (resource) {
    resource.downloads += 1
    await resource.save()
    res.json({ message: "Téléchargement comptabilisé", downloads: resource.downloads })
  } else {
    res.status(404)
    throw new Error("Ressource non trouvée")
  }
})

// @desc    Rate a resource
// @route   POST /api/resources/:id/rate
// @access  Private
const rateResource = asyncHandler(async (req, res) => {
  const { rating } = req.body

  if (!rating || rating < 1 || rating > 5) {
    res.status(400)
    throw new Error("La note doit être comprise entre 1 et 5")
  }

  const resource = await Resource.findById(req.params.id)

  if (!resource) {
    res.status(404)
    throw new Error("Ressource non trouvée")
  }

  // Initialize ratings array if it doesn't exist
  if (!resource.ratings) {
    resource.ratings = []
  }

  // Check if user has already rated this resource
  const userRatingIndex = resource.ratings.findIndex((r) => r.user && r.user.toString() === req.user._id.toString())

  if (userRatingIndex >= 0) {
    // Update existing rating
    resource.ratings[userRatingIndex].rating = rating
  } else {
    // Add new rating
    resource.ratings.push({
      user: req.user._id,
      rating,
    })
  }

  // Calculate average rating
  const totalRatings = resource.ratings.length
  const ratingSum = resource.ratings.reduce((sum, item) => sum + item.rating, 0)
  resource.averageRating = ratingSum / totalRatings
  resource.numRatings = totalRatings

  await resource.save()

  res.status(200).json({
    success: true,
    averageRating: resource.averageRating,
    numRatings: resource.numRatings,
  })
})

// @desc    Récupérer toutes les ressources (publique)
// @route   GET /api/resources/all
// @access  Public
// Modifiez la fonction getAllResources pour ajouter plus de logs et gérer les erreurs
export const getAllResources = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching all resources...")
    const resources = await Resource.find({}).sort({ createdAt: -1 })
    console.log(`Found ${resources.length} resources`)

    // Vérifiez si resources est bien un tableau
    if (!Array.isArray(resources)) {
      console.error("Resources is not an array:", resources)
      return res.status(500).json({ message: "Erreur: les ressources ne sont pas dans un format attendu" })
    }

    // Retournez les ressources
    return res.json(resources)
  } catch (error) {
    console.error("Error in getAllResources:", error)
    res.status(500)
    throw new Error(`Erreur lors de la récupération des ressources: ${error.message}`)
  }
})



export {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  incrementDownload,
  rateResource,
}

