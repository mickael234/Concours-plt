import api from "./api" // Import api correctly

const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData)
    return response.data
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials)
    const { token, refreshToken } = response.data
    localStorage.setItem("token", token)
    localStorage.setItem("refreshToken", refreshToken)
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    return response.data
  } catch (error) {
    console.error("Error logging in:", error)
    throw error
  }
}

const logout = async () => {
  try {
    await api.post("/auth/logout")
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    delete api.defaults.headers.common["Authorization"]
  } catch (error) {
    console.error("Error logging out:", error)
    throw error
  }
}

export { register, login, logout }

