/**
 * Selectors for the derivation input component
 */
import { uniqBy } from "lodash-es";
import createSelector from "selectorator";
import { lexicalItemToSuggestion } from "./util";

export const getSuggestions = createSelector(
  ["lexicalItems.lexicalItemsById"],
  (lexicalItems) => {
    const newSuggestions = [];

    // Convert to array
    lexicalItems = Object.values(lexicalItems);

    // Deduplicate by suggestion label
    lexicalItems = uniqBy(
      lexicalItems,
      (item) => `${item.text} (${item.language})`
    );

    // eslint-disable-next-line no-unused-vars
    for (const lexicalItem of lexicalItems) {
      // Suggestions need to have an `id` field and `label` field, and we
      // also track the `text` and `language` fields of lexical items directly.
      newSuggestions.push(lexicalItemToSuggestion(lexicalItem));
    }

    return newSuggestions;
  }
);
