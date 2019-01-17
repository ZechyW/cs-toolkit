import React, {Component} from "react";
import PropTypes from "prop-types";

import _ from "lodash";
import {Howl, Howler} from "howler";
import gfynonce from "gfynonce";

import DataProvider from "./DataProvider";
import Table from "./Table";

import Config from "../config";

/**
 * Main application component
 */
class App extends Component {
  constructor(props) {
    super(props);

    // Prepare the main WebSocket connection
    this.socket = new WebSocket(`${Config.wsHost}${Config.wsEndpoint}`);
    this.socket.onmessage = this.wsReceive;

    this.state = {
      echoSubscribed: false,
      echoErrorText: "",
      echoUsername: gfynonce({adjectives: 1}),
      echoAllUsers: [],
      echoTableData: []
    };
  }

  render() {
    return (
      <div className="app">
        <div className="section">
          <div className="container">
            <div className="columns is-multiline is-centered">
              <div className="column is-narrow">
                <div className="lexicon-section box">
                  <p className="title is-4">Lexical Items</p>
                  <DataProvider endpoint="api/lexicon/"
                                render={data => <Table data={data}/>}/>
                </div>
              </div>

              <div className="column">
                <EchoSection wsSend={this.wsSend}
                             updateUsername={this.echoUpdateUsername}
                             subscribed={this.state.echoSubscribed}
                             errorText={this.state.echoErrorText}
                             username={this.state.echoUsername}
                             allUsers={this.state.echoAllUsers}
                             tableData={this.state.echoTableData}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Sends the given data to the WS server as a JSON string
   * @param data {Object}
   */
  wsSend = (data) => {
    this.socket.send(JSON.stringify(data));
  };

  /**
   * Processes data received from the WS server
   * @param event
   */
  wsReceive = (event) => {
    const data = JSON.parse(event.data);

    console.log("WS:", data, this.state);

    if (data.type === "echo_new_user") {
      // A new user: It's either ourselves, or someone else
      const newState = {
        echoAllUsers: data.all_users
      };
      const newRow = {
        timestamp: data.timestamp,
        username: "System"
      };

      if (data.new_user === this.state.echoUsername) {
        newRow.message = <>Subscribed with username: <strong>{data.new_user}</strong></>;
        newState.echoSubscribed = true;
      } else {
        newRow.message = <>New user: <strong>{data.new_user}</strong></>;
      }

      return this.setState((state) => {
        newState.echoTableData = [...state.echoTableData, newRow];
        return newState;
      });
    }

    if (data.type === "echo_del_user") {
      // A user left
      const newState = {
        echoAllUsers: data.all_users
      };
      const newRow = {
        timestamp: data.timestamp,
        username: "System",
        message: <>User left: <strong>{data.del_user}</strong></>
      };

      return this.setState((state) => {
        newState.echoTableData = [...state.echoTableData, newRow];
        return newState;
      });
    }

    if (data.type === "echo_message") {
      // Update the echo table
      const newRow = _.pick(data, ["timestamp", "username", "message"]);

      return this.setState((state) => {
        return {
          echoTableData: [...state.echoTableData, newRow]
        };
      });
    }

    if (data.type === "echo_error") {
      // Something went wrong
      let errorText;

      if (data.message === "username-in-use") {
        errorText = "Username already in use.";
      } else if (data.message === "invalid-data") {
        errorText = "Invalid data.";
      }

      return this.setState({
        echoErrorText: errorText
      });
    }
  };

  /**
   * Tracks any changes to the echo section's username input, clearing any errors
   * @param event
   */
  echoUpdateUsername = (event) => {
    this.setState({
      echoUsername: event.target.value,
      echoErrorText: ""
    });
  };
}

/**
 * Sub-component for WebSocket echo section
 */
class EchoSection extends Component {
  static propTypes = {
    // Send a JS object to the WebSocket server
    wsSend: PropTypes.func.isRequired,

    // Username update function from parent to give parent access to the username
    updateUsername: PropTypes.func.isRequired,

    subscribed: PropTypes.bool.isRequired,
    errorText: PropTypes.string,
    username: PropTypes.string.isRequired,
    allUsers: PropTypes.array.isRequired,
    tableData: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      customMessage: ""
    };

    this.notificationSound = new Howl({
      src: ["static/frontend/notification.mp3"]
    });

    // For selecting text inputs that contain errors
    this.inputRef = React.createRef();
  }

  render() {
    // The content of the input area changes depending on whether or not we are subscribed
    let controls;
    if (!this.props.subscribed) {
      controls = (
        <form className="field is-grouped" onSubmit={this.submitUsername}>
          <div className="control is-expanded">
            <input className="input" type="text"
                   value={this.props.username}
                   onChange={this.props.updateUsername}
                   onFocus={this.selectText}
                   ref={this.inputRef}/>
            {this.validateUsername()}
          </div>
          <div className="control">
            <button className="button is-info">
              Select username
            </button>
          </div>
        </form>
      );
    } else {
      controls = (
        <>
          <div className="columns is-multiline">
            <div className="column">
              <form className="field is-grouped" onSubmit={this.submitCustomMessage}>
                <p className="control is-expanded">
                  <input className="input" type="text" placeholder="Send custom message"
                         value={this.state.customMessage}
                         onChange={this.updateCustomMessage}/>
                </p>
                <div className="control">
                  <button className="button is-info">
                    Send
                  </button>
                </div>
              </form>
            </div>

            <div className="column is-narrow">
              <button className="button is-primary" onClick={this.testMessage}>Send test message</button>
            </div>

            <div className="column is-full">
              <h3>Current users: {
                this.props.allUsers.map((name, index) => {
                  const boldSelf = name === this.props.username
                    ? <strong>{name}</strong>
                    : name;
                  return index < this.props.allUsers.length - 1
                    ? <span key={name}>{boldSelf}, </span>
                    : <span key={name}>{boldSelf}</span>;
                })
              }</h3>
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="echo-section box">
        <p className="title is-4">WebSocket Echo Test</p>

        {controls}

        <Table data={this.props.tableData} narrow={true}/>
      </div>
    );
  }

  componentDidUpdate(prevProps, /* prevState, snapshot*/) {
    if (!_.isEqual(prevProps.tableData, this.props.tableData)) {
      this.notificationSound.play();
    }
  }

  /**
   * Sends a random test message over the WebSocket
   */
  testMessage = () => {
    this.props.wsSend(
      {message: `Test ${Math.floor((Math.random() * 1000) + 1)}`}
    );
  };

  /**
   * Selects all the text in the given element
   * @param event
   */
  selectText = (event) => {
    event.target.select();
  };

  /**
   * Tries to subscribe to the echo group with the given username
   */
  submitUsername = (event) => {
    event.preventDefault();

    this.props.wsSend({
      type: "subscribe",
      username: this.props.username
    });
  };

  /**
   * Checks if a submitted username is valid, providing a message if it isn't
   */
  validateUsername = () => {
    if (this.props.errorText) {
      // There was an error
      this.inputRef.current.select();
      return <p className="help is-danger">{this.props.errorText}</p>;
    }
  };

  /**
   * Tracks any changes to the custom message input
   * @param event
   */
  updateCustomMessage = (event) => {
    this.setState({
      customMessage: event.target.value
    });
  };

  /**
   * Sends the current custom message over the WebSocket and resets the value
   */
  submitCustomMessage = (event) => {
    event.preventDefault();

    this.props.wsSend(
      {message: this.state.customMessage}
    );

    this.setState({
      customMessage: ""
    });
  };
}

export default App;
