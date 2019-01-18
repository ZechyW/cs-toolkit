import React, {Component} from "react";

import DataProvider from "./DataProvider";
import Table from "./Table";
import WSEcho from "./WSEcho";

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
      // WS messages for the Echo section
      echoWsMessage: {}
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
                <WSEcho wsSend={this.wsSend}
                        wsMessage={this.state.echoWsMessage}/>
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

    // WS Echo messages
    if (data.type.startsWith("echo")) {
      return this.setState({
        echoWsMessage: data
      });
    }

    console.log("Non-delegated WS event", data);
  };
}


export default App;
