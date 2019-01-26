import "./styles/theme.scss";

/**
 * Polyfills
 */
import "@babel/polyfill";
import "whatwg-fetch";

/**
 * FontAwesome Icons
 */
import { dom, config } from "@fortawesome/fontawesome-svg-core";

config.autoReplaceSvg = "nest";
dom.watch();

/**
 * Main React App
 */
import React from "react";
import ReactDOM from "react-dom";

import WsApp from "./components/App";

let app;
ReactDOM.render(
  <WsApp ref={(component) => (app = component)} />,
  document.getElementById("root")
);

import $ from "jquery";

$("#cs-reset").on("click", () => {
  // The main app returns a WebSocket interface that has an `.inner`
  // attribute pointing to the app proper
  app.inner.resetLayout();
});

/**
 * Collapsible navbar header
 */
import "./navbar";

/**
 * Debug
 */
window.$ = $;
