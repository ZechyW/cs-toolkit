import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import React, { Component } from "react";
import PropTypes from "prop-types";

import withWSProvider from "./WebSocket";

import GridLayout from "./GridLayout";
import ResizeDetector from "react-resize-detector";

import GenerateDerivation from "./GenerateDerivation";
import WSEcho from "./WSEcho";

import DataProvider from "./DataProvider";
import Table from "./Table";

import Config from "../config";

import _ from "lodash";

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

    // Get last layout from localStorage if available
    this.state = {
      layouts: getFromLS("layouts") || {}
    };

    // RGL options (also relevant for calculating item heights, etc.)
    this.margin = [10, 10];
    this.containerPadding = [0, 0];
    this.rowHeight = 1;

    // Updated whenever the GridLayout is updated
    this.currentBreakpoint = "";
    this.width = 0;

    // Will hold refs to each grid child's inner container
    this.items = {};
  }

  render() {
    return (
      <div className="section">
        <div className="container is-fluid">
          <button className="button" onClick={this.resetLayout}>
            Reset Layout
          </button>
          <GridLayout
            className="has-margin-top-10"
            draggableHandle=".grid-title"
            layouts={_.cloneDeep(this.state.layouts)}
            margin={this.margin}
            containerPadding={this.containerPadding}
            rowHeight={this.rowHeight}
            onLayoutChange={this.onLayoutChange}
            onResize={this.onGridItemResize}
            onUpdate={this.handleGridUpdate}
          >
            <div
              className="box grid-box"
              key="generateDerivation"
              data-grid={{ x: 0, y: 0, w: 12, h: 1 }}
            >
              <GenerateDerivation
                subscribe={this.props.subscribe}
                ref={(element) => {
                  this.items.generateDerivation = element;
                }}
              />
            </div>

            <div
              className="box grid-box"
              key="wsEcho"
              data-grid={{ x: 0, y: 1, w: 6, h: 1 }}
            >
              <WSEcho
                subscribe={this.props.subscribe}
                ref={(element) => {
                  this.items.wsEcho = element;
                }}
              />
            </div>

            <div
              className="box grid-box"
              key="lexicalItems"
              data-grid={{ x: 7, y: 1, w: 6, h: 1 }}
            >
              <div
                className="lexical-items grid-child"
                ref={(element) => {
                  this.items.lexicalItems = element;
                }}
              >
                <p className="grid-title">Lexical Items</p>
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
          </GridLayout>
        </div>
      </div>
    );
  }

  /**
   * Receive pertinent layout-related data when the grid component updates
   * @param width
   * @param currentBreakpoint
   */
  handleGridUpdate = (width, currentBreakpoint) => {
    if (width !== this.width) {
      this.autoSizeGridItems();
    }
    this.width = width;
    this.currentBreakpoint = currentBreakpoint;
  };

  /**
   * When the grid layout changes, we save it to localStorage and refresh
   * the component, if necessary
   * @param layout - The current layout
   * @param layouts - Layouts for all configured breakpoints
   */
  onLayoutChange = (layout, layouts) => {
    if (!_.isEqual(layouts, this.state.layouts)) {
      console.log("Setting state: onLayoutChange");
      saveToLS("layouts", layouts);
      this.setState({ layouts }, () => {
        this.autoSizeGridItems();
      });
    }
  };

  /**
   * When some grid item is resized
   * @param layout
   * @param oldItem
   * @param newItem - The new gridItem (not its contents)
   * @param placeholder
   * @param e
   * @param element - One would think it would be the contents of the gridItem,
   *   but it's actually the span containing the resize handle, for some reason
   */
  onGridItemResize = (layout, oldItem, newItem, placeholder, e, element) => {
    // `element` is the span containing the resize handle, not the actual grid
    // item, for some reason
    element = element.parentNode;

    // Make sure that the new item is at least as tall as the content needs
    // it to be
    const id = newItem.i;
    const content = this.items[id];
    const scrollHeight = content.scrollHeight;
    const minGridHeight = this.calculateGridHeight(
      scrollHeight + Config.gridVerticalPadding
    );
    if (newItem.h < minGridHeight) {
      newItem.h = minGridHeight;
      placeholder.h = minGridHeight;
    }

    // In addition, calculate and set .minH for the grid item at the current
    // width
    content.style.height = 0;
    const minScrollHeight = content.scrollHeight;
    content.style.height = "100%";
    newItem.minH = this.calculateGridHeight(
      minScrollHeight + Config.gridVerticalPadding
    );
  };

  /**
   * Reads the current layout in `this.state.layouts`, and makes sure that all
   * items have a height >= the scrollHeight of their contents
   */
  autoSizeGridItems = () => {
    // // Grid items might not be fully redrawn yet
    window.requestAnimationFrame(() => {
      // Figure out whether or not we need to resize any items.
      // We have to do a deep clone of the layout at this breakpoint, because
      // layouts are arrays of objects; if we shallow clone the array, we get
      // the same object references back
      const layout = _.cloneDeep(this.state.layouts[this.currentBreakpoint]);
      let changed = false;
      for (const item of layout) {
        const id = item.i;
        const heightUnits = this.calculateGridHeight(
          this.items[id].scrollHeight + Config.gridVerticalPadding
        );
        if (item.h < heightUnits) {
          item.h = heightUnits;
          changed = true;
        }
      }

      if (changed) {
        console.log("Setting state: autoSizeGridItems");
        this.setState((state) => {
          return {
            layouts: { ...state.layouts, [this.currentBreakpoint]: layout }
          };
        });
      }
    });
  };

  /**
   * Resets the grid layout to the default.
   * If the layout for the current breakpoint is not defined in the default
   * layouts, will attempt to extrapolate one in the same way as the library
   */
  resetLayout = () => {
    console.log("Setting state: Reset");
    this.setState({
      layouts: {}
    });
  };

  /**
   * Converts height in pixels to height in currently configured grid units.
   * @param heightPx
   */
  calculateGridHeight = (heightPx) => {
    return Math.ceil(
      (heightPx + this.margin[1]) / (this.rowHeight + this.margin[1])
    );
  };
}

const AppWithWS = withWSProvider(App, `${Config.wsHost}${Config.wsEndpoint}`);

export default AppWithWS;

/**
 * Retrieves the value from the App's namespace in localStorage, if available
 * @param key
 * @return {*}
 */
function getFromLS(key) {
  let ls = {};
  if (window.localStorage) {
    try {
      ls =
        JSON.parse(window.localStorage.getItem(Config.localStorageKey)) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

/**
 * Saves some key-value pair to the App's namespace in localStorage, if
 * available
 * @param key
 * @param value
 */
function saveToLS(key, value) {
  if (window.localStorage) {
    window.localStorage.setItem(
      Config.localStorageKey,
      JSON.stringify({
        [key]: value
      })
    );
  }
}
