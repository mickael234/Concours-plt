import mongoose from "mongoose"
import dotenv from "dotenv"
import Inscription from "../server/models/Inscription.js"
import Formation from "../server/models/Formation.js"

dotenv.config()

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connecté".cyan.underline)
    updateInscriptionAmounts()
  })
  .catch((err) => {
    console.error(`Erreur: ${err.message}`.red.underline.bold)
    process.exit(1)
  })

const updateInscriptionAmounts = async () => {
  try {
    console.log("Mise à jour des montants des inscriptions...".yellow)

    // Récupérer toutes les inscriptions
    const inscriptions = await Inscription.find({ amount: { $eq: 0 } })
    console.log(`${inscriptions.length} inscriptions à mettre à jour`.cyan)

    let updatedCount = 0

    for (const inscription of inscriptions) {
      let amount = 0

      // Si c'est une inscription à une formation
      if (inscription.formation) {
        const formation = await Formation.findById(inscription.formation)
        if (formation && formation.price) {
          amount = formation.price
          console.log(`Formation trouvée: ${formation.title}, prix: ${formation.price} FCFA`)
        }
      }

      // Mettre à jour le montant
      if (amount > 0) {
        inscription.amount = amount
        await inscription.save()
        updatedCount++
        console.log(`Inscription ${inscription._id} mise à jour avec montant: ${amount} FCFA`.green)
      } else {
        console.log(`Aucun montant trouvé pour l'inscription ${inscription._id}`.yellow)
      }
    }

    console.log(`${updatedCount} inscriptions mises à jour avec succès`.green.bold)
    process.exit(0)
  } catch (error) {
    console.error(`Erreur: ${error.message}`.red.bold)
    process.exit(1)
  }
}

