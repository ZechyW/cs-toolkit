import React, { Component } from "react";
import PropTypes from "prop-types";

import $ from "jquery";
import "datatables.net";
import "datatables-bulma";

import "datatables.net-dt/css/jquery.dataTables.css";
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
    options: PropTypes.object,

    // DataTables classes
    className: PropTypes.string
  };

  static defaultOptions = { deferRender: true };

  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.datatable = null;
  }

  render() {
    return (
      <table
        className={this.props.className}
        style={{ width: "100%", height: "100%" }}
        ref={this.tableRef}
      >
        {this.props.children}
      </table>
    );
  }

  componentDidMount() {
    // Initialise the DataTables API
    // this.datatable = $(this.tableRef.current).DataTable(this.props.options);
  }

  componentWillUnmount() {
    // Destroy the DataTables instance, bringing the rendered table with it
    this.datatable.destroy(true);
  }

  shouldComponentUpdate() {
    // Let DataTables handle DOM updates within this component instead of React
    return false;
  }
}

export default DataTable;
