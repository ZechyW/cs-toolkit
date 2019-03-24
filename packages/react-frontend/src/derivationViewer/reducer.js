import { createReducer } from "redux-starter-kit";
import { reset, selectChain, selectFrame } from "./actions";

const initialState = {
  selectedChain: null,
  selectedFrame: 0
};

export default createReducer(initialState, {
  [reset]: () => initialState,

  /**
   * User selected a particular chain to view as a timeline.
   * Payload contains the index of the chain to view.
   * @param state
   * @param action
   */
  [selectChain]: (state, action) => {
    state.selectedChain = action.payload;
  },

  /**
   * User selected a particular timeline frame to view within a chain.
   * Payload contains the index of the frame to view.
   * @param state
   * @param action
   */
  [selectFrame]: (state, action) => {
    state.selectedFrame = action.payload;
  }
});
