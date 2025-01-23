import axios from "axios"

const API_URL = "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem("refreshToken")
        const response = await axios.post(`${API_URL}/users/refresh-token`, { refreshToken })
        const { token } = response.data
        localStorage.setItem("token", token)
        api.defaults.headers["Authorization"] = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh token is invalid, logout the user
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error("API Error:", error.response.data)
    throw new Error(error.response.data.message || "An error occurred")
  } else if (error.request) {
    // The request was made but no response was received
    console.error("API Error: No response received")
    throw new Error("No response received from server")
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("API Error:", error.message)
    throw new Error("Error setting up the request")
  }
}

export const getConcours = () => api.get("/concours").catch(handleApiError)
export const getConcoursById = (id) => api.get(`/concours/${id}`).catch(handleApiError)
export const createConcours = (data) => api.post("/concours", data).catch(handleApiError)
export const updateConcours = (id, data) => api.put(`/concours/${id}`, data).catch(handleApiError)
export const deleteConcours = (id) => api.delete(`/concours/${id}`).catch(handleApiError)

export const getEstablishments = () => api.get("/establishments").catch(handleApiError)
export const getEstablishmentById = (id) => api.get(`/establishments/${id}`).catch(handleApiError)
export const createEstablishment = (data) => api.post("/establishments", data).catch(handleApiError)
export const updateEstablishment = (id, data) => api.put(`/establishments/${id}`, data).catch(handleApiError)
export const deleteEstablishment = (id) => api.delete(`/establishments/${id}`).catch(handleApiError)

export const getResources = () => api.get("/resources").catch(handleApiError)
export const getResourceById = (id) => api.get(`/resources/${id}`).catch(handleApiError)
export const createResource = (data) => api.post("/resources", data).catch(handleApiError)
export const updateResource = (id, data) => api.put(`/resources/${id}`, data).catch(handleApiError)
export const deleteResource = (id) => api.delete(`/resources/${id}`).catch(handleApiError)

export const register = (userData) => api.post("/users", userData).catch(handleApiError)
export const login = (credentials) => api.post("/users/login", credentials).catch(handleApiError)
export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("refreshToken")
}

export default api

