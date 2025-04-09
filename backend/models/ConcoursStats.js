import mongoose from "mongoose"

const concoursStatsSchema = new mongoose.Schema(
  {
    concoursId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concours",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    numRatings: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        userId: {
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
        user: {
          _id: mongoose.Schema.Types.ObjectId,
          name: String,
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
  },
  {
    timestamps: true,
  },
)

const ConcoursStats = mongoose.models.ConcoursStats || mongoose.model("ConcoursStats", concoursStatsSchema)

export default ConcoursStats

