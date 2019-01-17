import "./styles/index.scss";
import "@fortawesome/fontawesome-free/js/all";

import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";

window.app = ReactDOM.render(<App/>, document.getElementById("root"));