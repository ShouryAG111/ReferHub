import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import axios from "axios"

// Set base URL for axios - make sure this matches your server port
axios.defaults.baseURL = "https://referhub.onrender.com"

// Set default headers
axios.defaults.headers.post["Content-Type"] = "application/json"

// Add token to headers if it exists in localStorage
const token = localStorage.getItem("token")
if (token) {
  axios.defaults.headers.common["x-auth-token"] = token
}

// Add request interceptor for debugging  
axios.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url)
    console.log("Request data:", config.data)
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.data)
    return response
  },
  (error) => {
    console.error("Response error:", error.response?.data)
    return Promise.reject(error)
  },
)

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
