import { createReducer } from "redux-starter-kit";

import { actions as coreActions } from "../core";
import { hideItem, showItem } from "./actions";

const initialState = {
  itemVisibility: {
    derivationInput: true,
    lexicalItemList: true,
    derivationStatusList: true,
    derivationViewer: true
  }
};

export default createReducer(initialState, {
  [showItem]: (state, action) => {
    state.itemVisibility[action.payload] = true;
  },
  [hideItem]: (state, action) => {
    state.itemVisibility[action.payload] = false;
  },

  // Resetting the grid should also reset item visibility options.
  [coreActions.resetGrid]: () => {
    return initialState;
  }
});
