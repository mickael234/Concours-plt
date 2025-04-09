import formidable from "formidable"
import path from "path"
import fs from "fs/promises"

export const config = {
  api: {
    bodyParser: false,
  },
}

const uploadDir = path.join(process.cwd(), "public", "uploads")

export default async function handler(req, res) {
  console.log("Upload API handler called")

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    await fs.mkdir(uploadDir, { recursive: true })

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    })

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err)
        return res.status(500).json({ error: "Error uploading file" })
      }

      const file = files.file
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" })
      }

      const fileName = file.newFilename
      const fileUrl = `/uploads/${fileName}`

      console.log("File uploaded successfully:", fileUrl)
      res.status(200).json({ url: fileUrl })
    })
  } catch (error) {
    console.error("Error in upload handler:", error)
    res.status(500).json({ error: "Server error during upload" })
  }
}

