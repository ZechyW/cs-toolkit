import { createAction } from "redux-starter-kit";
import axios from "axios";

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
 * Thunk to fetch the list of current lexical items from the backend
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

// Save various bits of ag-grid state
export const saveColumnState = createAction("lexicalItems/saveColumnState");
