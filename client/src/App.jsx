import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Login from "./components/Login"
import Register from "./components/Register"
import Profile from "./components/Profile"
import JobSeekerDashboard from "./components/JobSeekerDashboard"
import EmployerDashboard from "./components/EmployerDashboard"
import JobDetails from "./components/JobDetails"
import JobPostForm from "./components/JobPostForm"
import ReferralDetails from "./components/ReferralDetails"

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, initialLoadComplete } = useAuth()
  const location = useLocation()

 
  if (isLoading || !initialLoadComplete) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If authenticated but role not allowed, redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectTo = user.role === "jobseeker" ? "/jobseeker/dashboard" : "/employer/dashboard"
    return <Navigate to={redirectTo} replace />
  }

  return children
}

// Public route component for login register
const PublicRoute = ({ children }) =>{
  const { isLoading, initialLoadComplete } = useAuth()

// Show loading spinner while checking authentication
  if (isLoading || !initialLoadComplete) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading...</p>
      </div>
    )
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="container">
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobseeker/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["jobseeker"]}>
                    <JobSeekerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobseeker/post"
                element={
                  <ProtectedRoute allowedRoles={["jobseeker"]}>
                    <JobPostForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job/:id"
                element={
                  <ProtectedRoute allowedRoles={["employer", "jobseeker"]}>
                    <JobDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/referral/:id"
                element={
                  <ProtectedRoute allowedRoles={["jobseeker"]}>
                    <ReferralDetails />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
