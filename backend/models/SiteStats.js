import mongoose from "mongoose"

const siteStatsSchema = mongoose.Schema(
  {
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const SiteStats = mongoose.model("SiteStats", siteStatsSchema)

export default SiteStats

