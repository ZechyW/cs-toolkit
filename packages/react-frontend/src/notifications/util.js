/**
 * Noty imports and helper functions
 */
import Noty from "noty";
import "noty/src/noty.scss";
import "noty/src/themes/bootstrap-v4.scss";

Noty.overrideDefaults({
  type: "info",
  layout: "topRight",
  theme: "bootstrap-v4",
  closeWith: ["click", "button"]
});

export function successNoty(text) {
  return new Noty({
    type: "success",
    text: text || ""
  });
}

export function errorNoty(text) {
  return new Noty({
    type: "error",
    text: text || ""
  });
}
