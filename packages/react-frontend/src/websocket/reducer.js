import { createReducer } from "redux-starter-kit";
import { open, close, subscribeAcknowledge } from "./actions";

/**
 * Handles WebSocket-related actions.
 * Action types are defined by the `redux-websocket-bridge` library.
 */
const initialState = {
  connected: false,
  subscriptions: {}
};

const wsReducer = createReducer(initialState, {
  [open]: (state) => {
    state.connected = true;
  },
  [close]: (state) => {
    state.connected = false;
    state.subscriptions = {};
  },
  [subscribeAcknowledge]: (state, action) => {
    const model = action.payload.model;
    state.subscriptions[model] = true;
  }
});

export default wsReducer;
