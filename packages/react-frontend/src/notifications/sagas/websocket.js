/**
 * Websocket-related notifications
 */
import { race, take } from "redux-saga/effects";

import { actions as wsActions } from "../../websocket";
import { errorNoty, successNoty } from "../util";

/**
 * Displays websocket connection notifications.
 * Spawns notifications on connection failure, and when the connection is
 * re-established.
 */
export function* webSocketNotification() {
  let connectingNoty = errorNoty();
  let hasConnected = false;

  while (true) {
    const { open, close } = yield race({
      open: take([wsActions.open]),
      close: take([wsActions.close])
    });

    if (open) {
      // The re-connection notification should only be shown from the second
      // time onwards.
      if (hasConnected) {
        successNoty("Connection re-established.").show();
      } else {
        hasConnected = true;
      }

      // We don't seem to be able to re-use closed Noty instances --
      // Create a new one for the next time the connection goes down.
      connectingNoty = errorNoty();
    } else if (close) {
      connectingNoty
        .show()
        .setText(
          '<p class="has-text-weight-bold">Connection to server lost</p>\n<p class="has-margin-top-10">\n  We will keep trying to reconnect even if this notification is closed.\n</p>' +
            '\n<p class="has-margin-top-10">\n  The lexical item list and other data views may be inaccurate while we are\n  offline, but changes you make to the derivation input and other forms will\n  continue to be saved.' +
            "\n</p>\n",
          true
        );
    }
  }
}
