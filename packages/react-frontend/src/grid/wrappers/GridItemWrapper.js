/**
 * HOC for grid items.
 * - Ensures that the main Grid component is kept apprised of any internal
 * updates to the wrapped component.
 *
 * N.B.: Any props that change the layout of the component must pass through
 * this HOC as well, so that the layout effect can fire.
 *
 * This means, for example, that any React-Redux bindings must be on the
 * outside of this HOC, so that any Redux state changes pass through this
 * HOC and are detected.
 */
import PropTypes from "prop-types";
import React, { useLayoutEffect } from "react";

function GridItemWrapper(WrappedComponent) {
  const GridItemWrapped = (props) => {
    // Pull the higher-order props and pass the rest through
    const {
      // Grid layout
      gridCheckMinHeight,

      ...otherProps
    } = props;

    // Before any re-render, enqueue a height check with our parent
    // (`useLayoutEffect` because the new height might affect the visible
    // height of the parent grid item)
    useLayoutEffect(() => {
      if (gridCheckMinHeight) {
        gridCheckMinHeight();
      }
    });

    return (
      <>
        <WrappedComponent {...otherProps} />
      </>
    );
  };
  GridItemWrapped.propTypes = {
    // For notifying grid parent when our height may have changed.
    // May be `undefined` if this item is toggled off in the UI.
    gridCheckMinHeight: PropTypes.func
  };

  return GridItemWrapped;
}

export default GridItemWrapper;
