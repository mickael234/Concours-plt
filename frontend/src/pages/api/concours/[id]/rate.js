import dbConnect from "../../../../utils/dbConnect"
import Concours from "../../../../models/Concours"
import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  const {
    query: { id },
    method,
    body: { rating, comment },
  } = req

  await dbConnect()

  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  switch (method) {
    case "POST":
      try {
        const concours = await Concours.findById(id)
        if (!concours) {
          return res.status(404).json({ success: false, message: "Concours not found" })
        }

        const existingRatingIndex = concours.ratings.findIndex((r) => r.user.toString() === session.user.id)
        if (existingRatingIndex > -1) {
          concours.ratings[existingRatingIndex] = { user: session.user.id, rating, comment }
        } else {
          concours.ratings.push({ user: session.user.id, rating, comment })
        }

        concours.averageRating = concours.ratings.reduce((acc, curr) => acc + curr.rating, 0) / concours.ratings.length
        concours.numRatings = concours.ratings.length

        await concours.save()
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

