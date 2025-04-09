import mongoose from "mongoose"

const inscriptionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    formation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formation",
    },
    concours: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concours",
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },
    type: {
      type: String,
      enum: ["formation", "concours"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["mobile_money", "card", "bank_transfer", "cash"],
      default: "mobile_money",
    },
    paymentReference: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    amount: {
      type: Number,
      default: 0,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    birthDate: {
      type: Date,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    motivation: {
      type: String,
    },
    notes: {
      type: String,
    },
    selectedMonths: [String],
  },
  {
    timestamps: true,
  },
)

// Middleware pre-save pour définir automatiquement le montant à partir du prix de la formation
inscriptionSchema.pre("save", async function (next) {
  // Si le montant est déjà défini et n'est pas 0, on ne fait rien
  if (this.amount > 0) {
    return next()
  }

  try {
    // Si c'est une inscription à une formation
    if (this.formation) {
      const Formation = mongoose.model("Formation")
      const formation = await Formation.findById(this.formation)
      if (formation && formation.price) {
        this.amount = formation.price
        console.log(`Montant défini automatiquement à partir du prix de la formation: ${this.amount} FCFA`)
      }
    }

    // Si c'est une inscription à un concours
    if (this.concours) {
      const Concours = mongoose.model("Concours")
      const concours = await Concours.findById(this.concours)
      if (concours && concours.price) {
        this.amount = concours.price
        console.log(`Montant défini automatiquement à partir du prix du concours: ${this.amount} FCFA`)
      }
    }

    next()
  } catch (error) {
    console.error("Erreur lors de la définition automatique du montant:", error)
    next(error)
  }
})

const Inscription = mongoose.model("Inscription", inscriptionSchema)

export default Inscription

