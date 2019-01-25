/**
 * Configuration options for the frontend
 */
export default {
  // WebSocket settings
  wsHost: `ws://${window.location.host}`,
  wsEndpoint: "/ws/",

  // React-grid-layout
  // When we want to size a grid item, we take the height of the content
  // container.  There might, however, be extra padding between the content
  // container and the root grid item container (e.g., with Bulma's .box).
  // This value should be added to the height of the content container for
  // size calculations.s
  gridVerticalPadding: 40,

  // localStorage namespace
  localStorageNamespace: "cs-toolkit"
};
