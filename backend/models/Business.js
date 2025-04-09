import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const businessSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    structureName: {
      type: String,
      required: false, // Rendre ce champ optionnel
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: "",
    },
    presentation: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    socialMedia: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    activities: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    birthDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Champs virtuels pour les formations et documents
businessSchema.virtual("formations", {
  ref: "Formation",
  localField: "_id",
  foreignField: "business",
})

businessSchema.virtual("documents", {
  ref: "Document",
  localField: "_id",
  foreignField: "business",
})

// Méthode pour comparer les mots de passe
businessSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Middleware pour hacher le mot de passe avant l'enregistrement
businessSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Middleware pour mapper structureName à name si name n'est pas fourni
businessSchema.pre("validate", function (next) {
  if (!this.name && this.structureName) {
    this.name = this.structureName
  }
  next()
})

const Business = mongoose.model("Business", businessSchema)

export default Business

