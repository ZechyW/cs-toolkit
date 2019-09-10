import { forOwn } from "lodash-es";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";
import { GridItemWrapper } from "../../grid";
import { actions as wsActions } from "../../websocket";
import {
  reset,
  saveColumnState,
  selectDerivation,
  selectRow
} from "../actions";
import DerivationsTable from "../components/DerivationsTable";
import { getDerivationsAsList } from "../selectors";

/**
 * Container component for the derivation status tracker
 * - Watches for changes to the tracked derivations from the backend
 */
function Derivations(props) {
  // Pull the higher-order props and pass the rest through
  const {
    // Change notifications
    wsConnected,
    wsSubscriptions,
    subscribeRequest,
    requestsById,
    derivationsById,

    ...otherProps
  } = props;

  // Subscribe to WS notifications for each tracked derivation/derivation
  // request
  useEffect(() => {
    if (wsConnected) {
      // Derivation requests
      forOwn(requestsById, (request) => {
        const subscriptionId = `DerivationRequest:${request.id}`;
        if (!wsSubscriptions[subscriptionId]) {
          subscribeRequest({
            model: "DerivationRequest",
            id: request.id
          });
        }
      });

      // Derivations
      forOwn(derivationsById, (derivation) => {
        const subscriptionId = `Derivation:${derivation.id}`;
        if (!wsSubscriptions[subscriptionId]) {
          subscribeRequest({
            model: "Derivation",
            id: derivation.id
          });
        }
      });
    }
  }, [
    wsConnected,
    requestsById,
    derivationsById,
    subscribeRequest,
    wsSubscriptions
  ]);

  return <DerivationsTable {...otherProps} />;
}

Derivations.propTypes = {
  // Websocket subscription management
  wsConnected: PropTypes.bool.isRequired,
  wsSubscriptions: PropTypes.object.isRequired,

  // Actual list of tracked derivations
  derivations: PropTypes.array
};

Derivations.defaultProps = {
  derivations: []
};

/**
 * HOCs and React-redux binding
 */

let Wrapped = Derivations;

Wrapped = GridItemWrapper(Wrapped);

const actionCreators = {
  subscribeRequest: wsActions.subscribeRequest,

  // `ag-grid`
  saveColumnState,

  // Selection for detailed view
  selectRow,
  selectDerivation,

  // Reset table
  resetTable: reset
};

Wrapped = connect(
  createSelector({
    // Pass through to view
    derivations: getDerivationsAsList,
    columnState: "derivations.columnState",
    selectedRow: "derivations.selectedRow",

    // Subscription management
    wsConnected: "websocket.connected",
    wsSubscriptions: "websocket.subscriptions",
    requestsById: "derivations.requestsById",
    derivationsById: "derivations.derivationsById"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
