import asyncHandler from "express-async-handler"
import Concours from "../models/Concours.js"
import ConcoursStats from "../models/ConcoursStats.js"

// @desc    Get all concours
// @route   GET /api/concours
// @access  Public
const getConcours = asyncHandler(async (req, res) => {
  const concours = await Concours.find({})

  // Récupérer les statistiques pour chaque concours
  const concoursWithStats = await Promise.all(
    concours.map(async (concours) => {
      const stats = await ConcoursStats.findOne({ concoursId: concours._id })
      const concoursObj = concours.toObject()

      if (stats) {
        concoursObj.views = stats.views || 0
        concoursObj.ratings = stats.ratings || []
        concoursObj.averageRating = stats.averageRating || 0
        concoursObj.numRatings = stats.ratings ? stats.ratings.length : 0
      }

      return concoursObj
    }),
  )

  res.json(concoursWithStats)
})

// @desc    Get single concours
// @route   GET /api/concours/:id
// @access  Public
const getConcoursById = asyncHandler(async (req, res) => {
  const concours = await Concours.findById(req.params.id)
  if (concours) {
    const stats = await ConcoursStats.findOne({ concoursId: req.params.id })
    const responseData = concours.toObject()
    if (stats) {
      responseData.views = stats.views
      responseData.ratings = stats.ratings
      responseData.averageRating = stats.averageRating
    }
    res.json(responseData)
  } else {
    res.status(404)
    throw new Error("Concours not found")
  }
})

// @desc    Create a concours
// @route   POST /api/concours
// @access  Private/Admin
const createConcours = asyncHandler(async (req, res) => {
  console.log("Données reçues dans le contrôleur:", req.body)

  const concours = new Concours(req.body)

  if (req.body.resources && Array.isArray(req.body.resources)) {
    concours.resources = req.body.resources
  }

  try {
    const createdConcours = await concours.save()
    res.status(201).json(createdConcours)
  } catch (error) {
    console.error("Erreur lors de la création du concours:", error)
    res.status(400)
    throw new Error(error.message)
  }
})

// @desc    Update a concours
// @route   PUT /api/concours/:id
// @access  Private/Admin
const updateConcours = asyncHandler(async (req, res) => {
  const concours = await Concours.findById(req.params.id)

  if (concours) {
    // Mettre à jour tous les champs fournis
    Object.keys(req.body).forEach((key) => {
      concours[key] = req.body[key]
    })

    if (req.body.resources && Array.isArray(req.body.resources)) {
      concours.resources = req.body.resources
    }

    const updatedConcours = await concours.save()
    res.json(updatedConcours)
  } else {
    res.status(404)
    throw new Error("Concours not found")
  }
})

// @desc    Delete a concours
// @route   DELETE /api/concours/:id
// @access  Private/Admin
const deleteConcours = asyncHandler(async (req, res) => {
  const concours = await Concours.findById(req.params.id)

  if (concours) {
    await concours.deleteOne() // Utiliser deleteOne() au lieu de remove() qui est déprécié
    res.json({ message: "Concours removed" })
  } else {
    res.status(404)
    throw new Error("Concours not found")
  }
})

// @desc    Increment concours views
// @route   POST /api/concours/:id/view
// @access  Public
const incrementConcoursViews = asyncHandler(async (req, res) => {
  const { id } = req.params

  let stats = await ConcoursStats.findOne({ concoursId: id })

  if (!stats) {
    stats = new ConcoursStats({ concoursId: id })
  }

  stats.views += 1
  await stats.save()

  res.status(200).json({ success: true, views: stats.views })
})

// @desc    Rate a concours
// @route   POST /api/concours/:id/rate
// @access  Private
const rateConcours = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rating, comment } = req.body
  const userId = req.user._id

  let stats = await ConcoursStats.findOne({ concoursId: id })

  if (!stats) {
    stats = new ConcoursStats({ concoursId: id })
  }

  const existingRatingIndex = stats.ratings.findIndex((r) => r.userId.toString() === userId.toString())

  if (existingRatingIndex > -1) {
    stats.ratings[existingRatingIndex] = {
      userId,
      rating,
      comment,
      user: {
        _id: req.user._id,
        name: req.user.name,
      },
      createdAt: new Date(),
    }
  } else {
    stats.ratings.push({
      userId,
      rating,
      comment,
      user: {
        _id: req.user._id,
        name: req.user.name,
      },
      createdAt: new Date(),
    })
  }

  stats.averageRating = stats.ratings.reduce((acc, curr) => acc + curr.rating, 0) / stats.ratings.length

  await stats.save()

  // Mettre à jour également le document principal du concours
  const concours = await Concours.findById(id)
  if (concours) {
    concours.averageRating = stats.averageRating
    concours.numRatings = stats.ratings.length
    await concours.save()
  }

  res.status(201).json({
    success: true,
    averageRating: stats.averageRating,
    ratingsCount: stats.ratings.length,
    ratings: stats.ratings.map((rating) => ({
      ...rating.toObject(),
      user: rating.user
        ? {
            _id: rating.user._id,
            name: rating.user.name,
          }
        : null,
    })),
  })
})

export {
  getConcours,
  getConcoursById,
  createConcours,
  updateConcours,
  deleteConcours,
  incrementConcoursViews,
  rateConcours,
}

