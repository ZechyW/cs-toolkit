/**
 * Noty imports and helper functions
 */
import Noty from "noty";
import "noty/src/noty.scss";
import "noty/src/themes/bootstrap-v4.scss";
import { assign } from "lodash-es";

Noty.overrideDefaults({
  type: "info",
  layout: "topRight",
  theme: "bootstrap-v4",
  closeWith: ["click", "button"]
});

export function successNoty(text, options) {
  options = assign(options, { type: "success", text: text || "" });
  return new Noty(options);
}

export function errorNoty(text, options) {
  options = assign(options, { type: "error", text: text || "" });
  return new Noty(options);
}
