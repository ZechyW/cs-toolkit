import { createReducer } from "redux-starter-kit";
import { flipChildren, reset, selectChain, selectFrame } from "./actions";

const initialState = {
  selectedChain: null,
  selectedFrame: 0,
  flippedChildren: {}
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
  },

  /**
   * User clicked on a particular node in the tree;
   * Record its ID, and reverse its `children` array when displaying
   * @param state
   * @param action
   */
  [flipChildren]: (state, action) => {
    // Use the original node ID (saved when pre-processing the tree for display)
    // The `react-d3-tree` display component overrides it with its own UUID
    // otherwise.
    const nodeId = action.payload.cstk_id;
    if (state.flippedChildren[nodeId]) {
      delete state.flippedChildren[nodeId];
    } else {
      state.flippedChildren[nodeId] = true;
    }
  }
});
