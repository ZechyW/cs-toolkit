import { createAction } from "redux-starter-kit";
import axios from "axios";

// Lexical item input
export const addItem = createAction("derivationInput/addItem");
export const deleteItemAtIndex = createAction(
  "derivationInput/deleteItemAtIndex"
);
export const changeItemIndex = createAction("derivationInput/changeItemIndex");

// Suggestions list
const FETCH_LEXICAL_ITEMS = "derivationInput/fetchLexicalItems";
const FETCH_LEXICAL_ITEMS_LOADING = "derivationInput/fetchLexicalItemsLoading";
const FETCH_LEXICAL_ITEMS_SUCCESS = "derivationInput/fetchLexicalItemsSuccess";
const FETCH_LEXICAL_ITEMS_ERROR = "derivationInput/fetchLexicalItemsError";

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
      const response = await axios.get("/api/lexicon/?fields=id,text,language");
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
