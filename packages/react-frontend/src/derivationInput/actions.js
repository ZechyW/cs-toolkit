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
 * @return {Function}
 */
export function postDerivationRequest(payload) {
  return async (dispatch) => {
    dispatch(postDerivationRequestLoading(true));

    try {
      const response = await axios.post("/api/grammar/", {
        derivationInput: payload
      });

      if (response.status === 200) {
        dispatch(postDerivationRequestSuccess(response.data));
      } else {
        dispatch(postDerivationRequestError(response));
      }
    } catch (err) {
      dispatch(postDerivationRequestError(err));
    }
  };
}
postDerivationRequest.toString = () => POST_DERIVATION_REQUEST;
postDerivationRequest.type = POST_DERIVATION_REQUEST;
