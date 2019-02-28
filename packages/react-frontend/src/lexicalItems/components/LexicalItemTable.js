import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowsAltH, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { AgGridReact } from "ag-grid-react";
import { isEqual } from "lodash-es";
import PropTypes from "prop-types";
import rafSchd from "raf-schd";
import React, { useEffect, useRef, useState } from "react";
import Config from "../../config";
import "../styles/LexicalItemTable.scss";

library.add(faArrowsAltH, faPlusSquare);

/**
 * Presentational component for the lexical item list.
 * Uses `react-table` to display a list of currently defined lexical items.
 * @param props
 * @constructor
 */
function LexicalItemTable(props) {
  // Grid api (will be set when the grid is ready)
  const gridApi = useRef(null);
  const gridColumnApi = useRef(null);

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Helper functions

  /**
   * Resizes all columns to fit the currently available table width
   */
  let sizeToFit = () => {
    if (gridApi.current) gridApi.current.sizeColumnsToFit();
  };
  sizeToFit = rafSchd(sizeToFit);

  /**
   * Saves the current column state if it has changed.
   */
  let saveColumnState = () => {
    const currentState = gridColumnApi.current.getColumnState();
    if (!isEqual(props.columnState, currentState)) {
      props.saveColumnState(currentState);
    }
  };
  saveColumnState = rafSchd(saveColumnState);

  /**
   * Attempts to restore the saved column state from `props.columnState`, doing
   * some sanity checks along the way.
   */
  function restoreColumnState() {
    // The number of columns defined in the state should at least be the same
    // as the number of columns currently in the table, or we will be
    // missing columns.
    const currentColumns = gridColumnApi.current.getAllColumns();
    if (currentColumns.length !== props.columnState.length) {
      gridColumnApi.current.resetColumnState();
      return saveColumnState();
    }

    gridColumnApi.current.setColumnState(props.columnState);
  }

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Event handlers

  // Restore column state every time it changes after the initial load.
  useEffect(() => {
    // The first time this hook is called, the API instances might not be
    // ready yet.
    if (!gridColumnApi.current) return;

    restoreColumnState();
  }, [props.columnState]);

  /**
   * When the grid is first fully loaded.
   * - Save references to the API instances
   * - Perform initial column state restore
   * @param params
   */
  function handleGridReady(params) {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;

    window.gridApi = params.api;
    window.gridColumnApi = params.columnApi;

    restoreColumnState();

    gridApi.current.addGlobalListener(handleColumnStateEvent);
  }

  /**
   * Global event listener: When events related to column state are raised,
   * save the current column state.
   */
  function handleColumnStateEvent(type, event) {
    const watchedEvents = ["columnPinned", "columnResized", "columnMoved"];

    if (watchedEvents.indexOf(type) >= 0) {
      saveColumnState();
    }
  }

  // The export button will only be active when there are selected rows.
  const [selectedRows, setSelectedRows] = useState([]);

  /**
   * When the selection changes.
   * - Prepare for potential export to derivation input component.
   */
  function handleSelectionChanged() {
    setSelectedRows(gridApi.current.getSelectedRows());
  }

  return (
    <>
      <p className="has-margin-bottom-10">
        Click on individual lexical items to select them; selected lexical items
        can be added directly to the Lexical Array input.
      </p>
      <p className="has-margin-bottom-10">
        Double click on column resize handles to autosize columns.
      </p>

      <div className="has-margin-bottom-10 buttons">
        <button className="button" onClick={sizeToFit}>
          <span className="icon">
            <i className="fas fa-arrows-alt-h" />
          </span>
          <span>Fit columns to table</span>
        </button>

        <button
          className="button"
          disabled={selectedRows.length === 0}
          onClick={() => props.exportLexicalItems(selectedRows)}
        >
          <span className="icon">
            <i className="fas fa-plus-square" />
          </span>
          <span>Add selected to Lexical Array</span>
        </button>
      </div>

      <div className="ag-theme-balham grid-expand">
        <AgGridReact
          // - Columns
          columnDefs={Config.lexicalItemsColumnDefs}
          defaultColDef={Config.lexicalItemsDefaultColDef}
          // - Selection
          rowSelection="multiple"
          rowMultiSelectWithClick={true}
          suppressCellSelection={true}
          onSelectionChanged={handleSelectionChanged}
          // - Data and API
          rowData={props.lexicalItems}
          deltaRowDataMode={true}
          getRowNodeId={(data) => data.id}
          onGridReady={handleGridReady}
        />
      </div>
    </>
  );
}

LexicalItemTable.propTypes = {
  lexicalItems: PropTypes.array.isRequired,

  columnState: PropTypes.array,
  saveColumnState: PropTypes.func.isRequired,

  exportLexicalItems: PropTypes.func.isRequired
};

LexicalItemTable.defaultProps = {
  columnState: []
};

export default LexicalItemTable;
