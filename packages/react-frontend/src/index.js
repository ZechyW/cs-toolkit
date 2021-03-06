/**
 * Main app entry point:
 * - Configures the Redux store
 * - Performs other app-level configuration
 * - Renders the App component
 */

import { config, dom } from "@fortawesome/fontawesome-svg-core";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./core/components/App";
import { persistor, store } from "./store";

// FontAwesome icons
config.autoReplaceSvg = "nest";
dom.watch();

// Axios defaults for Django CSRF handling
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

// Main component render
function mainRender() {
  ReactDOM.render(
    <Provider store={store}>
      <PersistGate loading={"Loading..."} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>,
    document.getElementById("root")
  );
}

// Additional debug processing, if necessary

/**
 * Expose Redux store for testing or debugging
 * @prop window.Cypress */
if (window.Cypress || process.env.NODE_ENV !== "production") {
  window.store = store;
}

// if (process.env.NODE_ENV !== "production") {
//   // Workaround for https://github.com/facebook/create-react-app/issues/6399
//   // until it gets fixed upstream
//   setTimeout(() => {
//     mainRender();
//   }, 1500);
// } else {
//   mainRender();
// }
mainRender();

// Debug
window.axios = axios;
