import { mount } from "enzyme";
import React from "react";
import { Provider } from "react-redux";
import store from "../store";
import {
  collapseBurger,
  collapseNavbar,
  expandBurger,
  expandNavbar
} from "./actions";
import Navbar from "./components/Navbar";
import reducer from "./reducer";
import simulant from "simulant";

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

describe("The component", () => {
  it("collapses the navbar on scroll", () => {
    jest.useFakeTimers();

    const wrapper = mount(
      <Provider store={store}>
        <Navbar />
      </Provider>,
      { attachTo: document.body }
    );
    expect(
      wrapper
        .find(".navbar")
        .first()
        .prop("style")
        .height.getValue()
    ).toEqual("10rem");

    console.log(
      wrapper
        .find(Navbar)
        .first()
        .instance()
    );
    document.documentElement.scrollTop = 100;
    simulant.fire(window, "scroll");

    global.timeTravel(1000);

    expect(
      wrapper
        .find(".navbar")
        .first()
        .prop("style")
        .height.getValue()
    ).toEqual("3.25rem");
  });
});
