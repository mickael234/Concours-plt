export const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
  
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
  
      if (!response.ok) {
        throw new Error("Image upload failed")
      }
  
      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }
  
  export const uploadFile = async (file, type) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)
  
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
  
      if (!response.ok) {
        throw new Error("File upload failed")
      }
  
      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }
  
  export const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
  }
  
  