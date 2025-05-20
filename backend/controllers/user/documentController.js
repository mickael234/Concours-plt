import asyncHandler from "express-async-handler"
import User from "../../models/User.js"
import Document from "../../models/Document.js"

// @desc    Obtenir tous les documents téléchargés par un utilisateur
// @route   GET /api/user/documents
// @access  Private
const getUserDocuments = asyncHandler(async (req, res) => {
  try {
    console.log("Récupération des documents pour l'utilisateur:", req.user._id)

    const user = await User.findById(req.user._id).populate({
      path: "downloadedDocuments",
      select: "title description fileUrl fileType createdAt downloads price type",
      populate: {
        path: "business",
        select: "name structureName logo",
      },
    })

    if (!user) {
      console.log("Utilisateur non trouvé")
      res.status(404)
      throw new Error("Utilisateur non trouvé")
    }

    console.log(`${user.downloadedDocuments?.length || 0} documents trouvés pour l'utilisateur`)
    res.json(user.downloadedDocuments || [])
  } catch (error) {
    console.error("Erreur lors de la récupération des documents de l'utilisateur:", error)
    res.status(500)
    throw new Error("Erreur lors de la récupération des documents de l'utilisateur: " + error.message)
  }
})

// @desc    Ajouter un document téléchargé à un utilisateur
// @route   POST /api/user/documents
// @access  Private
const addUserDocument = asyncHandler(async (req, res) => {
  try {
    const { documentId } = req.body
    console.log("Ajout du document", documentId, "pour l'utilisateur", req.user._id)

    if (!documentId) {
      res.status(400)
      throw new Error("ID du document requis")
    }

    const document = await Document.findById(documentId)

    if (!document) {
      console.log("Document non trouvé:", documentId)
      res.status(404)
      throw new Error("Document non trouvé")
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      console.log("Utilisateur non trouvé")
      res.status(404)
      throw new Error("Utilisateur non trouvé")
    }

    // Vérifier si le document est déjà téléchargé
    const documentExists =
      user.downloadedDocuments && user.downloadedDocuments.some((doc) => doc.toString() === documentId)

    if (documentExists) {
      console.log("Document déjà téléchargé, incrémentation du compteur uniquement")
      // Incrémenter le compteur de téléchargements du document même si déjà téléchargé
      document.downloads = (document.downloads || 0) + 1
      await document.save()

      return res.status(200).json({
        message: "Compteur de téléchargements incrémenté",
        document: document,
        alreadyDownloaded: true,
      })
    }

    // Ajouter le document à la liste des documents téléchargés
    if (!user.downloadedDocuments) {
      user.downloadedDocuments = []
    }

    user.downloadedDocuments.push(documentId)

    // Incrémenter le compteur de téléchargements du document
    document.downloads = (document.downloads || 0) + 1
    await document.save()
    console.log("Compteur de téléchargements incrémenté pour le document:", documentId)

    await user.save()
    console.log("Document ajouté avec succès à la bibliothèque de l'utilisateur")

    res.status(201).json({
      message: "Document ajouté avec succès",
      document: document,
      alreadyDownloaded: false,
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout du document:", error)
    res.status(500)
    throw new Error("Erreur lors de l'ajout du document: " + error.message)
  }
})

// @desc    Supprimer un document téléchargé d'un utilisateur
// @route   DELETE /api/user/documents/:id
// @access  Private
const deleteUserDocument = asyncHandler(async (req, res) => {
  try {
    const documentId = req.params.id
    console.log("Suppression du document", documentId, "pour l'utilisateur", req.user._id)

    const user = await User.findById(req.user._id)

    if (!user) {
      console.log("Utilisateur non trouvé")
      res.status(404)
      throw new Error("Utilisateur non trouvé")
    }

    if (!user.downloadedDocuments) {
      console.log("Aucun document trouvé pour l'utilisateur")
      res.status(404)
      throw new Error("Aucun document trouvé")
    }

    // Filtrer les documents pour supprimer celui avec l'ID spécifié
    user.downloadedDocuments = user.downloadedDocuments.filter((doc) => doc.toString() !== documentId)

    await user.save()
    console.log("Document supprimé avec succès de la bibliothèque de l'utilisateur")

    res.json({ message: "Document supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error)
    res.status(500)
    throw new Error("Erreur lors de la suppression du document: " + error.message)
  }
})

export { getUserDocuments, addUserDocument, deleteUserDocument }
