/**
 * Main app entry point smoke test
 */

import ReactDOM from "react-dom";

it("renders without crashing", () => {
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.appendChild(root);
  require("./index");
  ReactDOM.unmountComponentAtNode(root);
});
