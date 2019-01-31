import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import React, { Component } from "react";
import PropTypes from "prop-types";

import _ from "lodash";

import withWSProvider from "./WebSocket";
import GridLayout from "./GridLayout";
import GenerateDerivation from "./GenerateDerivation";
import WSEcho from "./WSEcho";
import DataProvider from "./DataProvider";
import Table from "./Table";

import Config from "../config";
import { getFromLS, saveToLS } from "../util";

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
      layouts: getFromLS("layouts") || Config.gridDefaultLayout
    };

    // RGL options (also relevant for calculating item heights, etc.)
    this.margin = [10, 10];
    this.containerPadding = [15, 15];
    this.rowHeight = 30;

    // Updated whenever the GridLayout is updated
    this.currentBreakpoint = "";
    this.width = 0;

    // Will hold refs to each grid item's inner container
    this.items = {};

    // Which grid items to autosize (compacting when possible)
    this.autosize = getFromLS("autosize") || Config.gridDefaultAutosize;
  }

  render() {
    return (
      <GridLayout
        draggableHandle=".grid-title"
        layouts={_.cloneDeep(this.state.layouts)}
        margin={this.margin}
        containerPadding={this.containerPadding}
        rowHeight={this.rowHeight}
        onLayoutChange={this.onLayoutChange}
        onResize={this.onGridItemResize}
        onUpdate={this.handleGridUpdate}
      >
        <div className="box grid-box" key="generateDerivation">
          <GenerateDerivation
            subscribe={this.props.subscribe}
            onUpdate={() => this.handleChildUpdate("generateDerivation")}
            ref={(element) => {
              this.items.generateDerivation = element;
            }}
          />
        </div>

        <div className="box grid-box" key="wsEcho">
          <WSEcho
            subscribe={this.props.subscribe}
            onUpdate={() => this.handleChildUpdate("wsEcho")}
            ref={(element) => {
              this.items.wsEcho = element;
            }}
          />
        </div>

        <div className="box grid-box" key="lexicalItems">
          <div
            className="lexical-items grid-child"
            ref={(element) => {
              this.items.lexicalItems = element;
            }}
          >
            <p className="grid-title">Lexical Items</p>
            <DataProvider
              endpoint="api/lexicon/?fields=text,language,features"
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
    );
  }

  componentDidUpdate() {
    console.log(
      "Check: Shouldn't be needing to call this here once all" +
        " components are factored out of the main App component."
    );
    this.autosizeGridItems();
  }

  /**
   * Receive pertinent layout-related data when the grid component updates
   * @param width
   * @param currentBreakpoint
   */
  handleGridUpdate = (width, currentBreakpoint) => {
    if (width !== this.width) {
      this.autosizeGridItems();
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
        this.autosizeGridItems();
      });
    }
  };

  /**
   * When some grid item is resized
   * @param layout
   * @param oldItem
   * @param newItem - The new gridItem (not its contents)
   * @param placeholder
   */
  onGridItemResize = (layout, oldItem, newItem, placeholder) => {
    // Start by determining minimum scroll height for the item
    const id = newItem.i;
    const content = this.items[id];
    content.style.height = 0;
    const minScrollHeight = content.scrollHeight;
    content.style.height = "100%";

    // Set .minH, and either .h (for non-autosized items) or .maxH (for
    // autosized items)
    const minGridHeight = this.calculateGridHeight(
      minScrollHeight + Config.gridVerticalPadding
    );
    newItem.minH = minGridHeight;
    newItem.h = Math.max(newItem.minH, newItem.h);

    if (this.autosize[id]) {
      newItem.maxH = minGridHeight;
      newItem.h = minGridHeight;
      placeholder.h = minGridHeight;
    }
  };

  handleChildUpdate = (id) => {
    console.log("Child updated:", id);
    this.autosizeGridItems([id]);
  };

  /**
   * Reads the current layout in `this.state.layouts`, and makes sure that all
   * items have a height >= the scrollHeight of their contents
   * @param {...String[]} itemsToCheck - An array containing the IDs of the
   *   items to autosize. Will autosize all items if undefined.
   */
  autosizeGridItems = (itemsToCheck) => {
    // // Grid items might not be fully redrawn yet
    window.requestAnimationFrame(() => {
      // Figure out whether or not we need to resize any items.
      // We have to do a deep clone of the layout at this breakpoint, because
      // layouts are arrays of objects; if we shallow clone the array, we get
      // the same object references back
      const layout = _.cloneDeep(this.state.layouts[this.currentBreakpoint]);
      itemsToCheck = itemsToCheck || layout.map((item) => item.i);
      let changed = false;
      for (const item of layout) {
        const id = item.i;
        if (itemsToCheck.indexOf(id) < 0) {
          continue;
        }

        // Determine minimum scroll height
        const content = this.items[id];
        content.style.height = 0;
        const minScrollHeight = content.scrollHeight;
        content.style.height = "100%";

        // Set .minH, and either .h (for non-autosized items) or .maxH (for
        // autosized items)
        const minGridHeight = this.calculateGridHeight(
          minScrollHeight + Config.gridVerticalPadding
        );
        if (item.minH !== minGridHeight) {
          item.minH = minGridHeight;
          changed = true;
        }
        if (item.h < item.minH) {
          item.h = item.minH;
          changed = true;
        }

        if (this.autosize[id]) {
          if (item.maxH !== minGridHeight || item.h !== minGridHeight) {
            changed = true;
          }
          item.maxH = minGridHeight;
          item.h = minGridHeight;
        }
      }

      if (changed) {
        console.log("Setting state: autosizeGridItems");
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
      layouts: Config.gridDefaultLayout
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

const AppWithWS = withWSProvider(App, `${Config.wsURL}`);
export default AppWithWS;
