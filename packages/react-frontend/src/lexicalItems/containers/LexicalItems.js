import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";
import { GridItemWrapper } from "../../grid";
import { actions as wsActions } from "../../websocket";
import { fetchLexicalItems, saveColumnState } from "../actions";
import LexicalItemTable from "../components/LexicalItemTable";

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

    // Suggestion list management
    fetchLexicalItems,
    fetchedLexicalItems,

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

  // Fetch the lexical item list if we haven't done so yet
  useEffect(() => {
    if (!fetchedLexicalItems) {
      fetchLexicalItems();
    }
  }, [fetchedLexicalItems]);

  return <LexicalItemTable {...otherProps} />;
}

LexicalItems.propTypes = {
  // Websocket subscription management
  wsConnected: PropTypes.bool.isRequired,
  wsSubscribed: PropTypes.bool,

  // Direct API call for fetching lexical item list
  fetchLexicalItems: PropTypes.func.isRequired,
  fetchedLexicalItems: PropTypes.bool.isRequired,

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
  subscribeRequest: wsActions.wsSubscribeRequest,
  fetchLexicalItems,

  // ag-grid
  saveColumnState
};

Wrapped = connect(
  createSelector({
    // Pass through to view
    lexicalItems: "lexicalItems.lexicalItems",
    columnState: "lexicalItems.columnState",

    // Fetch the lexical item list on first load
    fetchedLexicalItems: "lexicalItems.fetchedLexicalItems",

    // Websocket management
    wsConnected: "websocket.connected",
    wsSubscribed: "websocket.subscriptions.LexicalItem"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
