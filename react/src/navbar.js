/**
 * Collapsible navbar header
 */
import $ from "jquery";
import _ from "lodash";

const $body = $("body");
const $navbar = $("#cs-navbar");
const $brand = $("#cs-brand-container");
const $logo = $("#cs-logo");
const $title = $("#cs-title");
const $subtitle = $("#cs-subtitle");

// Heights for navbar in both states (for smoother body animations, etc.)
const expandedHeight = "10rem";
const collapsedHeight = "3.25rem";

// Scroll listener - Collapse the navbar on first scroll down
let isExpanded = true;

function checkScroll() {
  if ($(window).scrollTop() > 0 && isExpanded) {
    collapseNavbar();
    isExpanded = false;
  }
}

/**
 * Collapses the navbar when above the scroll threshold
 */
function collapseNavbar() {
  // Body padding animation - Set padding on the body equivalent to the navbar's
  // full height first, so that we can animate the padding change smoothly
  // with the navbar's height change
  $navbar.addClass("is-fixed-top");
  $body.css({
    "padding-top": `calc(${$(window).scrollTop()}px + ${expandedHeight})`
  });

  // Break up the action here so that the browser doesn't end up batching
  // both padding changes for the animation
  window.setTimeout(() => {
    $body.addClass("cs-animate");

    // Changes to navbar elements
    $logo.css({
      height: "1.75rem",
      width: "1.75rem",
      "max-height": "",
      "margin-right": "0.5rem"
    });
    $brand.removeClass("container is-fluid has-padding-0");
    $title.text("CS Toolkit");
    $subtitle.detach();

    // Main navbar height animation
    $navbar.removeClass("hero-body");
    $navbar.css({
      height: collapsedHeight
    });
    $body.css({
      "padding-top": collapsedHeight
    });

    // Make sure the right thing happens when the brand is clicked
    $brand.off("click.collapse");
    $brand.one("click.expand", () => {
      expandNavbar();
      isExpanded = true;
    });
  }, 0);
}

/**
 * Expands the navbar when below the scroll threshold
 */
function expandNavbar() {
  // Changes to navbar elements
  $logo.css({
    height: "65px",
    width: "65px",
    "max-height": "100%",
    "margin-right": "1rem"
  });
  $brand.addClass("container is-fluid has-padding-0");
  $title.text("The Code Switching Toolkit");
  $subtitle.insertAfter($title);

  // Body padding
  $navbar.removeClass("is-fixed-top");
  $body.removeClass("cs-animate");
  $("body").css("padding-top", "");

  // Main navbar height animation
  $navbar.addClass("hero-body");
  $navbar.css({
    height: expandedHeight
  });

  // Click handlers
  $brand.off("click.expand");
  $brand.one("click.collapse", () => {
    collapseNavbar();
    isExpanded = false;
  });
}

window.addEventListener("scroll", _.throttle(checkScroll, 50));

// Navbar starts expanded; attach an initial click handler
$brand.one("click.collapse", () => {
  collapseNavbar();
  isExpanded = false;
});

// Other navbar javascript
$(".navbar-burger").click(function() {
  // Collapse the navbar if necessary first
  if (isExpanded) {
    collapseNavbar();
  }

  // Toggle the "is-active" class on both the "navbar-burger" and the
  // "navbar-menu"
  $(".navbar-burger").toggleClass("is-active");
  $(".navbar-menu").toggleClass("is-active");
});
