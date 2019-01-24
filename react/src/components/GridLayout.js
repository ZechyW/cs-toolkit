import React, { Component } from "react";
import PropTypes from "prop-types";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Responsive, WidthProvider } from "react-grid-layout";

/**
 * Provides a customised responsive react-grid-layout that keeps the parent
 * component apprised of its breakpoint/width data
 */
class GridLayout extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,

    // From WidthProvider
    width: PropTypes.number.isRequired,

    // Passed by parent component
    onUpdate: PropTypes.func.isRequired,
    layouts: PropTypes.object.isRequired,
    breakpoints: PropTypes.object,
    cols: PropTypes.object
  };

  static defaultProps = {
    breakpoints: Responsive.defaultProps.breakpoints,
    cols: Responsive.defaultProps.cols
  };

  constructor(props) {
    super(props);
  }

  render() {
    return <Responsive {...this.props}>{this.props.children}</Responsive>;
  }

  componentDidUpdate() {
    // Send pertinent layout-related data to parent
    const currentBreakpoint = Responsive.utils.getBreakpointFromWidth(
      this.props.breakpoints,
      this.props.width
    );
    this.props.onUpdate(
      this.props.width,
      currentBreakpoint
    );
  }
}

export default WidthProvider(GridLayout);
