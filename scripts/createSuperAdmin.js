import dotenv from "dotenv"
import colors from "colors"
import User from "../backend/models/User.js"
import connectDB from "../backend/config/db.js"

dotenv.config()

// Connexion à la base de données
connectDB()

const createSuperAdmin = async () => {
  try {
    // Vérifier si un superadmin existe déjà
    const superAdminExists = await User.findOne({ role: "superadmin" })

    if (superAdminExists) {
      console.log(colors.yellow.bold("Un super administrateur existe déjà !"))
      console.log(colors.cyan(`Email: ${superAdminExists.email}`))
      process.exit()
    }

    // Créer un nouveau superadmin
    const superAdmin = await User.create({
      name: "Super Administrateur",
      email: "superadmin@example.com",
      password: "superadmin123",
      role: "superadmin",
    })

    console.log(colors.green.bold("Super Administrateur créé avec succès !"))
    console.log(colors.cyan(`Email: ${superAdmin.email}`))
    console.log(colors.cyan(`Mot de passe: superadmin123`))
    console.log(colors.yellow("Veuillez changer ce mot de passe après la première connexion."))

    process.exit()
  } catch (error) {
    console.error(colors.red.bold("Erreur lors de la création du super administrateur:"))
    console.error(colors.red(error))
    process.exit(1)
  }
}

// Exécuter la fonction
createSuperAdmin()

