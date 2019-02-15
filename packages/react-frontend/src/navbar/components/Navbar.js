import React from "react";
import logo from "../images/logo.png";

export class Navbar extends React.Component {
  render = () => (
    <nav className="navbar is-light hero-body">
      <div className="navbar-brand">
        <div className="navbar-item container is-fluid has-padding-0">
          <img
            src={logo}
            alt=""
            style={{
              height: "65px",
              width: "65px",
              maxHeight: "100%",
              marginRight: "1rem"
            }}
          />
          <div>
            <p className="title">The Code Switching Toolkit</p>
            <p className="subtitle">
              A (roughly) Minimalist framework for exploring code switching data
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
