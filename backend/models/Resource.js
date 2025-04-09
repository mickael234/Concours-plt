import mongoose from "mongoose"

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["course", "past_paper", "document", "other"],
      default: "document",
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    subject: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      default: "ORG CI",
    },
    concoursId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concours",
    },
    ratings: [
      {
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
        createdAt: {
          type: Date,
          default: Date.now,
        },
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
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const Resource = mongoose.model("Resource", resourceSchema)

export default Resource

