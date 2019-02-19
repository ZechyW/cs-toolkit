import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGrid = WidthProvider(Responsive);

/**
 * Main app UI grid
 * @param props
 * @constructor
 */
function Grid(props) {
  return <ResponsiveGrid {...props}>{props.children}</ResponsiveGrid>;
}

export default Grid;
