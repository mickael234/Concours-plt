const mongoose = require("mongoose")

const educationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["completed", "ongoing"],
      default: "completed",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    type: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["completed", "ongoing"],
      default: "completed",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    type: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

// Mettre à jour le schéma User pour inclure education et experience
const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    education: [educationSchema],
    experience: [experienceSchema],
    profileCompletion: {
      type: Number,
      default: 0,
    },
    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      newConcours: {
        type: Boolean,
        default: true,
      },
      concoursUpdates: {
        type: Boolean,
        default: true,
      },
      newDocuments: {
        type: Boolean,
        default: true,
      },
      newFormations: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true },
)

// Calculer le pourcentage de complétion du profil
userProfileSchema.methods.calculateProfileCompletion = function () {
  let completedFields = 0
  let totalFields = 0

  // Vérifier les champs de l'utilisateur associé
  const user = this.user
  if (user) {
    if (user.firstName) completedFields++
    if (user.lastName) completedFields++
    if (user.email) completedFields++
    if (user.phone) completedFields++
    if (user.address) completedFields++
    if (user.city) completedFields++
    if (user.country) completedFields++
    totalFields += 7
  }

  // Vérifier les formations et expériences
  if (this.education && this.education.length > 0) completedFields += 2
  if (this.experience && this.experience.length > 0) completedFields += 2
  totalFields += 4

  // Calculer le pourcentage
  this.profileCompletion = Math.round((completedFields / totalFields) * 100)
  return this.profileCompletion
}

const UserProfile = mongoose.model("UserProfile", userProfileSchema)

module.exports = UserProfile

