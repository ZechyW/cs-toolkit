import { createReducer } from "redux-starter-kit";
import { fetchLexicalItemsSuccess, saveColumnState } from "./actions";

/**
 * Handles actions related to the lexical item list and accompanying table view.
 */
const initialState = {
  lexicalItems: [],
  fetchedLexicalItems: false,

  // ag-grid view
  columnState: []
};

export default createReducer(initialState, {
  [fetchLexicalItemsSuccess]: (state, action) => {
    state.fetchedLexicalItems = true;
    state.lexicalItems = action.payload;
  },

  [saveColumnState]: (state, action) => {
    state.columnState = action.payload;
  }
});
