/**
 * A higher-order component that manages WebSocket Pub/Sub against a compatible
 * server.
 *
 * The main mechanism of action is via the `topic` property of the message,
 * which determines who receives it.
 *
 * Because we generally only want one WebSocket connection per URL, we throw
 * warnings if more are attempted.
 */

import React, { Component } from "react";

const allUrls = [];

function withWSProvider(WrappedComponent, wsUrl) {
  // Multiple connection warning
  if (allUrls.indexOf(wsUrl) >= 0) {
    console.warn(
      "Warning: Asked to initiate multiple WebSocket connections to the same URL."
    );
  }
  allUrls.push(wsUrl);

  class WithWSProvider extends Component {
    constructor(props) {
      super(props);

      // Instance properties
      this.socket = null;
      this.state = {
        topicListeners: {}
      };

      // Init
      this.initiateSocket();

      // In case components try to send messages on the WebSocket before
      // it's ready
      this.pendingMessages = [];

      // Will hold a reference to the wrapped component
      this.inner = null;
    }

    render() {
      return (
        <WrappedComponent
          ref={(inner) => (this.inner = inner)}
          subscribe={this.subscribe}
          {...this.props}
        />
      );
    }

    /**
     * Initialises the WebSocket connection to the given URL.
     */
    initiateSocket = () => {
      this.socket = new WebSocket(wsUrl);
      this.socket.onmessage = this._wsReceive;
      this.socket.onopen = () => {
        // Send any pending messages
        while (this.pendingMessages.length > 0) {
          this.socket.send(this.pendingMessages.pop());
        }
      };
    };

    /**
     * Sends some object as JSON data over the WS connection
     * @param data
     * @private
     */
    _wsSend = (data) => {
      if (this.socket.readyState !== 1) {
        this.pendingMessages.push(JSON.stringify(data));
      } else {
        this.socket.send(JSON.stringify(data));
      }
    };

    /**
     * Receives data from the WS server and dispatches it accordingly.
     * @param event
     * @private
     */
    _wsReceive = (event) => {
      const data = JSON.parse(event.data);

      /** @prop data.topic */
      if (data.topic) {
        this.dispatchToListeners(data.topic, data);
      } else {
        console.warn("OOB WS message:", data);
      }
    };

    /**
     * Registers a listener on the given topic.
     * Returns a publisher for use with that topic.
     * @param topic
     * @param newListener
     */
    subscribe = (topic, newListener) => {
      if (typeof newListener !== "function") {
        throw "registerListener called with non-function object.";
      }

      this.setState((state) => {
        let newListeners;
        if (!state.topicListeners[topic]) {
          newListeners = [newListener];
        } else {
          newListeners = state.topicListeners[topic].concat([newListener]);
        }

        return {
          topicListeners: {
            ...state.topicListeners,
            [topic]: newListeners
          }
        };
      });

      // The publisher allows arbitrary messages, as long as the topic is
      // appropriately set
      return (data) => {
        data.topic = topic;
        this._wsSend(data);
      };
    };

    /**
     * Calls all the registered listeners for the given topic with the given
     * data
     * @param topic
     * @param data
     */
    dispatchToListeners = (topic, data) => {
      const listeners = this.state.topicListeners[topic];
      if (listeners) {
        listeners.forEach((listener) => listener(data));
      }
    };
  }

  WithWSProvider.displayName = `WithWSProvider(${getDisplayName(
    WrappedComponent
  )})`;

  return WithWSProvider;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default withWSProvider;
