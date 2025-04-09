// Middleware pour gérer les routes non trouvées
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  console.error(`Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Middleware pour gérer les erreurs
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  console.error(`Error: ${err.message}`)
  console.error(`Stack: ${err.stack}`)
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
}

export { notFound, errorHandler }

