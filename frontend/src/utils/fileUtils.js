import api from "../services/api"

export const uploadImage = async (file) => {
  try {
    console.log("Uploading image to:", `${api.defaults.baseURL}/upload`)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "image")

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Upload response status:", response.status)
    console.log("Upload response body:", response.data)

    if (response.status !== 200) {
      throw new Error(`Image upload failed: ${response.status} ${response.statusText}`)
    }

    // Get the URL from the response
    let imageUrl = response.data.url

    // Fix the URL path - remove /api/ if it's in the uploads path
    if (imageUrl && imageUrl.includes("/api/uploads/")) {
      imageUrl = imageUrl.replace("/api/uploads/", "/uploads/")
    }

    // If the URL doesn't start with http, add the base URL
    if (imageUrl && !imageUrl.startsWith("http")) {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"
      imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
    }

    console.log("Final image URL:", imageUrl)
    return imageUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

export const uploadFile = async (file, type = "document") => {
  try {
    console.log(`Uploading ${type} to:`, `${api.defaults.baseURL}/upload`)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    console.log("Upload response status:", response.status)
    console.log("Upload response body:", response.data)

    // Get the URL from the response
    let fileUrl = response.data.url

    // Fix the URL path - remove /api/ if it's in the uploads path
    if (fileUrl && fileUrl.includes("/api/uploads/")) {
      fileUrl = fileUrl.replace("/api/uploads/", "/uploads/")
    }

    // If the URL doesn't start with http, add the base URL
    if (fileUrl && !fileUrl.startsWith("http")) {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"
      fileUrl = `${baseUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`
    }

    console.log("Final file URL:", fileUrl)
    return fileUrl
  } catch (error) {
    console.error(`Error uploading ${type}:`, error)
    throw error
  }
}

export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Validate file size and type
export const validateFile = (file, maxSizeMB = 10, allowedTypes = null) => {
  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `La taille du fichier dépasse la limite de ${maxSizeMB}MB`,
    }
  }

  // Check file type if allowedTypes is provided
  if (allowedTypes) {
    const fileExt = getFileExtension(file.name).toLowerCase()
    if (!allowedTypes.includes(fileExt)) {
      return {
        isValid: false,
        error: `Type de fichier non pris en charge. Veuillez télécharger ${allowedTypes.join(", ")}`,
      }
    }
  }

  return { isValid: true }
}
export const fixFormationImageUrl = (url) => {
  if (!url) return "/placeholder.svg?height=300&width=600"

  // Vérifier si l'URL est déjà absolue
  if (url.startsWith("http")) {
    return url
  }

  // Ajouter le préfixe du serveur si l'URL est relative
  const serverBaseUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000"
  const fixedUrl = url.startsWith("/") ? `${serverBaseUrl}${url}` : `${serverBaseUrl}/${url}`

  console.log("URL d'image corrigée:", fixedUrl)
  return fixedUrl
}


// Helper function to fix image URLs
export const fixImageUrl = (url) => {
  if (!url) return "/placeholder.svg"

  // Fix the URL path - remove /api/ if it's in the uploads path
  if (url.includes("/api/uploads/")) {
    url = url.replace("/api/uploads/", "/uploads/")
  }

  // If the URL doesn't start with http, add the base URL
  if (!url.startsWith("http")) {
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"
    url = `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
  }

  return url
}

