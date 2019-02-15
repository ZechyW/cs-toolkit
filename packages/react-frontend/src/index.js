/**
 * Main app entry point:
 * Configures the Redux store and renders the App component.
 */

import { config, dom } from "@fortawesome/fontawesome-svg-core";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { configureStore } from "redux-starter-kit";
import App from "./core/components/App";
import { reducer as lexicalArray } from "./lexicalArray";
import "./core/styles/theme.scss";

// FontAwesome icons
config.autoReplaceSvg = "nest";
dom.watch();

// Redux store
const store = configureStore({
  reducer: {
    lexicalArray
  }
});

// Main component render
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
