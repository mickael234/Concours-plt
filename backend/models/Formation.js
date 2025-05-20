import mongoose from "mongoose"
import { calculateAverageRating } from "../utils/ratingUtils.js"

// Modifiez le schéma de rating pour inclure la réponse de l'entreprise et la réponse de l'utilisateur
const ratingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Ajout du champ pour la réponse de l'entreprise
  businessResponse: {
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },
    // Ajout du champ pour la réponse de l'utilisateur à la réponse de l'entreprise
    userReply: {
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
})

const formationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["online", "inperson", "hybrid"],
    },
    places: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all",
    },
    onlinePlatform: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    additionalComment: {
      type: String,
      default: "",
    },
    hasMultipleMonths: {
      type: Boolean,
      default: false,
    },
    concours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Concours",
      },
    ],
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    ratings: [ratingSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    objectives: [String],
    prerequisites: [String],
    program: [
      {
        title: String,
        description: String,
        topics: [String],
      },
    ],
    instructor: {
      name: String,
      title: String,
      bio: String,
      avatar: String,
    },
    certifications: [String],
    documents: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    // Ajout d'un champ pour stocker le nombre d'inscriptions
    inscriptionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Champ virtuel pour compter les inscriptions
formationSchema.virtual("inscriptions", {
  ref: "Inscription",
  localField: "_id",
  foreignField: "formation",
  count: true,
})

// Méthode pour calculer la note moyenne
formationSchema.methods.calculateAverageRating = function () {
  this.rating = calculateAverageRating(this.ratings)
  this.numReviews = this.ratings.length
}

// Middleware pre-save pour calculer la note moyenne
formationSchema.pre("save", function (next) {
  if (this.isModified("ratings")) {
    this.calculateAverageRating()
  }
  next()
})

const Formation = mongoose.model("Formation", formationSchema)

export default Formation