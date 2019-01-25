import "./styles/theme.scss";

import "@babel/polyfill";
import "whatwg-fetch";

import { dom, config } from "@fortawesome/fontawesome-svg-core";

config.autoReplaceSvg = "nest";
dom.watch();

import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";

window.app = ReactDOM.render(<App />, document.getElementById("root"));
