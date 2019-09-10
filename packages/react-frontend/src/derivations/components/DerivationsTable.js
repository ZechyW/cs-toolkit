import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowsAltH,
  faMinusSquare,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { AgGridReact } from "ag-grid-react";
import classNames from "classnames";
import { isEqual } from "lodash-es";
import PropTypes from "prop-types";
import rafSchd from "raf-schd";
import React, { useRef } from "react";
import Config from "../../config";

library.add(faArrowsAltH, faMinusSquare, faCheckCircle);

/**
 * Presentational component for the derivation status tracker.
 * Uses `ag-grid` to display a list of tracked derivations.
 * @param props
 * @constructor
 */
function DerivationsTable(props) {
  // Grid api (will be set when the grid is ready)
  const gridApi = useRef(null);
  const gridColumnApi = useRef(null);
  window.dGridApi = gridApi;

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
  let restoreColumnState = () => {
    // The number of columns defined in the state should at least be the same
    // as the number of columns currently in the table, or we will be
    // missing columns.
    const currentColumns = gridColumnApi.current.getAllColumns();
    if (currentColumns.length !== props.columnState.length) {
      gridColumnApi.current.resetColumnState();
      return saveColumnState();
    }

    gridColumnApi.current.setColumnState(props.columnState);
  };
  restoreColumnState = rafSchd(restoreColumnState);

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Event handlers

  /**
   * When the grid is first fully loaded.
   * - Save references to the API instances
   * - Perform initial column state restore
   * @param params
   */
  function handleGridReady(params) {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;

    // Column State
    restoreColumnState();
    gridApi.current.addGlobalListener(handleColumnStateEvent);

    // Restore the last row selection, if any
    if (props.selectedRow) {
      gridApi.current.forEachNode((node) => {
        if (node.id === props.selectedRow) {
          node.setSelected(true);
        }
      });
    }
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

  /**
   * When the selection changes.
   * - Save to external store for other widgets to reference
   */
  function handleSelectionChanged() {
    const selection = gridApi.current.getSelectedRows();
    if (selection.length === 0) {
      props.selectRow(null);
      props.selectDerivation(null);
    } else {
      props.selectRow(selection[0].id);
      props.selectDerivation(selection[0].derivationId);
    }
  }

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Cell renderer
  function CompleteCellRenderer(props) {
    return (
      <>
        {props.value ? (
          <span className="icon has-text-success">
            <i className="fas fa-check-circle" />
          </span>
        ) : (
          ""
        )}
      </>
    );
  }

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Main render
  return (
    <>
      <p className="has-margin-bottom-10">
        Each derivation follows multiple paths as different operations are
        applied to the items in the lexical array, and each of these
        derivational chains can end in either a Convergence or a Crash.
      </p>

      <div className="has-margin-bottom-0 buttons">
        <button className="button" onClick={sizeToFit}>
          <span className="icon">
            <i className="fas fa-arrows-alt-h" />
          </span>
          <span>Fit columns to table</span>
        </button>

        <button
          className="button"
          onClick={() => {
            props.resetTable();
          }}
        >
          <span className="icon">
            <i className="fas fa-minus-square" />
          </span>
          <span>Clear list</span>
        </button>
      </div>

      <div
        className={classNames(
          // `ag-grid` theme
          "ag-theme-balham",
          // Sets up the minimum dimensions and scrolling for the table itself
          "ag-grid-container",
          // Integrates the table into the grid layout by allowing it to
          // expand/shrink as necessary when the grid item size changes
          "grid-expand grid-shrink"
        )}
      >
        <AgGridReact
          // - Columns
          columnDefs={Config.derivationsColumnDefs}
          defaultColDef={Config.derivationsDefaultColDef}
          frameworkComponents={{
            completeCellRenderer: CompleteCellRenderer
          }}
          // - Selection
          rowSelection="single"
          rowDeselection={true}
          suppressCellSelection={true}
          onSelectionChanged={handleSelectionChanged}
          // - Data and API
          rowData={props.derivations}
          deltaRowDataMode={true}
          getRowNodeId={(data) => data.id}
          onGridReady={handleGridReady}
          // - Pagination
          pagination={true}
        />
      </div>
    </>
  );
}
DerivationsTable.propTypes = {
  derivations: PropTypes.array.isRequired,

  columnState: PropTypes.array,
  saveColumnState: PropTypes.func.isRequired,

  selectRow: PropTypes.func.isRequired,
  selectDerivation: PropTypes.func.isRequired,

  selectedRow: PropTypes.string,

  resetTable: PropTypes.func.isRequired
};
DerivationsTable.defaultProps = {
  columnState: [],
  selectedRow: null
};

export default DerivationsTable;
