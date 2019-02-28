import classNames from "classnames";
import assert from "minimalistic-assert";
import PropTypes from "prop-types";
import rafSchd from "raf-schd";
import React, { cloneElement, useRef } from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";

import Config from "../../config";
import { saveItemMinHeight } from "../actions";

/**
 * Single item in the main app UI grid
 * @param props
 * @returns {*}
 * @constructor
 */
function GridItem(props) {
  // We want to pass down every prop that the main Grid gives us, but also
  // inject a bit of pizzazz along the way.
  // Start by pulling everything that isn't relevant.
  const {
    // Pull the passed classes
    className,

    // Pull custom props
    // - Basic
    id,
    title,
    expandContents,
    // - For registering our content's minimum scroll height
    saveItemMinHeight,
    minHeights,

    // Pass everything else through
    ...otherProps
  } = props;

  // Measure our minimum scroll height when our children are (re-)rendered.
  // N.B.: Because some children might not be done rendering yet, we need to
  // defer the height computation (via `rafSchd`).
  // (E.g.: https://github.com/react-dnd/react-dnd/issues/1146)
  const childRef = useRef(null);
  let currentMinHeight = minHeights[id];
  let checkMinHeight = () => {
    // The child might not have finished mounting yet.
    if (!childRef.current) {
      return;
    }

    const content = childRef.current;
    content.style.height = "0";
    const minHeight = content.scrollHeight;
    content.style.height = "100%";
    // DEBUG: Assert that styles are loaded (waiting on `react-scripts` fix
    // upstream)
    assert(
      getComputedStyle(content.parentElement)["padding-top"] ===
        `${Config.gridVerticalPadding / 2}px`
    );

    if (minHeight !== currentMinHeight) {
      saveItemMinHeight({
        id,
        minHeight
      });
      currentMinHeight = minHeight;
    }
  };
  checkMinHeight = rafSchd(checkMinHeight);

  // For children to let us know when they render.
  const children = React.Children.map(props.children, (child) =>
    cloneElement(child, {
      gridCheckMinHeight: () => {
        checkMinHeight();
      }
    })
  );

  return (
    <div className={classNames("box grid-box", className)} {...otherProps}>
      <div
        className={classNames(
          "flex-column grid-child",
          // We add `.react-grid-item` to the inner child as well to get the
          // `.react-grid-item > .react-resizable-handle` styles from the
          // vendor CSS
          "react-grid-item",
          { "grid-expand-children": expandContents }
        )}
        ref={childRef}
      >
        <p className="grid-title">{title}</p>
        {children}
      </div>
    </div>
  );
}

GridItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  expandContents: PropTypes.bool
};

GridItem.defaultProps = {
  expandContents: false
};

/**
 * React-redux binding
 */
const actionCreators = {
  saveItemMinHeight
};

let WrappedGridItem = connect(
  createSelector({
    minHeights: "grid.minHeights"
  }),
  actionCreators
)(GridItem);

export default WrappedGridItem;
