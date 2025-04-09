import mongoose from "mongoose"

const documentSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["pdf", "doc", "ppt", "xls", "image", "video", "audio", "other"],
      default: "pdf",
    },
    fileUrl: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    concours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Concours",
      },
    ],
    // Ajoutez ces champs pour les notes et avis
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rating: {
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

const Document = mongoose.model("Document", documentSchema)

export default Document

