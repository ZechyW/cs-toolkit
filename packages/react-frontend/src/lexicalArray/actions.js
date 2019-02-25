import { createAction } from "redux-starter-kit";
import axios from "axios";

// Lexical item input
export const addItem = createAction("lexicalArray/addItem");
export const deleteItemAtIndex = createAction("lexicalArray/deleteItemAtIndex");
export const changeItemIndex = createAction("lexicalArray/changeItemIndex");

// Suggestions list
const FETCH_LEXICAL_ITEMS = "lexicalArray/fetchLexicalItems";
const FETCH_LEXICAL_ITEMS_LOADING = "lexicalArray/fetchLexicalItemsLoading";
const FETCH_LEXICAL_ITEMS_SUCCESS = "lexicalArray/fetchLexicalItemsSuccess";
const FETCH_LEXICAL_ITEMS_ERROR = "lexicalArray/fetchLexicalItemsError";

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
