import { createAction } from "redux-starter-kit";
import axios from "axios";
import { lexicalItemToSuggestion } from "../derivationInput";
import { actions as derivationActions } from "../derivationInput";

// -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
// Fetch full lexical item list
const FETCH_LEXICAL_ITEMS = "lexicalItems/fetchLexicalItems";
const FETCH_LEXICAL_ITEMS_LOADING = "lexicalItems/fetchLexicalItemsLoading";
const FETCH_LEXICAL_ITEMS_SUCCESS = "lexicalItems/fetchLexicalItemsSuccess";
const FETCH_LEXICAL_ITEMS_ERROR = "lexicalItems/fetchLexicalItemsError";

export const fetchLexicalItemsLoading = createAction(
  FETCH_LEXICAL_ITEMS_LOADING
);
export const fetchLexicalItemsSuccess = createAction(
  FETCH_LEXICAL_ITEMS_SUCCESS
);
export const fetchLexicalItemsError = createAction(FETCH_LEXICAL_ITEMS_ERROR);

/**
 * Thunk to fetch the list of current lexical items from the backend.
 * @return {Promise<void>}
 */
export function fetchLexicalItems() {
  return async (dispatch) => {
    dispatch(fetchLexicalItemsLoading(true));

    try {
      const response = await axios.get("/api/lexicon/");
      if (response.status === 200) {
        dispatch(fetchLexicalItemsSuccess(response.data));
      } else {
        dispatch(fetchLexicalItemsError(response));
      }
    } catch (err) {
      dispatch(fetchLexicalItemsError(err));
    }
  };
}
fetchLexicalItems.toString = () => FETCH_LEXICAL_ITEMS;
fetchLexicalItems.type = FETCH_LEXICAL_ITEMS;

// -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
// `ag-grid` state
export const saveColumnState = createAction("lexicalItems/saveColumnState");

// -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
// Exporting lexical items to derivation input component
const EXPORT_LEXICAL_ITEMS = "lexicalItems/exportLexicalItems";
/**
 * Thunk to export lexical items to derivation input component
 * @param payload
 */
export function exportLexicalItems(payload) {
  return (dispatch) => {
    // Payload should be an array of lexical items
    for (const lexicalItem of payload) {
      const item = lexicalItemToSuggestion(lexicalItem);
      dispatch(derivationActions.addItem({ item }));
    }
  };
}
exportLexicalItems.toString = () => EXPORT_LEXICAL_ITEMS;
exportLexicalItems.type = EXPORT_LEXICAL_ITEMS;
