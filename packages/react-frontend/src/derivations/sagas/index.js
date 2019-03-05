/**
 * Root derivationStatus saga
 */
import { all } from "redux-saga/effects";

import { trackDerivationsFromRequest } from "./derivations";

export default function*() {
  yield all([trackDerivationsFromRequest()]);
}
