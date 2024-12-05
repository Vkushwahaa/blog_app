import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Offcanvas, Image } from "react-bootstrap";
import AuthContext from "../../contextApi/AuthContext";
import AppContext from "../../contextApi/AppContext";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap Icons
import "./Header.css";

const Header = () => {
  const { user , logoutUser} = useContext(AuthContext);
  const { author, getAuthor } = useContext(AppContext);
  const [showSidebar, setShowSidebar] = useState(false);
  useEffect(() => {
    if (user) {
      getAuthor(user.user_id).catch((err) =>
        console.error("Failed to fetch author:", err)
      );
    }
  }, [user, getAuthor]);

  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);

  return (
    <>
      <Navbar bg="black" variant="dark" expand="lg" fixed="top">
        <Container className="d-flex align-items-center">
          <Navbar.Brand as={Link} to="/" className="me-auto">
            LocalHost{" "}
            <span className="text-danger" style={{ fontWeight: "700" }}>
              :
            </span>{" "}
            Blog
          </Navbar.Brand>

          {/* {user && author && (
            <Link
              to={`/userPage/${user.user_id}`}
              style={{ cursor: "pointer" }}
              className="d-flex align-items-center"
            >
              <Image
                src={
                  author.img
                    ? `http://127.0.0.1:8000/${author.img}`
                    : "http://127.0.0.1:8000/media/author_images/default.jpg"
                }
                roundedCircle
                width="40"
                height="40"
                className="me-2"
                style={{ objectFit: "cover" }}
                alt="Profile"
              />
            </Link>
          )} */}

          <button
            className="btn btn-outline-light ms-2"
            onClick={handleShowSidebar}
          >
            ☰
          </button>
        </Container>
      </Navbar>

      <Offcanvas
        show={showSidebar}
        onHide={handleCloseSidebar}
        placement="start"
        className="bg-black text-white"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column justify-content-between">
          <Nav className="flex-column">
            <Nav.Link
              as={Link}
              to="/dashboard"
              className="text-white"
              onClick={handleCloseSidebar}
            >
              <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </Nav.Link>
            {user && (
              <Nav.Link
                as={Link}
                to={`/userPage/${user.user_id}`}
                className="text-white"
                onClick={handleCloseSidebar}
              >
                <i className="bi bi-person me-2"></i>User Page
              </Nav.Link>
            )}
            <Nav.Link
              as={Link}
              to="/search"
              className="text-white"
              onClick={handleCloseSidebar}
            >
              <i className="bi bi-search me-2"></i>Search
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/createBlog"
              className="text-white"
              onClick={handleCloseSidebar}
            >
              <i className="bi bi-pencil-square me-2"></i>Create Blog
            </Nav.Link>
          </Nav>

          <Nav onClick={() => logoutUser()} className="flex-column mt-auto">
            {user ? (
              <Nav.Link className="text-white" onClick={handleCloseSidebar}>
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </Nav.Link>
            ) : (
              <Nav.Link
                as={Link}
                to="/login"
                className="text-white"
                onClick={handleCloseSidebar}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>Login
              </Nav.Link>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Header;
