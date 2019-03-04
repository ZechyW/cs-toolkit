import { createReducer } from "redux-starter-kit";
import { fetchLexicalItemsSuccess, saveColumnState } from "./actions";
import { actions as wsActions } from "../websocket";

/**
 * Handles actions related to the lexical item list and accompanying table view.
 * TODO: Make `lexicalItems` an Object keyed by `id`
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
  },

  [wsActions.wsSubscribeChange]: (state, action) => {
    if (action.payload.model !== "LexicalItem") {
      return;
    }

    // Update
    for (const lexicalItem of state.lexicalItems) {
      if (lexicalItem.id === action.payload.data.id) {
        const index = state.lexicalItems.indexOf(lexicalItem);
        state.lexicalItems.splice(index, 1, action.payload.data);
        return;
      }
    }

    // New item
    state.lexicalItems.push(action.payload.data);
  }
});
