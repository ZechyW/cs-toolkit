import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { animated, useSpring } from "react-spring";
import createSelector from "selectorator";
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
  const {
    navbarExpanded,
    collapseNavbar,
    expandNavbar,
    burgerExpanded,
    collapseBurger,
    expandBurger
  } = props;

  // We mimic Bulma's `.container.is-fluid` for sizing the brand item, so we
  // need to mirror its media query here as well.
  const brandMarginXExpanded = useMedia(
    ["screen and (min-width: 1088px)"],
    ["4rem"],
    "0"
  );

  // Cheat a little to imperatively note when the animation is done
  const navbarRef = useRef(null);

  // Animation springs
  const spring = useSpring({
    navbarHeight: navbarExpanded ? "10rem" : "3.25rem",
    navbarPaddingY: navbarExpanded ? "3rem" : "0rem",
    navbarPaddingX: navbarExpanded ? "1.5rem" : "0rem",
    brandPaddingY: navbarExpanded ? "0rem" : "0.5rem",
    brandPaddingX: navbarExpanded ? "0rem" : "0.75rem",
    brandMarginX: navbarExpanded ? brandMarginXExpanded : "0",
    logoSize: navbarExpanded ? "4rem" : "1.75rem",
    logoMarginRight: navbarExpanded ? "1rem" : "0.5rem",
    subtitleHeight: navbarExpanded ? "1.6rem" : "0rem",
    onFrame: ({ navbarHeight }) => {
      // Adjust the body's top padding to account for the fixed navbar
      if (document.body.style.paddingTop !== navbarHeight) {
        document.body.style.paddingTop = navbarHeight;
      }
      // Note the animation in progress
      navbarRef.current.classList.add("is-animating");
    },
    onRest: () => {
      navbarRef.current.classList.remove("is-animating");
    }
  });
  const fastSpring = useSpring({
    opacity: navbarExpanded ? "1" : "0",
    config: { mass: 1, tension: 300, friction: 26 }
  });

  // Scroll listener
  useEffect(() => {
    // Only set up the collapse listener if the navbar is currently open.
    if (!navbarExpanded) return;

    const handleScroll = () => {
      if (document.documentElement.scrollTop > 0) {
        collapseNavbar();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  // Burger menu

  // Render
  return (
    <animated.nav
      className={classNames("navbar is-light is-fixed-top", {
        "is-expanded": navbarExpanded
      })}
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
            if (!burgerExpanded) {
              if (navbarExpanded) {
                collapseNavbar();
              } else {
                expandNavbar();
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
              {navbarExpanded ? "The Code Switching Toolkit" : "CS Toolkit"}
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
            "is-active": burgerExpanded
          })}
          aria-label="menu"
          aria-expanded={burgerExpanded ? "true" : "false"}
          onClick={() => (burgerExpanded ? collapseBurger() : expandBurger())}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </div>
      </div>

      <div
        className={classNames("navbar-menu", { "is-active": burgerExpanded })}
      >
        <div className="navbar-start" />

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <button className="button is-primary">
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
  collapseBurger
};

export default connect(
  createSelector({
    navbarExpanded: "navbar.navbarExpanded",
    burgerExpanded: "navbar.burgerExpanded"
  }),
  actionCreators
)(Navbar);
