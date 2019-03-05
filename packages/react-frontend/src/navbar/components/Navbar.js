import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { animated, useSpring } from "react-spring";
import createSelector from "selectorator";
import { actions as coreActions } from "../../core";
import { useMedia } from "../../util";
import {
  collapseBurger,
  collapseNavbar,
  expandBurger,
  expandNavbar
} from "../actions";
import logo from "../images/logo.png";

/**
 * Animated collapsible navbar component.
 * A bunch of size/position properties shadow their Bulma counterparts, but
 * we use `react-spring` instead of CSS transitions for better animations.
 * @param props
 * @return {*}
 * @constructor
 */
function Navbar(props) {
  // We mimic Bulma's `.container.is-fluid` for sizing the brand item, so we
  // need to mirror its media query here as well.
  const brandMarginXExpanded = useMedia(
    ["screen and (min-width: 1088px)"],
    ["4rem"],
    "0"
  );

  // Cheat a little to imperatively note when the animation is done
  const navbarRef = useRef(null);
  // ... and when the burger menu is open
  const menuRef = useRef(null);

  // Animation springs
  const spring = useSpring({
    navbarHeight: props.navbarExpanded ? "10rem" : "3.25rem",
    navbarPaddingY: props.navbarExpanded ? "3rem" : "0rem",
    navbarPaddingX: props.navbarExpanded ? "1.5rem" : "0rem",
    brandPaddingY: props.navbarExpanded ? "0rem" : "0.5rem",
    brandPaddingX: props.navbarExpanded ? "0rem" : "0.75rem",
    brandMarginX: props.navbarExpanded ? brandMarginXExpanded : "0",
    logoSize: props.navbarExpanded ? "4rem" : "1.75rem",
    logoMarginRight: props.navbarExpanded ? "1rem" : "0.5rem",
    subtitleHeight: props.navbarExpanded ? "1.6rem" : "0rem",
    onFrame: ({ navbarHeight }) => {
      // Adjust the body's top padding to account for the fixed navbar
      if (document.body.style.paddingTop !== navbarHeight) {
        document.body.style.paddingTop = navbarHeight;
      }

      navbarRef.current.classList.add("is-animating");
    },
    onRest: () => {
      // The animation should be done.
      navbarRef.current.classList.remove("is-animating");
    }
  });
  const fastSpring = useSpring({
    opacity: props.navbarExpanded ? "1" : "0",
    config: { mass: 1, tension: 300, friction: 26 }
  });

  // Scroll listener: Collapse the navbar on scroll
  useEffect(() => {
    // Only set up the collapse listener if the navbar is currently open.
    if (!props.navbarExpanded) return;

    const handleScroll = () => {
      if (document.documentElement.scrollTop > 0) {
        props.collapseNavbar();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  // Burger menu: Collapse the burger menu when user clicks outside it
  useEffect(() => {
    // Only set up if the burger menu is open.
    if (!props.burgerExpanded) return;

    const handleClick = (event) => {
      if (!menuRef.current.contains(event.target)) {
        // Clicked outside an active burger menu
        props.collapseBurger();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  // Render
  return (
    <animated.nav
      className={classNames(
        "navbar is-light is-fixed-top",
        {
          "is-expanded": props.navbarExpanded,
          "is-offline": !props.wsConnected
        },
        // Presume we start in an animating state; we will get `react-spring`
        // to remove the class via an animation callback when/if it is done.
        "is-animating"
      )}
      style={{
        height: spring.navbarHeight,
        paddingTop: spring.navbarPaddingY,
        paddingBottom: spring.navbarPaddingY,
        paddingLeft: spring.navbarPaddingX,
        paddingRight: spring.navbarPaddingX
      }}
      ref={navbarRef}
    >
      <div className="navbar-brand">
        <animated.div
          className={"navbar-item has-cursor-pointer"}
          onClick={() => {
            if (!props.burgerExpanded) {
              if (props.navbarExpanded) {
                props.collapseNavbar();
              } else {
                props.expandNavbar();
              }
            }
          }}
          style={{
            paddingTop: spring.brandPaddingY,
            paddingBottom: spring.brandPaddingY,
            paddingLeft: spring.brandPaddingX,
            paddingRight: spring.brandPaddingX,
            marginLeft: spring.brandMarginX,
            marginRight: spring.brandMarginX
          }}
        >
          <animated.img
            src={logo}
            alt="CS Toolkit"
            style={{
              height: spring.logoSize,
              width: spring.logoSize,
              marginRight: spring.logoMarginRight,
              maxHeight: "100%"
            }}
          />
          <div>
            <p className="title">
              {props.navbarExpanded
                ? "The Code Switching Toolkit"
                : "CS Toolkit"}
              {!props.wsConnected ? (
                <span className="has-text-grey"> (offline)</span>
              ) : (
                ""
              )}
            </p>
            <animated.p
              className="subtitle"
              style={{
                height: spring.subtitleHeight,
                opacity: fastSpring.opacity
              }}
            >
              A (roughly) Minimalist framework for exploring code switching data
            </animated.p>
          </div>
        </animated.div>

        <div
          role="button"
          className={classNames("navbar-burger", {
            "is-active": props.burgerExpanded
          })}
          aria-label="menu"
          aria-expanded={props.burgerExpanded ? "true" : "false"}
          onClick={() =>
            props.burgerExpanded ? props.collapseBurger() : props.expandBurger()
          }
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </div>
      </div>

      <div
        className={classNames("navbar-menu", {
          "is-active": props.burgerExpanded
        })}
        ref={menuRef}
      >
        <div className="navbar-start" />

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <button
                className="button is-primary"
                onClick={() => {
                  if (!props.navbarExpanded) props.expandNavbar();
                  props.resetGrid();
                }}
              >
                <strong>Reset Layout</strong>
              </button>
            </div>
          </div>
        </div>
      </div>
    </animated.nav>
  );
}

/**
 * React-redux binding
 */
const actionCreators = {
  expandNavbar,
  collapseNavbar,
  expandBurger,
  collapseBurger,

  resetGrid: coreActions.resetGrid
};

let WrappedNavbar = connect(
  createSelector({
    navbarExpanded: "navbar.navbarExpanded",
    burgerExpanded: "navbar.burgerExpanded",

    wsConnected: "websocket.connected"
  }),
  actionCreators
)(Navbar);

export default WrappedNavbar;
