/**
 * Selectors for the LexicalItemList component
 */
import createSelector from "selectorator";

export const getLexicalItemsAsList = createSelector(
  ["lexicalItems.lexicalItemsById"],
  (lexicalItemsById) => {
    return Object.values(lexicalItemsById);
  }
);
