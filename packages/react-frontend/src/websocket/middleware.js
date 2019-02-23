/**
 * Creates a reconnecting WebSocket for use with our backend API
 */

import ReconnectingWebSocket from "reconnecting-websocket";
import ReduxWebSocketBridge from "redux-websocket-bridge";

import Config from "../config";

// Any necessary options for the WS or Redux bridge library can be
// initialised here.

const middleware = ReduxWebSocketBridge(
  () => new ReconnectingWebSocket(Config.wsUrl)
);

export default middleware;
