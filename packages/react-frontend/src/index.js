/**
 * Main app entry point:
 * Configures the Redux store and renders the App component.
 */

import { config, dom } from "@fortawesome/fontawesome-svg-core";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./core/components/App";
import "./core/styles/theme.scss";
import store from "./store";

// FontAwesome icons
config.autoReplaceSvg = "nest";
dom.watch();

// Main component render
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
