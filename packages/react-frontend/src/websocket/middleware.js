/**
 * Creates a reconnecting WebSocket for use with our backend API
 */

import pako from "pako";
import ReconnectingWebSocket from "reconnecting-websocket";
import ReduxWebSocketBridge from "redux-websocket-bridge";
import utf8 from "utf8";
import Config from "../config";

// Any necessary options for the WS or Redux bridge library can be
// initialised here.

// Intellij incorrectly reports `unfold` as unused.
// noinspection JSUnusedGlobalSymbols
const middleware = ReduxWebSocketBridge(
  () => new ReconnectingWebSocket(Config.wsUrl),
  {
    fold,
    unfold
  }
);

/**
 * Custom message folding function that applies gzip compression to the
 * message first.
 * @param action
 * @param webSocket
 * @return {string}
 */
function fold(action, webSocket) {
  if (
    action.meta &&
    arrayify(action.meta.send).some(
      (send) => send === true || send === webSocket
    )
  ) {
    // Pull the `meta` property out of the action.
    // noinspection JSUnusedLocalSymbols
    const { meta, ...actionWithoutMeta } = action;

    const folded = JSON.stringify(actionWithoutMeta);
    return pako.deflate(utf8.encode(folded));
  }
}

/**
 * From `redux-websocket-bridge`: Turns things into arrays
 * @param obj
 * @return {*}
 */
function arrayify(obj) {
  return obj ? (Array.isArray(obj) ? obj : [obj]) : [];
}

/**
 * Custom message unfolding function that applies gzip decompression to the
 * message first.
 * @param payload
 * @param webSocket
 * @param raw
 */
function unfold(payload, webSocket, raw) {
  const action = tryParseGzipJSON(payload);

  return (
    action && {
      ...action,
      meta: {
        ...action.meta,
        webSocket
      }
    }
  );
}

/**
 * Adapted from `redux-websocket-bridge`:
 * Silently try to decompress and parse the input as JSON
 * @param data
 * @return {any}
 */
function tryParseGzipJSON(data) {
  try {
    return JSON.parse(pako.inflate(data, { to: "string" }));
  } catch (err) {}
}

export default middleware;

window.pako = pako;
