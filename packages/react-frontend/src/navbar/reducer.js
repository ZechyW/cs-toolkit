import { createReducer } from "redux-starter-kit";
import {
  collapseBurger,
  collapseNavbar,
  expandBurger,
  expandNavbar
} from "./actions";

const navbarReducer = createReducer(
  {
    navbarExpanded: true,
    burgerExpanded: false
  },
  {
    [expandNavbar]: (state) => {
      state.navbarExpanded = true;
    },
    [collapseNavbar]: (state) => {
      state.navbarExpanded = false;
    },
    [expandBurger]: (state) => {
      // When the burger menu is expanded, the main navbar should always be
      // collapsed.
      state.navbarExpanded = false;
      state.burgerExpanded = true;
    },
    [collapseBurger]: (state) => {
      state.burgerExpanded = false;
    }
  }
);

export default navbarReducer;
