import mongoose from "mongoose"

const establishmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de l'établissement est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description de l'établissement est requise"],
    },
    logo: {
      type: String,
      default: null,
    },
    website: {
      type: String,
    },
    country: {
      type: String,
      required: [true, "Le pays est requis"],
      trim: true,
    },
    contact: {
      address: String,
      phone: String,
      email: String,
    },
    socialMedia: [
      {
        platform: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    concours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Concours",
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        teaching: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        employability: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        network: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
    averageRatings: {
      teaching: { type: Number, default: 0 },
      employability: { type: Number, default: 0 },
      network: { type: Number, default: 0 },
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

const Establishment = mongoose.models.Establishment || mongoose.model("Establishment", establishmentSchema)

export default Establishment

