import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";
import { GridItemWrapper } from "../../grid";
import { actions as wsActions } from "../../websocket";
import { exportLexicalItems, saveColumnState } from "../actions";
import LexicalItemTable from "../components/LexicalItemTable";
import { getLexicalItemsAsList } from "../selectors";

/**
 * Container component for the lexical item list.
 * - Watches for changes to the available lexical items from the backend
 */
function LexicalItems(props) {
  // Pull the higher-order props and pass the rest through
  const {
    //Websocket
    wsConnected,
    wsSubscribed,
    subscribeRequest,

    ...otherProps
  } = props;

  // Subscribe to WS notifications for the lexical item list
  useEffect(() => {
    if (wsConnected && !wsSubscribed) {
      subscribeRequest({
        model: "LexicalItem"
      });
    }
  }, [wsConnected, wsSubscribed]);

  return <LexicalItemTable {...otherProps} />;
}

LexicalItems.propTypes = {
  // Websocket subscription management
  wsConnected: PropTypes.bool.isRequired,
  wsSubscribed: PropTypes.oneOfType([
    PropTypes.bool,
    // Could have string value "pending"
    PropTypes.string
  ]),

  // Actual lexical item list data
  lexicalItems: PropTypes.array
};

LexicalItems.defaultProps = {
  wsSubscribed: false,
  lexicalItems: []
};

/**
 * HOCs and React-redux binding
 */

let Wrapped = LexicalItems;

Wrapped = GridItemWrapper(Wrapped);

const actionCreators = {
  subscribeRequest: wsActions.subscribeRequest,

  // `ag-grid`
  saveColumnState,

  // Export to derivation input component
  exportLexicalItems
};

Wrapped = connect(
  createSelector({
    // Pass through to view
    lexicalItems: getLexicalItemsAsList,
    columnState: "lexicalItems.columnState",

    // Websocket management
    wsConnected: "websocket.connected",
    wsSubscribed: "websocket.subscriptions.LexicalItem"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
