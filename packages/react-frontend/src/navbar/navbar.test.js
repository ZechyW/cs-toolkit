import {
  collapseBurger,
  collapseNavbar,
  expandBurger,
  expandNavbar
} from "./actions";
import reducer from "./reducer";

describe("The reducer", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, {})).toMatchSnapshot();
  });

  it("expands the main navbar", () => {
    const beforeState = { navbarExpanded: false, burgerExpanded: false };
    const action = expandNavbar();
    const state = reducer(beforeState, action);
    expect(state).toEqual({ navbarExpanded: true, burgerExpanded: false });
  });

  it("collapses the main navbar", () => {
    const beforeState = { navbarExpanded: true, burgerExpanded: false };
    const action = collapseNavbar();
    const state = reducer(beforeState, action);
    expect(state).toEqual({ navbarExpanded: false, burgerExpanded: false });
  });

  it("expands the burger menu, ensuring that the main navbar is collapsed", () => {
    const beforeState = { navbarExpanded: true, burgerExpanded: false };
    const action = expandBurger();
    const state = reducer(beforeState, action);
    expect(state).toEqual({ navbarExpanded: false, burgerExpanded: true });
  });

  it("collapses the burger menu", () => {
    const beforeState = { navbarExpanded: false, burgerExpanded: true };
    const action = collapseBurger();
    const state = reducer(beforeState, action);
    expect(state).toEqual({ navbarExpanded: false, burgerExpanded: false });
  });
});
