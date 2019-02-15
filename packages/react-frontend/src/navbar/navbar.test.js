import { expandBurger } from "./actions";
import reducer from "./reducer";

describe("The reducer", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, {})).toEqual({
      navbarExpanded: true,
      burgerExpanded: false
    });
  });

  it("ensures the main navbar is collapsed when the burger menu is expanded", () => {
    const state = reducer(
      { navbarExpanded: true, burgerExpanded: false },
      expandBurger()
    );
    expect(state).toEqual({ navbarExpanded: false, burgerExpanded: true });
  });
});
