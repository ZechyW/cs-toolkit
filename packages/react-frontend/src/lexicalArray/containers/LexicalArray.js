import PropTypes from "prop-types";
import React, { useEffect, useLayoutEffect } from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";
import { actions as wsActions } from "../../websocket";
import { addItem, changeItemIndex, deleteItemAtIndex } from "../actions";
import LexicalArrayForm from "../components/LexicalArrayForm";

/**
 * Container component for the lexical array builder
 * - Handles grid-related updates
 * - Watches for new suggestions from the backend
 */
function LexicalArray(props) {
  // Pull the higher-order props and pass the rest through
  const {
    // Grid layout
    gridCheckMinHeight,

    //Websocket
    wsConnected,
    wsSubscribed,
    subscribeRequest,

    ...otherProps
  } = props;

  // Before any re-render, enqueue a height check with our parent
  // (`useLayoutEffect` because the new height might affect the visible
  // height of the parent grid item)
  useLayoutEffect(() => {
    gridCheckMinHeight();
  });

  // Subscribe to WS notifications for the lexical item list
  useEffect(() => {
    if (wsConnected && !wsSubscribed) {
      subscribeRequest({
        model: "LexicalItem"
      });
    }
  });

  return <LexicalArrayForm {...otherProps} />;
}

LexicalArray.propTypes = {
  // For notifying grid parent when our height may have changed
  gridCheckMinHeight: PropTypes.func.isRequired
};

/**
 * React-redux binding
 */
const actionCreators = {
  addItem,
  deleteItemAtIndex,
  changeItemIndex,

  subscribeRequest: wsActions.wsSubscribeRequest
};

export default connect(
  createSelector({
    // Pass through to form
    suggestions: "lexicalArray.suggestions",
    currentInput: "lexicalArray.currentInput",

    // Websocket management
    wsConnected: "websocket.connected",
    wsSubscribed: "websocket.subscriptions.LexicalItem"
  }),
  actionCreators
)(LexicalArray);
