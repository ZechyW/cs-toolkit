import { createReducer } from "redux-starter-kit";
import { addItem, changeItemIndex, deleteItemAtIndex } from "./actions";

const derivationInputReducer = createReducer(
  {
    currentInput: []
  },
  {
    // Input items
    [addItem]: (state, action) => {
      const { item } = action.payload;
      state.currentInput.push(item);
    },
    [deleteItemAtIndex]: (state, action) => {
      const { index } = action.payload;
      state.currentInput = state.currentInput.filter((item, i) => index !== i);
    },
    [changeItemIndex]: (state, action) => {
      const { item, oldIndex, newIndex } = action.payload;
      state.currentInput.splice(oldIndex, 1);
      state.currentInput.splice(newIndex, 0, item);
    }
  }
);
export default derivationInputReducer;
