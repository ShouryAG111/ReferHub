"use client"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const onLogout = () => {
    logout()
    navigate("/login")
  }

  const authLinks = (
    <>
      {user?.role === "jobseeker" && location.pathname !== "/jobseeker/dashboard" && (
        <li className="nav-item">
          <Link className="nav-link" to="/jobseeker/dashboard">
            <i className="fas fa-chart-line me-2"></i>
            Dashboard
          </Link>
        </li>
      )}
      {user?.role === "employer" && location.pathname !== "/employer/dashboard" && (
        <li className="nav-item">
          <Link className="nav-link" to="/employer/dashboard">
            <i className="fas fa-chart-line me-2"></i>
            Dashboard
          </Link>
        </li>
      )}
      <li className="nav-item dropdown">
        <a
          className="nav-link dropdown-toggle d-flex align-items-center"
          href="#"
          id="navbarDropdown"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <div className="d-flex align-items-center">
            <div
              className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ width: "32px", height: "32px", fontSize: "14px", color: "white" }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="d-none d-md-inline">{user?.name}</span>
          </div>
        </a>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
          <li>
            <div className="dropdown-header">
              <div className="fw-semibold">{user?.name}</div>
              <div className="text-muted small">{user?.email}</div>
            </div>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <Link className="dropdown-item" to="/profile">
              <i className="fas fa-user me-2"></i>
              My Profile
            </Link>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <a href="#!" onClick={onLogout} className="dropdown-item text-danger">
              <i className="fas fa-sign-out-alt me-2"></i>
              Sign Out
            </a>
          </li>
        </ul>
      </li>
    </>
  )

  const guestLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/login">
          Sign In
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link btn btn-primary text-white ms-2" to="/register">
          Get Started
        </Link>
      </li>
    </>
  )

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: "#e9f2ff", // Soft light-blue
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div
            className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
            style={{ width: "36px", height: "36px", fontSize: "18px", color: "white" }}
          >
            <i className="fas fa-briefcase"></i>
          </div>
          <span className="fw-bold text-primary">ReferHub</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          style={{ boxShadow: "none" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated ? authLinks : guestLinks}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
