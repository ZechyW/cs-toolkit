import { createReducer } from "redux-starter-kit";
import { actions as wsActions } from "../websocket";
import { saveColumnState } from "./actions";

/**
 * Handles actions related to the lexical item list and accompanying table view.
 * TODO: Make `lexicalItems` an Object keyed by `id`
 */
const initialState = {
  lexicalItemsById: {},

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
  [wsActions.subscribeAcknowledge]: (state, action) => {
    if (action.payload.model !== "LexicalItem") {
      return;
    }

    // Set
    state.lexicalItemsById = {};
    // eslint-disable-next-line no-unused-vars
    for (const lexicalItem of action.payload.data) {
      state.lexicalItemsById[lexicalItem.id] = lexicalItem;
    }
  },

  /**
   * A LexicalItem was changed, or a new LexicalItem was added.
   * @param state
   * @param action
   */
  [wsActions.subscribeChange]: (state, action) => {
    if (action.payload.model !== "LexicalItem") {
      return;
    }

    // Update
    const lexicalItem = action.payload.data;
    state.lexicalItemsById[lexicalItem.id] = lexicalItem;
  },

  /**
   * A LexicalItem was deleted.
   * @param state
   * @param action
   */
  [wsActions.subscribeDelete]: (state, action) => {
    if (action.payload.model !== "LexicalItem") {
      return;
    }

    // Delete
    delete state.lexicalItemsById[action.payload.data.id];
  }
});
