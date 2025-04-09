import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User.js"

dotenv.config()

// Fonction pour mettre à jour le rôle d'un utilisateur
const updateUserRole = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("Connexion à MongoDB établie")

    // ID de l'utilisateur à mettre à jour
    const userId = "677fa8b23f63696c25dd4d35"

    // Trouver l'utilisateur
    const user = await User.findById(userId)

    if (!user) {
      console.log("Utilisateur non trouvé")
      process.exit(1)
    }

    // Mettre à jour le rôle
    user.role = "superadmin"
    await user.save()

    console.log("Rôle mis à jour avec succès")
    console.log("Utilisateur:", user)

    // Fermer la connexion
    mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error("Erreur:", error)
    process.exit(1)
  }
}

// Exécuter la fonction
updateUserRole()

