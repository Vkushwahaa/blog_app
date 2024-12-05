
import React from "react";

const Footer = () => {
  return (
    <footer className="footer bg-black text-white p-2 text-center">
      <div className="container">
        <span className="footer-text">
          &copy; {new Date().getFullYear()} localhost
          <span className="text-danger" style={{ fontWeight: "700" }}>
            :
          </span>{""}
          blog. All rights reserved.
        </span>
        <br />
      </div>
    </footer>
  );
};

export default Footer;
