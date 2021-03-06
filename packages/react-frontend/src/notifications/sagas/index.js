/**
 * Root notifications saga
 */
import { all } from "redux-saga/effects";

import { derivationNotifications } from "./derivations";
import { webSocketNotification } from "./websocket";

export default function*() {
  yield all([derivationNotifications(), webSocketNotification()]);
}
