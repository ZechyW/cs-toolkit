/**
 * Root notifications saga
 */
import { all } from "redux-saga/effects";

import { webSocketNotification } from "./websocket";

export default function*() {
  yield all([webSocketNotification()]);
}
