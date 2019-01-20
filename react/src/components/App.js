import React, {Component} from "react";
import PropTypes from "prop-types";

import withWSProvider from "./WebSocket";

import DataProvider from "./DataProvider";
import Table from "./Table";
import WSEcho from "./WSEcho";

import Config from "../config";

/**
 * Main application component
 */
class App extends Component {
  static propTypes = {
    // Passed in by the WebSocket provider
    subscribe: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
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
                <WSEcho subscribe={this.props.subscribe}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const AppWithWS = withWSProvider(App, `${Config.wsHost}${Config.wsEndpoint}`);

export default AppWithWS;
