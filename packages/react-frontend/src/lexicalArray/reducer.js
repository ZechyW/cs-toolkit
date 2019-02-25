import { uniqBy } from "lodash-es";
import { createReducer } from "redux-starter-kit";
import {
  addItem,
  changeItemIndex,
  deleteItemAtIndex,
  fetchLexicalItemsSuccess
} from "./actions";
import { actions as wsActions } from "../websocket";

const lexicalArrayReducer = createReducer(
  {
    currentInput: [],
    suggestions: [],
    lexicalItems: [],
    fetchedLexicalItems: false
  },
  {
    // Lexical items -> Suggestions
    [fetchLexicalItemsSuccess]: (state, action) => {
      state.fetchedLexicalItems = true;
      state.lexicalItems = action.payload;
      return replaceSuggestionsReducer(state, { payload: state.lexicalItems });
    },
    [wsActions.wsClose]: (state) => {
      state.lexicalItems = [];
      state.fetchedLexicalItems = false;
    },

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

/**
 * Sets the list of suggestions based on the provided payload of lexical items.
 *
 * The list of lexical items may contain duplicates (for items with the
 * same text/language but different features), so we need to deduplicate
 * as we go.
 */
export function replaceSuggestionsReducer(state, action) {
  const newSuggestions = [];

  // Deduplicate by suggestion label
  const lexicalItems = uniqBy(
    action.payload,
    (item) => `${item.text} (${item.language})`
  );

  for (const lexicalItem of lexicalItems) {
    // Suggestions need to have an `id` field and `label` field, and we
    // also track the `text` and `language` fields of lexical items directly.
    newSuggestions.push({
      id: `${lexicalItem.text}`,
      text: `${lexicalItem.text}`,
      label: `${lexicalItem.text} (${lexicalItem.language})`,
      language: lexicalItem.language
    });
  }

  state.suggestions = newSuggestions;
}

export default lexicalArrayReducer;
