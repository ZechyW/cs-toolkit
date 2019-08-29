import axios from "axios";
import { createAction } from "redux-starter-kit";

// Lexical item input
export const addItem = createAction("derivationInput/addItem");
export const deleteItemAtIndex = createAction(
  "derivationInput/deleteItemAtIndex"
);
export const changeItemIndex = createAction("derivationInput/changeItemIndex");

// -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
// Submit derivation generation request
const POST_DERIVATION_REQUEST = "derivationInput/postRequest";
const POST_DERIVATION_REQUEST_LOADING = "derivationInput/postRequestLoading";
const POST_DERIVATION_REQUEST_SUCCESS = "derivationInput/postRequestSuccess";
const POST_DERIVATION_REQUEST_ERROR = "derivationInput/postRequestError";

export const postDerivationRequestLoading = createAction(
  POST_DERIVATION_REQUEST_LOADING
);
export const postDerivationRequestSuccess = createAction(
  POST_DERIVATION_REQUEST_SUCCESS
);
export const postDerivationRequestError = createAction(
  POST_DERIVATION_REQUEST_ERROR
);

/**
 * Thunk to post a derivation request to the backend.
 * - Transforms the input items into lexical item skeletons (text and
 *   language only) before posting.
 * @return {Function}
 */
export function postDerivationRequest(currentInput) {
  const postArray = [];
  // eslint-disable-next-line no-unused-vars
  for (const item of currentInput) {
    postArray.push({
      text: item.text,
      language: item.language
    });
  }

  return async (dispatch) => {
    dispatch(postDerivationRequestLoading(true));

    try {
      const response = await axios.post("/api/grammar/", {
        derivation_input: postArray
      });

      if (response.status === 200) {
        dispatch(postDerivationRequestSuccess(response.data));
      } else {
        dispatch(postDerivationRequestError(response.data));
      }
    } catch (error) {
      // Something went wrong
      if (error.response) {
        dispatch(postDerivationRequestError(error.response.data));
      } else {
        dispatch(postDerivationRequestError("Something went wrong."));
      }
    }
  };
}
postDerivationRequest.toString = () => POST_DERIVATION_REQUEST;
postDerivationRequest.type = POST_DERIVATION_REQUEST;
