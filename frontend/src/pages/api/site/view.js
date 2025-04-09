import dbConnect from "../../../utils/dbConnect"
import SiteStats from "../../../models/SiteStats"

export default async function handler(req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case "POST":
      try {
        let siteStats = await SiteStats.findOne()
        if (!siteStats) {
          siteStats = new SiteStats()
        }
        siteStats.totalVisits += 1
        await siteStats.save()
        res.status(200).json({ success: true, data: siteStats })
      } catch (error) {
        res.status(400).json({ success: false, message: error.message })
      }
      break
    default:
      res.status(400).json({ success: false, message: "Invalid method" })
      break
  }
}

