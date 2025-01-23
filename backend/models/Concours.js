import mongoose from "mongoose"

const concoursSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
    },
    status: {
      type: String,
      enum: ["en_cours", "termine", "a_venir"],
      default: "a_venir",
      required: [true, "Le statut est requis"],
    },
    dateStart: {
      type: Date,
      required: [true, "La date de début est requise"],
    },
    dateEnd: {
      type: Date,
      required: [true, "La date de fin est requise"],
    },
    organizerLogo: {
      type: String,
    },
    organizerName: {
      type: String,
      required: [true, "Le nom de l'organisateur est requis"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["direct", "professionnel"],
      required: [true, "La catégorie est requise"],
    },
    views: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: String,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    numRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const Concours = mongoose.model("Concours", concoursSchema)

export default Concours

