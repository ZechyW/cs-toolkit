/**
 * Component for the main app UI grid.
 */
import { isMatch } from "lodash-es";
import React, { useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { connect } from "react-redux";
import "react-resizable/css/styles.css";
import createSelector from "selectorator";

import Config from "../../config";
import { InjectProps } from "../../util";
import { saveLayouts } from "../actions";
import "../styles/Grid.scss";

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
 * Main app UI grid
 * @param props
 * @constructor
 */
function Grid(props) {
  const lastSavedLayouts = props.layouts;

  // Auto-sizing
  useEffect(() => {
    const currentBreakpoint = Responsive.utils.getBreakpointFromWidth(
      staticGridOptions.breakpoints,
      props.width
    );

    // console.log(currentBreakpoint, props.width);

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
      props.saveLayouts({
        ...props.layouts,
        [currentBreakpoint]: newLayout
      });
    }
  });

  // Add dynamic grid options
  const gridOptions = {
    width: props.width,
    // `react-grid-layout` might modify `layouts` directly, so we clone
    // before passing it through
    layouts: { ...props.layouts },
    onLayoutChange: (newLayout, newLayouts) => {
      // We're interested in the full `layouts` argument, not only the
      // layout at the current breakpoint (in the `layout` argument).
      if (!isMatch(newLayouts, lastSavedLayouts)) {
        props.saveLayouts(newLayouts);
      }
    },
    ...staticGridOptions
  };

  return <Responsive {...gridOptions}>{props.children}</Responsive>;
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

export default connect(
  createSelector({
    layouts: "grid.layouts",
    minHeights: "grid.minHeights"
  }),
  actionCreators
)(WrappedGrid);
