import React, { useContext, useState } from "react";
import AuthContext from "../../contextApi/AuthContext";
import { Link, useNavigate } from "react-router-dom";
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });

    // Validate input fields
    if (name === "username" && value.trim().length < 3) {
      setFormErrors((prev) => ({
        ...prev,
        username: "Username must be at least 3 characters long.",
      }));
    } else if (name === "password" && value.length < 8) {
      setFormErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long.",
      }));
    } else if (name === "email" && !value.includes("@")) {
      setFormErrors((prev) => ({
        ...prev,
        email: "Invalid email address. Please include '@'.",
      }));
    } else if (name === "firstName" && value.trim() === "") {
      setFormErrors((prev) => ({
        ...prev,
        firstName: "First Name is required.",
      }));
    } else if (name === "lastName" && value.trim() === "") {
      setFormErrors((prev) => ({
        ...prev,
        lastName: "Last Name is required.",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    // Check for any validation errors
    if (
      Object.values(formErrors).some((error) => error) ||
      Object.values(formValues).some((value) => !value.trim())
    ) {
      alert("Please fix all errors before submitting.");
      return;
    }

    const { username, password, email, firstName, lastName } = formValues;

    // Call the registerUser function with form values
    await registerUser({
      username,
      password,
      email,
      first_name: firstName,
      last_name: lastName,
    });
  };


  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePassword = () => setPasswordVisible(!passwordVisible);

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100">
        {/* Branding Section */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center">
          <div className="text-center">
            <h1 className="display-3 text-primary fw-bold">LocalHost</h1>
            <h2 className="text-secondary">
              <span className="text-danger" style={{ fontWeight: "700" }}>
                :
              </span>{" "}
              Blog
            </h2>
            <p className="mt-4 fs-5 text-muted">
              Welcome to LocalHost Blog! Connect, share, and inspire.
            </p>
          </div>
        </div>

        {/* Registration Form Section */}
        <div className="col-lg-4 col-md-8 col-sm-10 mx-auto">
          <div className="card shadow-lg p-4 border-0">
            <form onSubmit={handleRegister}>
              <h3 className="register-header text-center mb-4 text-primary">
                Register
              </h3>

              {/* Username Field */}
              <input
                type="text"
                name="username"
                className={`form-control mb-3 ${
                  formErrors.username ? "is-invalid" : ""
                }`}
                placeholder="Username"
                value={formValues.username}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">{formErrors.username}</div>

              {/* Password Field */}
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                className={`form-control mb-3 ${
                  formErrors.password ? "is-invalid" : ""
                }`}
                placeholder="Password"
                value={formValues.password}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">{formErrors.password}</div>
              <div className="password-toggle mb-3" onClick={togglePassword}>
                {passwordVisible ? "Hide" : "Show"} Password
              </div>

              {/* Email Field */}
              <input
                type="email"
                name="email"
                className={`form-control mb-3 ${
                  formErrors.email ? "is-invalid" : ""
                }`}
                placeholder="Email"
                value={formValues.email}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">{formErrors.email}</div>

              {/* First Name Field */}
              <input
                type="text"
                name="firstName"
                className={`form-control mb-3 ${
                  formErrors.firstName ? "is-invalid" : ""
                }`}
                placeholder="First Name"
                value={formValues.firstName}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">{formErrors.firstName}</div>

              {/* Last Name Field */}
              <input
                type="text"
                name="lastName"
                className={`form-control mb-3 ${
                  formErrors.lastName ? "is-invalid" : ""
                }`}
                placeholder="Last Name"
                value={formValues.lastName}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">{formErrors.lastName}</div>

              <button type="submit" className="btn btn-primary w-100 mb-3">
                Register
              </button>
            </form>

            <p className="text-center">
              Already a user?{" "}
              <Link to="/login" className="text-decoration-none">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
