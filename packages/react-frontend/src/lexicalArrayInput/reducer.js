import { uniqBy } from "lodash-es";
import { createReducer } from "redux-starter-kit";
import { replaceSuggestions } from "./actions";

const lexicalArrayInputReducer = createReducer(
  {
    suggestions: [],
    lexicalArray: []
  },
  {
    [replaceSuggestions]: replaceSuggestionsReducer
  }
);

/**
 * Sets the list of lexical item suggestions based on the provided payload.
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

export default lexicalArrayInputReducer;
