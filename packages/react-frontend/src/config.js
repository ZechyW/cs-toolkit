/**
 * Configuration options for the frontend.
 */

class Config {
  /**
   * Default format for displaying timestamps.  Will be passed to the
   * `format` function from  `date-fns`.
   * (https://date-fns.org/v2.0.0-alpha.27/docs/format)
   * @type {string}
   */
  timestampFormat = "yyyy-MM-dd HH:mm:ss";

  /**
   * WebSocket URL to connect to, including protocol.
   * @type {string}
   * @example `ws://${window.location.host}/ws/`
   * @example "wss://secure.host.example/ws/"
   */
  wsUrl = `ws://${window.location.host}/redux/`;

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // React-grid-layout
  // When we want to size a grid item, we take the height of the content
  // container.  There might, however, be extra padding between the content
  // container and the root grid item container (e.g., with Bulma's .box).
  // This value should be added to the height of the content container for
  // size calculations.
  // gridVerticalPadding = 40;
  gridVerticalPadding = 40;

  // Default layout for the grid
  gridDefaultLayout = {
    // lg: 12 columns
    lg: [
      { w: 6, h: 11, x: 0, y: 0, i: "derivationInput", minW: 2 },
      { w: 6, h: 11, x: 6, y: 0, i: "lexicalItemList", minW: 2 },
      { w: 12, h: 8, x: 0, y: 11, i: "derivationStatusList", minW: 2 }
    ],

    // md: 10 columns
    md: [
      { w: 5, h: 11, x: 0, y: 0, i: "derivationInput", minW: 2 },
      { w: 5, h: 11, x: 5, y: 0, i: "lexicalItemList", minW: 2 },
      { w: 10, h: 8, x: 0, y: 11, i: "derivationStatusList", minW: 2 }
    ],

    // sm: 6 columns
    sm: [
      { w: 3, h: 12, x: 0, y: 0, i: "derivationInput", minW: 2 },
      { w: 3, h: 12, x: 3, y: 0, i: "lexicalItemList", minW: 2 },
      { w: 6, h: 8, x: 0, y: 12, i: "derivationStatusList", minW: 2 }
    ],

    // xs: 4 columns
    xs: [
      { w: 4, h: 11, x: 0, y: 0, i: "derivationInput", minW: 2 },
      { w: 4, h: 9, x: 0, y: 11, i: "lexicalItemList", minW: 2 },
      { w: 8, h: 8, x: 0, y: 20, i: "derivationStatusList", minW: 2 }
    ],

    // xxs: 2 columns
    xxs: [
      { w: 2, h: 13, x: 0, y: 0, i: "derivationInput", minW: 2 },
      { w: 2, h: 9, x: 0, y: 13, i: "lexicalItemList", minW: 2 },
      { w: 4, h: 8, x: 0, y: 22, i: "derivationStatusList", minW: 2 }
    ]
  };

  // Which grid items to autosize (keeping them at their natural height)
  gridDefaultAutosize = { derivationInput: true, lexicalItemList: false };

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // LexicalItemList

  // Default column definition: Will be applied to all columns unless
  // individually overwritten.
  lexicalItemsDefaultColDef = {
    filter: true,
    lockVisible: true,
    sortable: true,
    resizable: true
  };

  // Initial column definitions: Will be overwritten by individual users'
  // settings.
  lexicalItemsColumnDefs = [
    { headerName: "Item", field: "text", width: 150 },
    { headerName: "Language", field: "language", width: 110 },
    { headerName: "Features", field: "features", width: 200 }
  ];

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // DerivationStatusList

  // Default column definition: Will be applied to all columns unless
  // individually overwritten.
  derivationsDefaultColDef = {
    filter: true,
    lockVisible: true,
    sortable: true,
    resizable: true
  };

  // Initial column definitions: Will be overwritten by individual users'
  // settings.
  derivationsColumnDefs = [
    { headerName: "Lexical Array", field: "lexicalArray", width: 150 },
    { headerName: "Status", field: "status", width: 110 },
    { headerName: "Created on", field: "creationTime", width: 110 }
  ];
}

export default new Config();
