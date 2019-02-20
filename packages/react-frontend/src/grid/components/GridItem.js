import classNames from "classnames";
import assert from "minimalistic-assert";
import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";

import { saveItemMinHeight } from "../actions";
import Config from "../../config";

/**
 * Single item in the main app UI grid
 * @param props
 * @returns {*}
 * @constructor
 */
function GridItem(props) {
  // We want to pass down every prop that the main Grid gives us, but also
  // inject a bit of pizzazz along the way.
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

  // Measure our minimum scroll height on every (re-)render
  const childRef = useRef(null);
  useEffect(() => {
    const currentMinHeight = minHeights[id];

    const content = childRef.current;
    content.style.height = 0;
    const minHeight = content.scrollHeight;
    content.style.height = "100%";
    // DEBUG: Assert
    assert(
      getComputedStyle(content.parentElement)["padding-top"] ===
        `${Config.gridVerticalPadding / 2}px`
    );

    if (minHeight !== currentMinHeight) {
      saveItemMinHeight({
        id,
        minHeight
      });
    }
  });

  return (
    <div className={classNames("box grid-box", className)} {...otherProps}>
      <div
        className={classNames(
          "flex-column grid-child",
          // We add `.react-grid-item` to the inner child as well to get the
          // `.react-grid-item > .react-resizable-handle` styles from the
          // vendor CSS
          "react-grid-item",
          { "grid-expand": expandContents }
        )}
        ref={childRef}
      >
        <p className="grid-title">{title}</p>
        {props.children}
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

export default connect(
  createSelector({
    minHeights: "grid.minHeights"
  }),
  actionCreators
)(GridItem);
