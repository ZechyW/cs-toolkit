import { createAction } from "redux-starter-kit";
import { CLOSE, OPEN } from "redux-websocket-bridge";

// Websocket action types are defined by the `redux-websocket-bridge`
// library; we just wrap them up here for other parts of the application to use.
export const open = createAction(`@@websocket/${OPEN}`);
export const close = createAction(`@@websocket/${CLOSE}`);

// Actions that can be dispatched by other components
// `meta.send` will be set to true for WS request actions so that they can
// be intercepted and sent across the socket by the middleware.

const SUBSCRIBE_REQUEST = "subscribe/request";

export function subscribeRequest(payload) {
  return {
    type: SUBSCRIBE_REQUEST,
    payload: payload,
    meta: { send: true }
  };
}
subscribeRequest.toString = () => SUBSCRIBE_REQUEST;
subscribeRequest.type = SUBSCRIBE_REQUEST;

// Actions that can be received by other components (essentially just string
// constants, synced with the server code, that other reducers can watch for)
export const subscribeAcknowledge = "subscribe/acknowledge";
export const subscribeChange = "subscribe/change";
export const subscribeDelete = "subscribe/delete";
export const subscribeError = "subscribe/error";
