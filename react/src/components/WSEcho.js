import React, {Component} from "react";
import PropTypes from "prop-types";

import _ from "lodash";
import {Howl} from "howler";
import gfynonce from "gfynonce";

import {library} from "@fortawesome/fontawesome-svg-core";
import {faVolumeUp, faVolumeMute} from "@fortawesome/free-solid-svg-icons";

library.add(faVolumeUp, faVolumeMute);

import Table from "./Table";

/**
 * Sub-component for WebSocket echo section
 */
class WSEcho extends Component {
  static propTypes = {
    // Send a JS object to the WebSocket server
    wsSend: PropTypes.func.isRequired,

    // Receive a response
    wsMessage: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      // Room properties
      subscribed: false,
      username: gfynonce({adjectives: 1}),
      allUsers: [],

      // Notification sounds
      playAudio: true,

      // Table data
      tableData: [],

      // Form data
      errorText: "",
      message: ""
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
    if (!this.state.subscribed) {
      // Username selection input
      controls = (
        <form className="field is-grouped" onSubmit={this.submitUsername}>
          <div className="control is-expanded">
            <input name="username"
                   className="input"
                   type="text"
                   value={this.state.username}
                   onChange={this.handleInputChange}
                   onFocus={this.selectText}
                   ref={this.inputRef}/>
            {this.renderErrorText()}
          </div>
          <div className="control">
            <button className="button is-primary">
              Select username
            </button>
          </div>
        </form>
      );
    } else {
      // Message input
      controls = (
        <>
          <div className="columns is-multiline">
            <div className="column">
              <form className="field is-grouped" onSubmit={this.submitMessage}>
                <p className="control is-expanded">
                  <input name="message"
                         className="input"
                         type="text"
                         placeholder="Send message"
                         value={this.state.message}
                         onChange={this.handleInputChange}/>
                  {this.renderErrorText()}
                </p>
                <div className="control">
                  <button className="button is-primary">
                    Send
                  </button>
                </div>
              </form>
            </div>

            <div className="column is-narrow">
              <button className="button is-info" onClick={this.testMessage}>Send test message</button>
            </div>

            <div className="column is-full">
              <h3>Current users: {
                this.state.allUsers.map((name, index) => {
                  const boldSelf = name === this.state.username
                    ? <strong>{name}</strong>
                    : name;
                  return index < this.state.allUsers.length - 1
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
        <div className="title is-4 flex-row align-items-center">
          <span className="has-padding-right-10">WebSocket Echo Test</span>
          <span className="icon has-text-primary is-size-6 has-cursor-pointer"
                onClick={this.toggleAudio}>
            <i className={"fas fa-fw " + (this.state.playAudio ? "fa-volume-up" : "fa-volume-mute")}/>
          </span>
        </div>

        {controls}

        <Table data={this.state.tableData}
               tableClass="is-narrow"
               containerStyle={{
                 maxHeight: "40vh",
                 overflowY: "auto"
               }}/>
      </div>
    );
  }

  /**
   * One of our props/states has changed -- Probably a message from the WS server
   * @param prevProps
   */
  componentDidUpdate(prevProps, /*prevState, snapshot*/) {
    // Check WS messages
    if (!_.isEqual(prevProps.wsMessage, this.props.wsMessage)) {
      const data = this.props.wsMessage;

      // A new user: It's either ourselves, or someone else
      if (data.type === "echo_new_user") {
        const newState = {
          allUsers: data["all_users"]
        };
        const newRow = {
          timestamp: data.timestamp,
          username: "System"
        };

        if (data["new_user"] === this.state.username) {
          newRow.message = <>Subscribed with username: <strong>{data["new_user"]}</strong></>;
          newState.subscribed = true;
        } else {
          newRow.message = <>New user: <strong>{data["new_user"]}</strong></>;
          this.playNotification();
        }

        return this.setState((state) => {
          newState.tableData = [newRow, ...state.tableData];
          return newState;
        });
      }

      // A user left
      if (data.type === "echo_del_user") {
        const newState = {
          allUsers: data["all_users"]
        };
        const newRow = {
          timestamp: data.timestamp,
          username: "System",
          message: <>User left: <strong>{data["del_user"]}</strong></>
        };

        this.playNotification();

        return this.setState((state) => {
          newState.tableData = [newRow, ...state.tableData];
          return newState;
        });
      }

      // New broadcast message
      if (data.type === "echo_message") {
        const newRow = _.pick(data, ["timestamp", "username", "message"]);

        // Notification if it was from someone else
        if (data.username !== this.state.username) {
          this.playNotification();
        }

        return this.setState((state) => {
          return {
            tableData: [newRow, ...state.tableData]
          };
        });
      }

      // Something went wrong
      if (data.type === "echo_error") {

        let errorText;
        if (data.message === "username-in-use") {
          errorText = "Username already in use.";
        } else if (data.message === "invalid-data") {
          errorText = "Invalid data.";
        }

        return this.setState({
          errorText
        });
      }
    }
  }

  /**
   * For controlled form components
   * @param event
   */
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  /**
   * Toggles audio notifications
   */
  toggleAudio = () => {
    return this.setState((state) => {
      return {
        playAudio: !state.playAudio
      };
    });
  };

  /**
   * Plays the notification sound if audio is not muted
   */
  playNotification = () => {
    if (this.state.playAudio) {
      this.notificationSound.play(undefined, undefined);
    }
  };

  /**
   * Selects all the text in the given element
   * @param event
   */
  selectText = (event) => {
    event.target.select();
  };

  /**
   * Checks if a submitted username is valid, providing a message if it isn't
   */
  renderErrorText = () => {
    if (this.state.errorText) {
      // There was an error
      this.inputRef.current.select();
      return <p className="help is-danger">{this.state.errorText}</p>;
    }
  };

  /**
   * Tries to subscribe to the echo group with the given username
   */
  submitUsername = (event) => {
    event.preventDefault();

    this.props.wsSend({
      type: "subscribe",
      username: this.state.username
    });
  };

  /**
   * Sends the current custom message over the WebSocket and resets the value
   */
  submitMessage = (event) => {
    event.preventDefault();

    this.props.wsSend(
      {message: this.state.message}
    );

    this.setState({
      message: ""
    });
  };

  /**
   * Sends a random test message over the WebSocket
   */
  testMessage = () => {
    this.props.wsSend(
      {message: `Test ${Math.floor((Math.random() * 1000) + 1)}`}
    );
  };
}

export default WSEcho;