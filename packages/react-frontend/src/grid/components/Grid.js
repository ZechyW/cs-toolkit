import { cloneDeep, isMatch } from "lodash-es";
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

  // Auto-sizing
  // (`useLayoutEffect` because it might affect the visible height of grid
  // items and should therefore be executed before the main render frame)
  useLayoutEffect(() => {
    let changed = false;
    const newLayout = [];
    for (const currentItem of props.layouts[currentBreakpoint]) {
      // Clone first
      const item = { ...currentItem };
      newLayout.push(item);

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

    if (changed) {
      const newLayouts = {
        ...props.layouts,
        [currentBreakpoint]: newLayout
      };

      props.saveLayouts(newLayouts);
    }
  }, [props.minHeights, props.width]);

  // Helper functions
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

  function handleResize(layout, oldItem, newItem, placeholder, e, element) {
    // `element` points at the resize handle, unfortunately.  Grab the actual
    // grid element (2 levels up) instead.
    const gridItem = element.parentElement.parentElement;
    assert(gridItem.classList.contains("grid-box"));

    // Clone it so we can figure out how high the placeholder should actually
    // be, based on the placeholder's width
    const gridItemClone = gridItem.cloneNode(true);

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
    gridItemClone.style.width = `${sizingWidth}px`;
    gridItemClone.style.position = "fixed";
    gridItemClone.style.top = "100%";
    document.body.appendChild(gridItemClone);

    const contentClone = gridItemClone.querySelector(".grid-child");
    contentClone.style.height = "0";

    // Done - Set the placeholder height and clean up.
    placeholder.h = calculateGridHeight(
      contentClone.scrollHeight + Config.gridVerticalPadding
    );
    document.body.removeChild(gridItemClone);
  }

  // Render
  // `react-grid-layout` may change the value of `props.layouts` during the
  // render, so we have to pass it a clone.
  return (
    <Responsive
      width={props.width}
      layouts={cloneDeep(props.layouts)}
      onLayoutChange={handleLayoutChange}
      onResize={handleResize}
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
    minHeights: "grid.minHeights"
  }),
  actionCreators
)(WrappedGrid);

export default WrappedGrid;
