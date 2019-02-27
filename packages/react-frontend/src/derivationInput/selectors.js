/**
 * Selectors for the derivation input component
 */
import { uniqBy } from "lodash-es";
import createSelector from "selectorator";

export const getSuggestions = createSelector(
  ["lexicalItems.lexicalItems"],
  (lexicalItems) => {
    const newSuggestions = [];

    // Deduplicate by suggestion label
    lexicalItems = uniqBy(
      lexicalItems,
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

    return newSuggestions;
  }
);