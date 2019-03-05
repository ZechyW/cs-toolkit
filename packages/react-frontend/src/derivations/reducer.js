import { createReducer } from "redux-starter-kit";
import { actions as derivationInputActions } from "../derivationInput";
import { actions as wsActions } from "../websocket";
import { reset, saveColumnState } from "./actions";

const initialState = {
  requestsById: {},
  derivationsById: {},

  // ag-grid view
  columnState: []
};

export default createReducer(initialState, {
  [reset]: () => {
    return initialState;
  },

  /**
   * The UI wants to save the current `ag-grid` column state.
   * @param state
   * @param action
   */
  [saveColumnState]: (state, action) => {
    state.columnState = action.payload;
  },

  /**
   * A DerivationRequest was successfully posted to the backend.
   * @param state
   * @param action
   */
  [derivationInputActions.postDerivationRequestSuccess]: (state, action) => {
    const request = action.payload;
    state.requestsById[request.id] = request;
  },

  /**
   * Successfully subscribed to a particular Derivation.
   * @param state
   * @param action
   */
  [wsActions.subscribeAcknowledge]: (state, action) => {
    if (action.payload.model !== "Derivation") {
      return;
    }

    // Set
    const derivation = action.payload.data;
    state.derivationsById[derivation.id] = derivation;
  }
});

const test = {
  type: "derivationInput/postRequestSuccess",
  payload: {
    id: "fc979d19-e82f-4f5d-9eb8-b89fe57f1ffe",
    raw_lexical_array:
      '[{"text": "John", "language": "en"}, {"text": "d", "language": "func"}]',
    creation_time: "2019-03-05T17:34:46.811854Z",
    created_by: "zechy",
    derivations: ["4da1c734-f0c8-4cec-9d3f-9f867e32806a"]
  }
};

const test2 = {
  type: "subscribe/acknowledge",
  payload: {
    model: "Derivation",
    id: "4da1c734-f0c8-4cec-9d3f-9f867e32806a",
    data: {
      id: "4da1c734-f0c8-4cec-9d3f-9f867e32806a",
      ended: true,
      converged: false,
      first_step: "<John (en) [Phi, person:3, number:singular]>, <d (func) >"
    }
  },
  meta: {
    webSocket: {
      _listeners: {
        error: [],
        message: [],
        open: [],
        close: []
      },
      _retryCount: 0,
      _shouldReconnect: true,
      _connectLock: false,
      _binaryType: "blob",
      _closeCalled: false,
      _messageQueue: [],
      _url: "ws://localhost:8080/redux/",
      _protocols: "",
      _options: {
        minReconnectionDelay: 100,
        reconnectionDelayGrowFactor: 1.75
      },
      _ws: {},
      _connectTimeout: 20,
      _uptimeTimeout: 33
    }
  }
};
