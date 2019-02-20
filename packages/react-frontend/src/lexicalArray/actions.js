import { createAction } from "redux-starter-kit";

export const replaceSuggestions = createAction(
  "lexicalArray/replaceSuggestions"
);
export const addItem = createAction("lexicalArray/addItem");
export const deleteItemAtIndex = createAction("lexicalArray/deleteItemAtIndex");
