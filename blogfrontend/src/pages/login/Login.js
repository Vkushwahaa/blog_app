import React, { useContext } from "react";
import AuthContext from "../../contextApi/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./login.css"; 

const Login = () => {
  const { user, logoutUser } = useContext(AuthContext);
  let { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    await loginUser(event);
  };

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

        {/* Login Section */}
        <div className="col-lg-4 col-md-8 col-sm-10 mx-auto">
          <div className="card shadow-lg p-4 border-0">
            {user ? (
              <div className="text-center">
                <h2 className="mb-3">Welcome, {user.username}!</h2>
                <button
                  className="btn btn-danger btn-block"
                  onClick={() => logoutUser()}
                >
                  Logout
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin}>
                <h2 className="text-center mb-4 text-primary">Login</h2>
                <div className="mb-3">
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder="Username"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Password"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block w-100"
                >
                  Login
                </button>
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
