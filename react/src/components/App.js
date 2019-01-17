import React, {Component} from "react";
import PropTypes from "prop-types";

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

    if (data.type === "echo_message") {
      // Update the echo table
      const newRow = {
        timestamp: data.timestamp,
        message: data.message
      };

      this.setState((state) => {
        return {
          echoTableData: [...state.echoTableData, newRow]
        };
      });
    }
  };
}

/**
 * Sub-component for WebSocket echo section
 */
class EchoSection extends Component {
  static propTypes = {
    // Send a JS object to the WebSocket server
    wsSend: PropTypes.func.isRequired,

    // Table data
    tableData: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      customMessage: ""
    };
  }

  render() {
    return (
      <div className="echo-section box">
        <p className="title is-4">WebSocket Echo Test</p>

        <div className="columns">
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
        </div>

        <Table data={this.props.tableData}/>
      </div>
    );
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
   * Tracks any changes to the custom message value
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
