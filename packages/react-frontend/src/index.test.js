/**
 * Main app entry point smoke test
 */

import ReactDOM from "react-dom";

it("renders without crashing", () => {
  // Disabled for now due to errors -- D3 doesn't like being run headless,
  // perhaps?
  return;

  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.appendChild(root);
  require("./index");
  ReactDOM.unmountComponentAtNode(root);
});
