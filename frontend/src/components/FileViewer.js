"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

const FileViewer = () => {
  const { filename } = useParams()
  const [fileUrl, setFileUrl] = useState("")

  useEffect(() => {
    const fullUrl = `${process.env.REACT_APP_API_URL}/file/${filename}`
    setFileUrl(fullUrl)
  }, [filename])

  if (!fileUrl) {
    return <div>Loading...</div>
  }

  return (
    <div className="file-viewer">
      <iframe src={fileUrl} title="File Viewer" width="100%" height="600px" style={{ border: "none" }} />
    </div>
  )
}

export default FileViewer

