import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../contextApi/AuthContext";
import "./Dashboard.css";

const DashBoard = () => {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <div className="dashboard-container d-flex justify-content-center align-items-center vh-100">
      <div className="container text-center">
        <div className="row">
          <div className="col-6 col-md-4 mb-3">
            <Link to="/" className="text-decoration-none">
              <div className="card h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                  <i
                    className="bi bi-house-fill text-primary mb-2"
                    style={{ fontSize: "50px" }}
                  ></i>
                  <h5 className="card-title mt-2">Home</h5>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-6 col-md-8 mb-3">
            <Link
              to={user ? `/userPage/${user.user_id}` : "/login"}
              className="text-decoration-none"
            >
              <div className=" card h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                  <i
                    className="bi bi-person-fill text-secondary mb-2"
                    style={{ fontSize: "50px" }}
                  ></i>
                  <h5 className="card-title mt-2">
                    {user ? "User Page" : "User Page/Login to Access"}
                  </h5>
                </div>
              </div>
            </Link>
          </div>

          {user ? (
            <>
              <div className="col-6 col-md-4 mb-3">
                <Link to="/createBlog" className="text-decoration-none">
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                      <i
                        className="bi bi-pencil-fill text-success mb-2"
                        style={{ fontSize: "50px" }}
                      ></i>
                      <h5 className="card-title mt-2">Create Blog</h5>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="col-6 col-md-4 mb-3">
                <Link to="/search" className="text-decoration-none">
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                      <i
                        className="bi bi-search text-info mb-2"
                        style={{ fontSize: "50px" }}
                      ></i>
                      <h5 className="card-title mt-2">Search Posts</h5>
                    </div>
                  </div>
                </Link>
              </div>

              <div onClick={()=>logoutUser()} className="col-6 col-md-4 mb-3">
                <h4  className="text-decoration-none">
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                      <i
                        className="bi bi-box-arrow-right text-danger mb-2"
                        style={{ fontSize: "60px" }}
                      ></i>
                      <h5 className="card-title mt-2">Logout</h5>
                    </div>
                  </div>
                </h4>
              </div>
            </>
          ) : (
            <>
              <div className="col-6 col-md-4 mb-3">
                <Link to="/login" className="text-decoration-none">
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                      <i
                        className="bi bi-box-arrow-in-right text-warning mb-2"
                        style={{ fontSize: "50px" }}
                      ></i>
                      <h5 className="card-title mt-2">Login</h5>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="col-6 col-md-4 mb-3">
                <Link to="/register" className="text-decoration-none">
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                      <i
                        className="bi bi-person-plus-fill text-danger mb-2"
                        style={{ fontSize: "50px" }}
                      ></i>
                      <h5 className="card-title mt-2">Register</h5>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
