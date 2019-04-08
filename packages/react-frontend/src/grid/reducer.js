import { createReducer } from "redux-starter-kit";

import Config from "../config";
import { actions as coreActions } from "../core";
import { saveItemMinHeight, saveLayouts } from "./actions";

const initialState = {
  layouts: Config.gridDefaultLayout,
  minHeights: {}
};

export default createReducer(initialState, {
  [saveLayouts]: (state, action) => {
    state.layouts = action.payload;
  },
  [saveItemMinHeight]: (state, action) => {
    const { id, minHeight } = action.payload;
    state.minHeights[id] = minHeight;
  },

  // Reset
  [coreActions.resetGrid]: () => {
    return initialState;
  }
});
