"use client"

import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"




const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  useEffect(() => {
    const checkLoggedIn = async () => {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      if (token) {
        try {
          axios.defaults.headers.common["x-auth-token"] = token
          const res = await axios.get("/api/auth")
          setUser(res.data)
          setIsAuthenticated(true)
          console.log("User authenticated from token:", res.data.name)
        } catch (err) {
          console.error("Token validation failed:", err)
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["x-auth-token"]
          setUser(null)
          setIsAuthenticated(false)

          if (err.response?.status !== 401) {
            toast.error("Session expired. Please login again.")
          }
        }
      } else {
        console.log("No token found in localStorage")
        setUser(null)
        setIsAuthenticated(false)
      }

      setIsLoading(false)
      setInitialLoadComplete(true)
    }

    checkLoggedIn()
  }, [])

  const register = async (userData) => {
    try {
      console.log("Attempting to register with data:", userData)
      const res = await axios.post("/api/users", userData)

      localStorage.setItem("token", res.data.token)
      axios.defaults.headers.common["x-auth-token"] = res.data.token

      const userRes = await axios.get("/api/auth")
      setUser(userRes.data)
      setIsAuthenticated(true)

      toast.success(`Welcome ${userRes.data.name}! Registration successful.`)
      return { success: true, user: userRes.data }
    } catch (err) {
      console.error("Registration error:", err)
      const errorMessage = err.response?.data?.msg || "Registration failed"
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const login = async (email, password) => {
    try {
      console.log("Attempting to login with email:", email)
      const res = await axios.post("/api/auth", { email, password })

      localStorage.setItem("token", res.data.token)
      axios.defaults.headers.common["x-auth-token"] = res.data.token

      const userRes = await axios.get("/api/auth")
      setUser(userRes.data)
      setIsAuthenticated(true)

      toast.success(`Welcome back, ${userRes.data.name}!`)
      return { success: true, user: userRes.data }
    } catch (err) {
      console.error("Login error:", err)
      const errorMessage = err.response?.data?.msg || "Invalid credentials"
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["x-auth-token"]
    setUser(null)
    setIsAuthenticated(false)
    toast.info("You have been logged out successfully.")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        initialLoadComplete,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
