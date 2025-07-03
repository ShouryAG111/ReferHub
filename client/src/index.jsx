import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import axios from "axios"




// Setting default headers
axios.defaults.headers.post["Content-Type"] = "application/json"

// Add token to headers if it exists in localStorage
const token = localStorage.getItem("token")
if (token) {
  axios.defaults.headers.common["x-auth-token"] = token
}


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
