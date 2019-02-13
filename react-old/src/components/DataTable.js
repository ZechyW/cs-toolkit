import React, { Component } from "react";
import PropTypes from "prop-types";

import $ from "jquery";
import "datatables.net";
import "datatables-bulma";

// import "datatables.net-bs4/css/dataTables.bootstrap4.css";
// import "datatables.net-dt/css/jquery.dataTables.css";
import "../styles/datatables.scss";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faSort } from "@fortawesome/free-solid-svg-icons";

library.add(faSort);

/**
 * A component for hosting a DataTables.net table within our UI
 */
class DataTable extends Component {
  static propTypes = {
    children: PropTypes.node,

    // DataTables initialisation options
    options: PropTypes.object.isRequired,

    // DataTables classes
    className: PropTypes.string.isRequired
  };

  static defaultProps = {
    options: {},
    className: ""
  };

  static defaultOptions = {
    deferRender: true,

    // The `is-gapless` class is added to remove extraneous bottom padding
    // on the last row.
    dom:
      "<'columns is-gapless'<'column is-6'l><'column is-6'f>>" +
      "<'columns is-gapless'<'column is-12'tr>>" +
      "<'columns is-gapless'<'column is-5'i><'column is-7'p>>",

    // Set a default height value to enable vertical scrolling; grid parents
    // etc. can change this dynamically after initialisation.
    scrollY: 300,
    scrollX: true
  };

  constructor(props) {
    super(props);
    this.tableRef = React.createRef();

    // DataTables API instance
    this.datatable = null;

    // Initialisation options
    this.options = $.extend({}, DataTable.defaultOptions, this.props.options);
  }

  render() {
    return (
      <table
        className={"table " + this.props.className}
        style={{ width: "100%" }}
        ref={this.tableRef}
      >
        {this.props.children}
      </table>
    );
  }

  componentDidMount() {
    // Initialise the DataTables API
    this.datatable = $(this.tableRef.current).DataTable(this.options);
  }

  componentWillUnmount() {
    // Destroy the DataTables instance, bringing the rendered table with it
    this.datatable.destroy(true);
  }

  shouldComponentUpdate() {
    // The parent container is calling for a re-render.

    // 1. The container's dimensions may have changed. Update our size
    // accordingly.
    console.log("DT shouldComponentUpdate");
    this.updateSize();

    // 2. Let DataTables handle any further DOM updates within this component
    // (instead of React)
    // return false;
    return true;
  }

  /**
   * Update the datatable's horizontal/vertical size to match its parent
   * container.
   */
  updateSize = () => {
    // The table might not be fully redrawn yet
    // (similar to App.autosizeGridItems)
    window.requestAnimationFrame(() => {
      // this.datatable.columns.adjust();
    });
  };
}

export default DataTable;
