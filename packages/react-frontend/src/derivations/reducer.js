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
   * Successfully subscribed to a particular Derivation/DerivationRequest.
   * @param state
   * @param action
   */
  [wsActions.subscribeAcknowledge]: (state, action) => {
    if (action.payload.model === "Derivation") {
      const derivation = action.payload.data;
      state.derivationsById[derivation.id] = derivation;
    }

    if (action.payload.model === "DerivationRequest") {
      const request = action.payload.data;
      state.requestsById[request.id] = request;
    }
  },

  /**
   * A Derivation/DerivationRequest was changed/added.
   * @param state
   * @param action
   */
  [wsActions.subscribeChange]: (state, action) => {
    if (action.payload.model === "Derivation") {
      const derivation = action.payload.data;
      state.derivationsById[derivation.id] = derivation;
    }

    if (action.payload.model === "DerivationRequest") {
      const request = action.payload.data;
      state.requestsById[request.id] = request;
    }
  },

  /**
   * A Derivation/DerivationRequest was deleted.
   * @param state
   * @param action
   */
  [wsActions.subscribeDelete]: (state, action) => {
    if (action.payload.model === "Derivation") {
      const derivation = action.payload.data;
      delete state.derivationsById[derivation.id];
    }

    if (action.payload.model === "DerivationRequest") {
      const request = action.payload.data;
      delete state.requestsById[request.id];
    }
  },

  /**
   * There was a problem subscribing to the given Derivation/DerivationRequest.
   * @param state
   * @param action
   */
  [wsActions.subscribeError]: (state, action) => {
    // Stop tracking any Derivations/DerivationRequests that are no longer
    // valid.  (This could happen if the database is cleared out from the
    // server end)
    if (action.payload.model === "Derivation") {
      delete state.derivationsById[action.payload.id];
    }

    if (action.payload.model === "DerivationRequest") {
      delete state.requestsById[action.payload.id];
    }
  }
});
