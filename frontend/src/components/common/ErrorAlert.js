import React from "react"

const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="error-alert">
      <p>{message}</p>
      {onClose && (
        <button onClick={onClose} className="close-button">
          Fermer
        </button>
      )}
    </div>
  )
}

export default ErrorAlert

