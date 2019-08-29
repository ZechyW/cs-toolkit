import { put, takeEvery } from "redux-saga/effects";
import { actions as derivationInputActions } from "../../derivationInput";
import { actions as wsActions } from "../../websocket";

/**
 * Watches for successfully posted DerivationRequests and subscribes to
 * their corresponding Derivations.
 */
export function* trackDerivationsFromRequest() {
  yield takeEvery(
    [derivationInputActions.postDerivationRequestSuccess],
    subscribeDerivationsInRequest
  );
}

/**
 * Parses a given DerivationRequest notification and subscribes to the
 * corresponding Derivations.
 * @param action
 */
export function* subscribeDerivationsInRequest(action) {
  const derivations = action.payload.derivations;
  // eslint-disable-next-line no-unused-vars
  for (const derivation of derivations) {
    yield put(
      wsActions.subscribeRequest({
        model: "Derivation",
        id: derivation
      })
    );
  }
}
