import React, { useContext, useState } from "react";
import AuthContext from "../../contextApi/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import "bootstrap/dist/css/bootstrap.min.css";
import "./Register.css"; // Optional CSS file for additional styling

const Register = () => {
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePassword = () => setPasswordVisible(!passwordVisible);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });

    // Input Validation
    setFormErrors((prev) => ({
      ...prev,
      [name]:
        name === "username" && value.trim().length < 3
          ? "Username must be at least 3 characters long."
          : name === "password" && value.length < 8
          ? "Password must be at least 8 characters long."
          : name === "email" && !/\S+@\S+\.\S+/.test(value)
          ? "Invalid email address."
          : name === "firstName" && value.trim() === ""
          ? "First Name is required."
          : name === "lastName" && value.trim() === ""
          ? "Last Name is required."
          : "",
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    // Check for any validation errors
    if (Object.values(formErrors).some((error) => error) || Object.values(formValues).some((value) => !value.trim())) {
      alert("Please fix all errors before submitting.");
      return;
    }

    try {
      await registerUser({
        username: formValues.username,
        password: formValues.password,
        email: formValues.email,
        first_name: formValues.firstName,
        last_name: formValues.lastName,
      });

      alert("Registration successful! Redirecting to login...");
      navigate("/login"); // Redirect after successful registration
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100">
        {/* Branding Section */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center">
          <div className="text-center">
            <h1 className="display-3 text-primary fw-bold">LocalHost</h1>
            <h2 className="text-secondary">
              <span className="text-danger fw-bold">:</span> Blog
            </h2>
            <p className="mt-4 fs-5 text-muted">Welcome to LocalHost Blog! Connect, share, and inspire.</p>
          </div>
        </div>

        {/* Registration Form Section */}
        <div className="col-lg-4 col-md-8 col-sm-10 mx-auto">
          <div className="card shadow-lg p-4 border-0">
            <form onSubmit={handleRegister}>
              <h3 className="register-header text-center mb-4 text-primary">Register</h3>

              {/* Username */}
              <input
                type="text"
                name="username"
                className={`form-control mb-3 ${formErrors.username ? "is-invalid" : ""}`}
                placeholder="Username"
                value={formValues.username}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">{formErrors.username}</div>

              {/* Password */}
              <div className="input-group mb-3">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
                  placeholder="Password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={togglePassword}
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="invalid-feedback">{formErrors.password}</div>
              </div>

              {/* Email */}
              <input
                type="email"
                name="email"
                className={`form-control mb-3 ${formErrors.email ? "is-invalid" : ""}`}
                placeholder="Email"
                value={formValues.email}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">{formErrors.email}</div>

              {/* First Name */}
              <input
                type="text"
                name="firstName"
                className={`form-control mb-3 ${formErrors.firstName ? "is-invalid" : ""}`}
                placeholder="First Name"
                value={formValues.firstName}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">{formErrors.firstName}</div>

              {/* Last Name */}
              <input
                type="text"
                name="lastName"
                className={`form-control mb-3 ${formErrors.lastName ? "is-invalid" : ""}`}
                placeholder="Last Name"
                value={formValues.lastName}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">{formErrors.lastName}</div>

              {/* Register Button */}
              <button type="submit" className="btn btn-primary w-100 mb-3">Register</button>
            </form>

            <p className="text-center">
              Already a user? <Link to="/login" className="text-decoration-none">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
