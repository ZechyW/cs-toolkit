/**
 * Derivation-related notifications
 */
import { format } from "date-fns";
import { forOwn } from "lodash-es";
import { all, takeEvery } from "redux-saga/effects";
import { actions as derivationInputActions } from "../../derivationInput";
import { errorNoty, successNoty } from "../util";
import Config from "../../config";

/**
 * Displays notifications for derivation requests.
 */
export function* derivationNotifications() {
  yield all([
    takeEvery(
      [derivationInputActions.postDerivationRequestSuccess],
      derivationSuccessNotification
    ),
    takeEvery(
      [derivationInputActions.postDerivationRequestError],
      derivationErrorNotification
    )
  ]);
}

/**
 * Displays notifications for successfully posted derivation requests.
 */
export function* derivationSuccessNotification(action) {
  const timestamp = format(
    new Date(action.payload.creation_time),
    Config.timestampFormat
  );
  successNoty(
    `<p class="has-text-weight-bold">Successfully requested derivation</p>
<p class="has-margin-top-10">
  The server has started processing the derivation request.
</p>
<p class="has-margin-top-10">(${timestamp})</p>
`,
    { timeout: 3000 }
  ).show();
  yield;
}

/**
 * Displays notifications for derivation request errors.
 */
export function* derivationErrorNotification(action) {
  const errors = action.payload;
  const errorList = [];
  // `errors` is an Object of Arrays of error strings.
  forOwn(errors, (error) => {
    for (const errorString of error) {
      errorList.push(`- ${errorString}`);
    }
  });

  errorNoty(
    `<p class="has-text-weight-bold">Could not generate derivation</p>
<p class="has-margin-top-10">
  ${errorList.join("<br />")}
</p>
`,
    { timeout: 3000 }
  ).show();
  yield;
}
