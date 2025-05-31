"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"

const ReferralDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        setLoading(true)
        console.log(`Fetching referral details for ID: ${id}`)

        const res = await axios.get(`/api/referrals/${id}`)
        console.log("Referral data received:", res.data)

        setReferral(res.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching referral details:", err)
        toast.error("Failed to fetch referral details")
        setLoading(false)
        navigate("/jobseeker/dashboard")
      }
    }

    if (id) {
      fetchReferral()
    }
  }, [id, navigate])

  const handleReferralAction = async (status) => {
    try {
      setActionLoading(true)
      await axios.put(`/api/referrals/${id}`, { status })

      setReferral({ ...referral, status })
      setActionLoading(false)

      const actionText = status === "accepted" ? "accepted" : "rejected"

      if (status === "rejected") {
        toast.info(`Referral ${actionText}. It will be automatically removed after 1 day.`)
      } else {
        toast.success(`Referral ${actionText} successfully! You can now contact the employer.`)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Failed to update referral status"
      toast.error(errorMessage)
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
        <p className="mt-2">Loading referral details...</p>
      </div>
    )
  }

  if (!referral) {
    return (
      <div className="alert alert-danger">
        <h4>Referral Not Found</h4>
        <p>The referral you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/jobseeker/dashboard")} className="btn btn-outline-secondary mt-3">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-10">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Referral Details</h2>
          <button onClick={() => navigate("/jobseeker/dashboard")} className="btn btn-outline-secondary">
            Back
          </button>
        </div>

        {/* Referral Status */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">Status</h4>
              <span
                className={`badge fs-6 bg-${
                  referral.status === "pending" ? "warning" : referral.status === "accepted" ? "success" : "danger"
                }`}
              >
                {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
              </span>
            </div>
            <p className="text-muted mt-2">Received on: {new Date(referral.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="row">
          {/* Job Information */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h4 className="card-title mb-0">
                  <i className="fas fa-briefcase me-2"></i>
                  Job Information
                </h4>
              </div>
              <div className="card-body">
                <h5>{referral.job.position}</h5>
                <p className="mb-2">
                  <strong>Company:</strong> {referral.job.company}
                </p>
                <p className="mb-2">
                  <strong>Location:</strong> {referral.job.location}
                </p>
                <p className="mb-2">
                  <strong>Job ID:</strong> {referral.job.jobId}
                </p>
                <p className="mb-2">
                  <strong>Job URL:</strong>{" "}
                  <a href={referral.job.jobUrl} target="_blank" rel="noopener noreferrer">
                    LINK
                  </a>
                </p>
                <div className="mb-2">
                  <strong>Skills:</strong>
                  <div className="mt-1">
                    {referral.job.skills.map((skill, index) => (
                      <span key={index} className="badge bg-primary me-1 mb-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Why Me</strong>
                  <p className="mt-1">{referral.job.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employer Information */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h4 className="card-title mb-0">
                  <i className="fas fa-user-tie me-2"></i>
                  Referrer Information
                </h4>
              </div>
              <div className="card-body">
                <h5>{referral.employer.name}</h5>

                <div className="mb-3">
                  <p className="mb-2">
                    <strong>
                      <i className="fas fa-envelope me-2"></i>
                      Email:
                    </strong>{" "}
                    <a href={`mailto:${referral.employer.email}`} className="text-decoration-none">
                      {referral.employer.email}
                    </a>
                  </p>

                  <p className="mb-2">
                    <strong>
                      <i className="fas fa-briefcase me-2"></i>
                      Years of Experience:
                    </strong>{" "}
                    {referral.employer.yearsOfExperience !== undefined
                      ? `${referral.employer.yearsOfExperience} years`
                      : "Not specified"}
                  </p>

                  <p className="mb-2">
                    <strong>
                      <i className="fas fa-building me-2"></i>
                      Current Company:
                    </strong>{" "}
                    {referral.employer.currentCompany || "Not specified"}
                  </p>

                  {referral.employer.linkedinProfile && (
                    <p className="mb-2">
                      <strong>
                        <i className="fab fa-linkedin me-2"></i>
                        LinkedIn Profile:
                      </strong>{" "}
                      <a
                        href={referral.employer.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        View Profile
                      </a>
                    </p>
                  )}
                </div>

                {/* Contact Actions */}
                <div className="border-top pt-3">
                  <h6 className="mb-3">Contact Options:</h6>
                  <div className="d-grid gap-2">
                    <a
                      href={`mailto:${referral.employer.email}?subject=Regarding Referral for ${referral.job.position} at ${referral.job.company}&body=Hi ${referral.employer.name},%0D%0A%0D%0AThank you for the referral for the ${referral.job.position} position at ${referral.job.company}. I would love to discuss this opportunity with you.%0D%0A%0D%0ABest regards,%0D%0A${user?.name}`}
                      className="btn btn-outline-primary"
                    >
                      <i className="fas fa-envelope me-2"></i>
                      Send Email
                    </a>

                    {referral.employer.linkedinProfile && (
                      <a
                        href={referral.employer.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-info"
                      >
                        <i className="fab fa-linkedin me-2"></i>
                        Connect on LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {referral.status === "pending" && (
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Take Action</h5>
              <p className="text-muted">
                Review the employer's information and decide whether to accept or reject this referral.
              </p>
              <div className="d-flex gap-3">
                <button
                  onClick={() => handleReferralAction("accepted")}
                  className="btn btn-success"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Accept Referral
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReferralAction("rejected")}
                  className="btn btn-danger"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times me-2"></i>
                      Reject Referral
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {referral.status === "accepted" && (
          <div className="alert alert-success">
            <h5 className="alert-heading">
              <i className="fas fa-check-circle me-2"></i>
              Referral Accepted
            </h5>
            <p className="mb-0">
              You have accepted this referral. You can now contact the employer using the information provided above.
            </p>
          </div>
        )}

        {referral.status === "rejected" && (
          <div className="alert alert-danger">
            <h5 className="alert-heading">
              <i className="fas fa-times-circle me-2"></i>
              Referral Rejected
            </h5>
            <p className="mb-0">
              
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferralDetails
