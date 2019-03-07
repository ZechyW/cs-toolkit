import { createReducer } from "redux-starter-kit";
import { open, close, subscribeAcknowledge, subscribeRequest } from "./actions";

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
  [subscribeRequest]: (state, action) => {
    // If we have already started a subscription request to a model/instance,
    // we don't want other components to keep resending subscription
    // requests even if we haven't received a response yet.
    const model = action.payload.model;
    const id = action.payload.id;

    const subscriptionId = id ? `${model}:${id}` : `${model}`;

    state.subscriptions[subscriptionId] = "pending";
  },
  [subscribeAcknowledge]: (state, action) => {
    // Subscriptions may be to entire models, or specific model instances.
    const model = action.payload.model;
    const id = action.payload.id;

    const subscriptionId = id ? `${model}:${id}` : `${model}`;

    state.subscriptions[subscriptionId] = true;
  }
});

export default wsReducer;
