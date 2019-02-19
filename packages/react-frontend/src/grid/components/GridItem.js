import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

/**
 * Single item in the main app UI grid
 * @param props
 * @returns {*}
 * @constructor
 */
function GridItem(props) {
  // We want to pass down every prop that the main Grid gives us, but also
  // inject a bit of pizzazz along the way.
  const { className, ...otherProps } = props;

  // We add `.react-grid-item` to the inner child as well to get the
  // `.react-grid-item > .react-resizable-handle` styles from the vendor CSS
  return (
    <div className={classNames("box grid-box", className)} {...otherProps}>
      <div className="flex-column grid-child react-grid-item">
        <p className="grid-title">{props.title}</p>
        {props.children}
      </div>
    </div>
  );
}

GridItem.propTypes = {
  title: PropTypes.string.isRequired
};

export default GridItem;
