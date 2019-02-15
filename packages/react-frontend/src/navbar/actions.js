import { createAction } from "redux-starter-kit";

export const expandNavbar = createAction("navbar/expandNavbar");
export const collapseNavbar = createAction("navbar/collapseNavbar");
export const expandBurger = createAction("navbar/expandBurger");
export const collapseBurger = createAction("navbar/collapseBurger");
