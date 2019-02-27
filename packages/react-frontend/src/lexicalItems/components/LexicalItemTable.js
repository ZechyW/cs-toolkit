import PropTypes from "prop-types";
import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";

/**
 * Presentational component for the lexical item list.
 * Uses `react-table` to display a list of currently defined lexical items.
 * @param props
 * @constructor
 */
function LexicalItemTable(props) {
  // We have to define `minResizeWidth` on all columns until a bug is fixed
  // upstream.
  // https://github.com/tannerlinsley/react-table/issues/1272
  const columns = [
    {
      Header: "ID",
      accessor: "id",
      minResizeWidth: 10
    },
    {
      Header: "Orthographic Representation",
      accessor: "text",
      minResizeWidth: 10
    },
    {
      Header: "Language",
      accessor: "language",
      minResizeWidth: 10
    },
    {
      Header: "Features",
      accessor: "features",
      minResizeWidth: 10
    }
  ];

  return (
    <div>
      <ReactTable
        data={props.lexicalItems}
        columns={columns}
        className="-striped -highlight"
      />
    </div>
  );
}

LexicalItemTable.propTypes = {
  lexicalItems: PropTypes.array.isRequired
};

export default LexicalItemTable;
