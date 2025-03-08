import React, { useContext, useState } from "react";
import AuthContext from "../../contextApi/AuthContext";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Register.css";

const Register = () => {
  const { registerUser } = useContext(AuthContext);

  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const togglePassword = () => setPasswordVisible(!passwordVisible);

  const validateForm = () => {
    let errors = {};
    if (formValues.username.trim().length < 3) errors.username = "Username must be at least 3 characters.";
    if (formValues.password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (!/\S+@\S+\.\S+/.test(formValues.email)) errors.email = "Invalid email address.";
    if (formValues.firstName.trim() === "") errors.firstName = "First Name is required.";
    if (formValues.lastName.trim() === "") errors.lastName = "Last Name is required.";
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" })); // Clear field errors on input
    setSubmissionError(""); // Clear global errors
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const response = await registerUser({
      username: formValues.username,
      password: formValues.password,
      email: formValues.email,
      first_name: formValues.firstName,
      last_name: formValues.lastName,
    });

    if (!response.success) {
      if (response.errors) {
        let backendErrors = {};
        Object.keys(response.errors).forEach((key) => {
          backendErrors[key] = response.errors[key].join(', ');
        });
        setFormErrors(backendErrors);
      } else {
        setSubmissionError("An unexpected error occurred. Please try again.");
      }
    } else {
      alert("Registration successful! You can now log in.");
      window.location.href = '/login';
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100">
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center">
          <div className="text-center">
            <h1 className="display-3 text-primary fw-bold">LocalHost</h1>
            <h2 className="text-secondary">
              <span className="text-danger fw-bold">:</span> Blog
            </h2>
            <p className="mt-4 fs-5 text-muted">Welcome to LocalHost Blog! Connect, share, and inspire.</p>
          </div>
        </div>
        <div className="col-lg-4 col-md-8 col-sm-10 mx-auto">
          <div className="card shadow-lg p-4 border-0">
            <form onSubmit={handleRegister}>
              <h3 className="register-header text-center mb-4 text-primary">Create an Account</h3>

              {/* Global Error Message */}
              {submissionError && <div className="alert alert-danger">{submissionError}</div>}

              {/* Username */}
              <div className="mb-3">
                <input
                  type="text"
                  name="username"
                  className={`form-control ${formErrors.username ? "is-invalid" : ""}`}
                  placeholder="Username"
                  value={formValues.username}
                  onChange={handleInputChange}
                />
                <div className="invalid-feedback">{formErrors.username}</div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
                    placeholder="Password"
                    value={formValues.password}
                    onChange={handleInputChange}
                  />
                  <button type="button" className="btn btn-outline-secondary" onClick={togglePassword}>
                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="invalid-feedback">{formErrors.password}</div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                  placeholder="Email"
                  value={formValues.email}
                  onChange={handleInputChange}
                />
                <div className="invalid-feedback">{formErrors.email}</div>
              </div>

              {/* First Name */}
              <div className="mb-3">
                <input
                  type="text"
                  name="firstName"
                  className={`form-control ${formErrors.firstName ? "is-invalid" : ""}`}
                  placeholder="First Name"
                  value={formValues.firstName}
                  onChange={handleInputChange}
                />
                <div className="invalid-feedback">{formErrors.firstName}</div>
              </div>

              {/* Last Name */}
              <div className="mb-3">
                <input
                  type="text"
                  name="lastName"
                  className={`form-control ${formErrors.lastName ? "is-invalid" : ""}`}
                  placeholder="Last Name"
                  value={formValues.lastName}
                  onChange={handleInputChange}
                />
                <div className="invalid-feedback">{formErrors.lastName}</div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary w-100">Register</button>
            </form>

            <p className="text-center mt-3">
              Already have an account? <Link to="/login" className="text-decoration-none">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;