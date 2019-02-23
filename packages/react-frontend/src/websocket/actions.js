import { createAction } from "redux-starter-kit";
import { CLOSE, OPEN } from "redux-websocket-bridge";

// Websocket action types are defined by the `redux-websocket-bridge`
// library; we just wrap them up here for other parts of the application to use.
export const wsOpen = createAction(`@@websocket/${OPEN}`);
export const wsClose = createAction(`@@websocket/${CLOSE}`);

// Actions that can be dispatched by other components
// `meta.send` will be set to true for WS request actions so that they can
// be intercepted and sent across the socket by the middleware.

export function wsSubscribeRequest(payload) {
  const type = "subscribe/request";

  return {
    type: type,
    payload: payload,
    meta: { send: true }
  };
}
wsSubscribeRequest.toString = () => "subscribe/request";
wsSubscribeRequest.type = "subscribe/request";

// Actions that can be received by other components (essentially just string
// constants, synced with the server code, that other reducers can watch for)
export const wsSubscribeAcknowledge = "subscribe/acknowledge";