import { createAction } from "redux-starter-kit";

// Suggestions list
export const replaceSuggestions = createAction(
  "lexicalArray/replaceSuggestions"
);

// Lexical item input
export const addItem = createAction("lexicalArray/addItem");
export const deleteItemAtIndex = createAction("lexicalArray/deleteItemAtIndex");
export const changeItemIndex = createAction("lexicalArray/changeItemIndex");
