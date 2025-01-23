import asyncHandler from "express-async-handler"
import Concours from "../models/Concours.js"

// @desc    Fetch all concours
// @route   GET /api/concours
// @access  Public
const getConcours = asyncHandler(async (req, res) => {
  const concours = await Concours.find({})
  res.json(concours)
})

// @desc    Fetch single concours
// @route   GET /api/concours/:id
// @access  Public
const getConcoursById = asyncHandler(async (req, res) => {
  const concours = await Concours.findById(req.params.id)

  if (concours) {
    res.json(concours)
  } else {
    res.status(404)
    throw new Error("Concours non trouvé")
  }
})

// @desc    Create a concours
// @route   POST /api/concours
// @access  Private/Admin
const createConcours = asyncHandler(async (req, res) => {
  const { title, description, status, dateStart, dateEnd, organizerName, category, organizerLogo } = req.body

  try {
    const concours = new Concours({
      title,
      description,
      status,
      dateStart,
      dateEnd,
      organizerName,
      category,
      organizerLogo,
    })

    const createdConcours = await concours.save()
    res.status(201).json(createdConcours)
  } catch (error) {
    console.error("Erreur détaillée lors de la sauvegarde du concours:", error)

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      res.status(400).json({ message: "Erreur de validation", errors: validationErrors })
    } else {
      res.status(500).json({ message: "Erreur lors de la sauvegarde du concours", error: error.message })
    }
  }
})

// @desc    Update a concours
// @route   PUT /api/concours/:id
// @access  Private/Admin
const updateConcours = asyncHandler(async (req, res) => {
  const { title, description, status, dateStart, dateEnd, organizerName, category } = req.body

  const concours = await Concours.findById(req.params.id)

  if (concours) {
    concours.title = title
    concours.description = description
    concours.status = status
    concours.dateStart = dateStart
    concours.dateEnd = dateEnd
    concours.organizerName = organizerName
    concours.category = category

    const updatedConcours = await concours.save()
    res.json(updatedConcours)
  } else {
    res.status(404)
    throw new Error("Concours non trouvé")
  }
})

// @desc    Delete a concours
// @route   DELETE /api/concours/:id
// @access  Private/Admin
const deleteConcours = asyncHandler(async (req, res) => {
  const concours = await Concours.findById(req.params.id)

  if (concours) {
    await concours.deleteOne()
    res.json({ message: "Concours supprimé" })
  } else {
    res.status(404)
    throw new Error("Concours non trouvé")
  }
})

export { getConcours, getConcoursById, createConcours, updateConcours, deleteConcours }

