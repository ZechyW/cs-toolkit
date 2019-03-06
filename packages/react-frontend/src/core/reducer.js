import { createReducer } from "redux-starter-kit";
import { hideItem, showItem } from "./actions";

const initialState = {
  itemVisibility: {
    derivationInput: true,
    lexicalItemList: true,
    derivationStatusList: true
  }
};

export default createReducer(initialState, {
  [showItem]: (state, action) => {
    state.itemVisibility[action.payload] = true;
  },
  [hideItem]: (state, action) => {
    state.itemVisibility[action.payload] = false;
  }
});
