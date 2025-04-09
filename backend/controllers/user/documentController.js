import asyncHandler from "express-async-handler"
import User from "../../models/User.js"
import Document from "../../models/Document.js"

// @desc    Obtenir tous les documents téléchargés par un utilisateur
// @route   GET /api/user/documents
// @access  Private
const getUserDocuments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("downloadedDocuments")

  if (!user) {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }

  res.json(user.downloadedDocuments || [])
})

// @desc    Ajouter un document téléchargé à un utilisateur
// @route   POST /api/user/documents
// @access  Private
const addUserDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.body

  if (!documentId) {
    res.status(400)
    throw new Error("ID du document requis")
  }

  const document = await Document.findById(documentId)

  if (!document) {
    res.status(404)
    throw new Error("Document non trouvé")
  }

  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }

  // Vérifier si le document est déjà téléchargé
  const documentExists =
    user.downloadedDocuments && user.downloadedDocuments.some((doc) => doc.toString() === documentId)

  if (documentExists) {
    res.status(400)
    throw new Error("Ce document a déjà été téléchargé")
  }

  // Ajouter le document
  if (!user.downloadedDocuments) {
    user.downloadedDocuments = []
  }

  user.downloadedDocuments.push(documentId)

  await user.save()

  res.status(201).json({
    message: "Document ajouté avec succès",
    document: document,
  })
})

// @desc    Supprimer un document téléchargé d'un utilisateur
// @route   DELETE /api/user/documents/:id
// @access  Private
const deleteUserDocument = asyncHandler(async (req, res) => {
  const documentId = req.params.id

  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error("Utilisateur non trouvé")
  }

  if (!user.downloadedDocuments) {
    res.status(404)
    throw new Error("Aucun document trouvé")
  }

  // Filtrer les documents pour supprimer celui avec l'ID spécifié
  user.downloadedDocuments = user.downloadedDocuments.filter((doc) => doc.toString() !== documentId)

  await user.save()

  res.json({ message: "Document supprimé avec succès" })
})

export { getUserDocuments, addUserDocument, deleteUserDocument }

