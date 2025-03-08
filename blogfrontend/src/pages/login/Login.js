import React, { useContext, useState } from "react";
import AuthContext from "../../contextApi/AuthContext";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";

const Login = () => {
  const { user, logoutUser, loginUser } = useContext(AuthContext);

  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const togglePassword = () => setPasswordVisible(!passwordVisible);

  const validateForm = () => {
    let errors = {};
    if (formValues.username.trim() === "") errors.username = "Username is required.";
    if (formValues.password.length < 8) errors.password = "Password must be at least 8 characters.";
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmissionError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
  
    if (Object.keys(errors).length > 0) {
      setSubmissionError("Please correct the highlighted errors.");
      return;
    }
  
    try {
      await loginUser(event);
    } catch (error) {
      setSubmissionError(error.message || "Invalid username or password.");
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
            {user ? (
              <div className="text-center">
                <h2 className="mb-3">Welcome, {user.username}!</h2>
                <button className="btn btn-danger w-100" onClick={() => logoutUser()}>
                  Logout
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin}>
                <h2 className="text-center mb-4 text-primary">Login</h2>

                {/* Form Validation Summary */}
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

                {/* Login Button */}
                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>

                {/* Register Link */}
                <p className="text-center mt-3">
                  Not a user?{" "}
                  <Link to="/register" className="text-decoration-none">
                    Register now
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
