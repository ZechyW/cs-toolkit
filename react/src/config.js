/**
 * Configuration options for the frontend.
 */

class Config {
  /**
   * WebSocket URL to connect to, including protocol.
   * @type {string}
   * @example `ws://${window.location.host}/ws/`
   * @example "wss://secure.host.example/ws/"
   */
  wsURL = `ws://${window.location.host}/ws/`;

  // React-grid-layout
  // When we want to size a grid item, we take the height of the content
  // container.  There might, however, be extra padding between the content
  // container and the root grid item container (e.g., with Bulma's .box).
  // This value should be added to the height of the content container for
  // size calculations.
  // gridVerticalPadding = 40;
  gridVerticalPadding = 0;

  // Default layout for the grid
  gridDefaultLayout = {
    md: [
      { w: 10, h: 10, x: 0, y: 0, i: "generateDerivation" },
      { w: 5, h: 9, x: 0, y: 10, i: "wsEcho" },
      { w: 5, h: 9, x: 5, y: 10, i: "lexicalItems" }
    ],
    lg: [
      { w: 12, h: 10, x: 0, y: 0, i: "generateDerivation" },
      { w: 6, h: 9, x: 0, y: 10, i: "wsEcho" },
      { w: 6, h: 9, x: 6, y: 10, i: "lexicalItems" }
    ],
    sm: [
      { w: 6, h: 10, x: 0, y: 0, i: "generateDerivation" },
      { w: 3, h: 9, x: 0, y: 10, i: "wsEcho" },
      { w: 3, h: 9, x: 3, y: 10, i: "lexicalItems" }
    ],
    xs: [
      { w: 4, h: 10, x: 0, y: 0, i: "generateDerivation" },
      { w: 2, h: 9, x: 0, y: 10, i: "wsEcho" },
      { w: 2, h: 9, x: 2, y: 10, i: "lexicalItems" }
    ]
  };

  // Which grid items to autosize (keeping them at their natural height)
  gridDefaultAutosize = { generateDerivation: true, lexicalItemList: true };

  // localStorage namespace
  localStorageNamespace = "cs-toolkit";
}

export default new Config();
