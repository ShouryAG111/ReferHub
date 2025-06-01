"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const JobPostForm = () => {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    jobId: "",
    jobUrl: "",
    location: "",
    skills: "",
    description: "",
  })

  const { company, position, jobId, jobUrl, location, skills, description } = formData
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Convert skills string to array
      const jobData = {
        ...formData,
        skills: skills.split(",").map((skill) => skill.trim()),
      }

      await axios.post("/api/jobs", jobData)
      setLoading(false)

      toast.success("Job posted successfully! Your profile information has been automatically included. 🎉")
      navigate("/jobseeker/dashboard")
    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Failed to post job"
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Post Your Job</h2>

            {/* Simplified notice */}
            <div className="alert alert-info mb-4">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Note:</strong> Your profile information (experience, current company, LinkedIn) will be
              automatically included with this job post to help employers understand your background.
            </div>

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="company" className="form-label">
                  Company Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company"
                  name="company"
                  value={company}
                  onChange={onChange}
                  placeholder="e.g., Google, Microsoft, Apple"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="position" className="form-label">
                  Position *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="position"
                  name="position"
                  value={position}
                  onChange={onChange}
                  placeholder="e.g., Senior Software Engineer, Product Manager"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="location" className="form-label">
                  Location *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={location}
                  onChange={onChange}
                  placeholder="e.g., San Francisco, CA or Remote"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="jobId" className="form-label">
                  Job ID *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="jobId"
                  name="jobId"
                  value={jobId}
                  onChange={onChange}
                  placeholder="e.g., JOB-2024-001, REF-12345"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="jobUrl" className="form-label">
                  Job URL *
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="jobUrl"
                  name="jobUrl"
                  value={jobUrl}
                  onChange={onChange}
                  placeholder="https://company.com/careers/job-posting"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="skills" className="form-label">
                  Skills (comma separated) *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="skills"
                  name="skills"
                  value={skills}
                  onChange={onChange}
                  placeholder="React, Node.js, MongoDB, AWS"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                 Why Me / Resume Link
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={description}
                  onChange={onChange}
                  rows="4"
                  placeholder="Describe the role, responsibilities, and what makes this your dream job..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Posting...
                  </>
                ) : (
                  "Post Job"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobPostForm
