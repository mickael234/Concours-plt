import dbConnect from "../../../../config/db"
import Concours from "../../../../models/Concours"

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req

  await dbConnect()

  switch (method) {
    case "POST":
      try {
        const concours = await Concours.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
        if (!concours) {
          return res.status(404).json({ success: false, message: "Concours not found" })
        }
        res.status(200).json({ success: true, data: concours })
      } catch (error) {
        res.status(400).json({ success: false, message: error.message })
      }
      break
    default:
      res.status(400).json({ success: false, message: "Invalid method" })
      break
  }
}

