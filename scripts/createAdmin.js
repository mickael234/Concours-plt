import dotenv from "dotenv"
import colors from "colors"
import User from "../backend/models/User.js"
import connectDB from "../backend/config/db.js"

dotenv.config()

// Connexion à la base de données
connectDB()

const createAdmin = async () => {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: "admin" })

    if (adminExists) {
      console.log(colors.yellow.bold("Un administrateur existe déjà !"))
      console.log(colors.cyan(`Email: ${adminExists.email}`))
      process.exit()
    }

    // Créer un nouvel admin
    const admin = await User.create({
      name: "Administrateur",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    })

    console.log(colors.green.bold("Administrateur créé avec succès !"))
    console.log(colors.cyan(`Email: ${admin.email}`))
    console.log(colors.cyan(`Mot de passe: admin123`))
    console.log(colors.yellow("Veuillez changer ce mot de passe après la première connexion."))

    process.exit()
  } catch (error) {
    console.error(colors.red.bold("Erreur lors de la création de l'administrateur:"))
    console.error(colors.red(error))
    process.exit(1)
  }
}

// Exécuter la fonction
createAdmin()

