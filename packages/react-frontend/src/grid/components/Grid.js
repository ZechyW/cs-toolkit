import { cloneDeep, forOwn, isMatch, throttle } from "lodash-es";
import assert from "minimalistic-assert";
import React, { useLayoutEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { connect } from "react-redux";
import "react-resizable/css/styles.css";
import createSelector from "selectorator";

import Config from "../../config";
import { InjectProps } from "../../util";
import { saveLayouts } from "../actions";
import "../styles/Grid.scss";

/**
 * Main app UI grid
 * @param props
 * @constructor
 */
function Grid(props) {
  // Used in auto-sizing and resizing
  const currentBreakpoint = Responsive.utils.getBreakpointFromWidth(
    staticGridOptions.breakpoints,
    props.width
  );

  // Make any necessary modifications to the provided layout and re-save it.
  // - If a previously hidden item is re-shown, it won't have a layout
  //   configuration in memory; pull the default from the config.
  // - After making sure that every item has a layout config, make sure that
  //   every item is at least as tall as it needs to be.
  // (`useLayoutEffect` instead of `useEffect` because it might affect the
  // visible height of grid items and should therefore be executed before
  // the main render frame)
  useLayoutEffect(
    () => {
      // If any changes to the layout at the current breakpoint are made, they
      // will be reflected in this array.
      const newLayout = [];
      let changed = false;

      // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
      // Pick up as many valid GridItem config objects as we can from the current
      // layout state (which is an array, unfortunately -- We have to iterate
      // over each element)

      // Clone the visibility map, and determine which items we don't have
      // configs for in the current layout.
      // As we save them to `newLayout`, we clone them as we go (since they
      // are Objects themselves and we don't want to accidentally mutate them).
      const gridChildren = { ...props.itemVisibility };
      // eslint-disable-next-line no-unused-vars
      for (const currentItem of props.layouts[currentBreakpoint]) {
        delete gridChildren[currentItem.i];
        newLayout.push({ ...currentItem });
      }

      // Pull defaults for the (visible) items without configs.
      forOwn(gridChildren, (isVisible, id) => {
        if (!isVisible) return;

        // Unfortunately, the default Configs are also held in an array.
        // eslint-disable-next-line no-unused-vars
        for (const defaultItem of Config.gridDefaultLayout[currentBreakpoint]) {
          if (id === defaultItem.i) {
            newLayout.push({ ...defaultItem });
            changed = true;
            break;
          }
        }
      });

      // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
      // Auto-sizing
      // eslint-disable-next-line no-unused-vars
      for (const item of newLayout) {
        // Determine minimum item height
        const id = item.i;
        if (!props.minHeights[id]) {
          continue;
        }
        const minGridHeight = calculateGridHeight(
          props.minHeights[id] + Config.gridVerticalPadding
        );

        // Set .minH, and either .h (for non-autosized items) or .maxH (for
        // autosized items)
        if (item.minH !== minGridHeight) {
          item.minH = minGridHeight;
          changed = true;
        }
        if (item.h < item.minH) {
          item.h = item.minH;
          changed = true;
        }

        if (Config.gridDefaultAutosize[id]) {
          if (item.maxH !== minGridHeight || item.h !== minGridHeight) {
            changed = true;
          }
          item.maxH = minGridHeight;
          item.h = minGridHeight;
        }
      }

      // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
      // Save newLayout if it differs from current one
      if (changed) {
        const newLayouts = {
          ...props.layouts,
          [currentBreakpoint]: newLayout
        };

        props.saveLayouts(newLayouts);
      }
    },
    // Changes to itemVisibility may require pulling default layout configs;
    // changes to item minHeights and the main grid width may cause autosizing.
    [
      props.itemVisibility,
      props.minHeights,
      props.width,
      currentBreakpoint,
      props.layouts
    ]
  );

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Helper functions
  /**
   * Helper function to handle grid layout changes.
   * @param _ - The layout at the current breakpoint; unused.
   * @param newLayouts - The layouts for all configured breakpoints; saved
   *   to the store.
   */
  function handleLayoutChange(_, newLayouts) {
    // N.B.: `react-grid-layout` may modify `newLayouts` directly after this
    // function, so we need to clone it before saving it if we want it to
    // remain immutable.

    // We use `isMatch` rather than `isEqual` because `newLayouts` items may
    // have a bunch of extra keys with `undefined` as their values, but we
    // should skip the update as long as `lastLayouts` matches in every
    // other way.
    // (E.g.: This may happen on the very first layout change event if we have
    // loaded `props.layouts` from some external source.)
    if (!isMatch(newLayouts, props.layouts)) {
      props.saveLayouts(cloneDeep(newLayouts));
    }
  }

  /**
   * Helper function to handle grid item resizes.
   * @param layout
   * @param oldItem
   * @param newItem
   * @param placeholder
   * @param e
   * @param element
   */
  function handleResize(layout, oldItem, newItem, placeholder, e, element) {
    // `element` points at the resize handle, unfortunately.  Grab the
    // actual content (1 level up) and grid (2 levels up) elements instead.
    const content = element.parentElement;
    const gridItem = content.parentElement;
    assert(gridItem.classList.contains("grid-box"));

    // Figure out the placeholder's pixel width
    // (Adapted from `react-grid-layout/GridItem.js.flow`:)
    const { margin, containerPadding } = staticGridOptions;
    const containerWidth = props.width;
    const cols = staticGridOptions.cols[currentBreakpoint];
    const colWidth =
      (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) /
      cols;
    const sizingWidth = Math.round(
      placeholder.w * (colWidth + margin[0]) - margin[0]
    );

    // Predict element minimum height
    const originalWidth = gridItem.style.width;
    gridItem.style.width = `${sizingWidth}px`;
    content.style.height = "0";

    // Set the placeholder height
    const id = newItem.i;
    const minHeight = calculateGridHeight(
      content.scrollHeight + Config.gridVerticalPadding
    );
    placeholder.minH = minHeight;
    if (Config.gridDefaultAutosize[id]) {
      placeholder.h = minHeight;
    }

    // Clean up
    gridItem.style.width = originalWidth;
    content.style.height = "100%";
  }

  // Render
  // `react-grid-layout` may change the value of `props.layouts` during the
  // render, so we have to pass it a clone.
  return (
    <Responsive
      width={props.width}
      layouts={cloneDeep(props.layouts)}
      onLayoutChange={handleLayoutChange}
      onResize={throttle(handleResize, 10)}
      {...staticGridOptions}
    >
      {props.children}
    </Responsive>
  );
}

// Static grid options
const staticGridOptions = {
  draggableHandle: ".grid-title",
  margin: [10, 10],
  containerPadding: [15, 15],
  rowHeight: 30,

  // Responsive
  breakpoints: Responsive.defaultProps.breakpoints,
  cols: Responsive.defaultProps.cols
};

/**
 * Converts height in pixels to height in currently configured grid units.
 * @param heightPx
 */
function calculateGridHeight(heightPx) {
  return Math.ceil(
    (heightPx + staticGridOptions.margin[1]) /
      (staticGridOptions.rowHeight + staticGridOptions.margin[1])
  );
}

/**
 * HOCs
 */
let WrappedGrid = WidthProvider(Grid);
WrappedGrid = InjectProps(WrappedGrid, {
  // For WidthProvider
  measureBeforeMount: true
});

/**
 * React-redux binding
 */
const actionCreators = {
  saveLayouts
};

WrappedGrid = connect(
  createSelector({
    layouts: "grid.layouts",
    minHeights: "grid.minHeights",

    itemVisibility: "core.itemVisibility"
  }),
  actionCreators
)(WrappedGrid);

export default WrappedGrid;
