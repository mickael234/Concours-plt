import express from "express"
import axios from "axios"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", protect, async (req, res) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ message: "URL parameter is required" })
  }

  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    })

    res.setHeader("Content-Type", response.headers["content-type"])
    res.setHeader("Content-Disposition", response.headers["content-disposition"])

    response.data.pipe(res)
  } catch (error) {
    console.error("Error downloading file:", error)
    res.status(500).json({ message: "Error downloading file" })
  }
})

export default router

