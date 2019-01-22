import React, { Component } from "react";
import PropTypes from "prop-types";

import withWSProvider from "./WebSocket";

import DataProvider from "./DataProvider";
import Table from "./Table";

import GenerateDerivation from "./GenerateDerivation";
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
      <div className="section">
        <div className="container is-fluid">
          <div className="tile is-ancestor">
            <div className="tile is-12 is-vertical">
              <div className="tile is-parent">
                <div className="tile is-child box">
                  <GenerateDerivation subscribe={this.props.subscribe} />
                </div>
              </div>

              <div className="tile">
                <div className="tile is-parent">
                  <div className="tile is-child box">
                    <WSEcho subscribe={this.props.subscribe} />
                  </div>
                </div>

                <div className="tile is-parent">
                  <div className="tile is-child box">
                    <p className="title is-4">Lexical Items</p>
                    <DataProvider
                      endpoint="api/lexicon/"
                      render={(data) => (
                        <Table
                          data={data}
                          containerStyle={{
                            overflow: "auto"
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
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
