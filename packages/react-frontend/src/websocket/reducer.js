import { createReducer } from "redux-starter-kit";
import { wsOpen, wsClose, wsSubscribeAcknowledge } from "./actions";

/**
 * Handles WebSocket-related actions.
 * Action types are defined by the `redux-websocket-bridge` library.
 */
const initialState = {
  connected: false,
  subscriptions: {}
};

const wsReducer = createReducer(initialState, {
  [wsOpen]: (state) => {
    state.connected = true;
  },
  [wsClose]: (state) => {
    state.connected = false;
    state.subscriptions = {};
  },
  [wsSubscribeAcknowledge]: (state, action) => {
    const model = action.payload.model;
    state.subscriptions[model] = true;
  }
});

export default wsReducer;
