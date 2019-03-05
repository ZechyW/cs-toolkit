import { createReducer } from "redux-starter-kit";
import { actions as wsActions } from "../websocket";
import { saveColumnState } from "./actions";

/**
 * Handles actions related to the lexical item list and accompanying table view.
 * TODO: Make `lexicalItems` an Object keyed by `id`
 */
const initialState = {
  lexicalItems: [],

  // ag-grid view
  columnState: []
};

export default createReducer(initialState, {
  /**
   * The UI wants to save the current `ag-grid` column state.
   * @param state
   * @param action
   */
  [saveColumnState]: (state, action) => {
    state.columnState = action.payload;
  },

  /**
   * Successfully subscribed to LexicalItem changes.
   * @param state
   * @param action
   */
  [wsActions.wsSubscribeAcknowledge]: (state, action) => {
    if (action.payload.model !== "LexicalItem") {
      return;
    }

    // Set
    state.lexicalItems = action.payload.data;
  },

  /**
   * A LexicalItem was changed, or a new LexicalItem was added.
   * @param state
   * @param action
   */
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
  },

  /**
   * A LexicalItem was deleted.
   * @param state
   * @param action
   */
  [wsActions.wsSubscribeDelete]: (state, action) => {
    if (action.payload.model !== "LexicalItem") {
      return;
    }

    // Delete
    for (const lexicalItem of state.lexicalItems) {
      if (lexicalItem.id === action.payload.data.id) {
        const index = state.lexicalItems.indexOf(lexicalItem);
        state.lexicalItems.splice(index, 1);
        return;
      }
    }
  }
});
