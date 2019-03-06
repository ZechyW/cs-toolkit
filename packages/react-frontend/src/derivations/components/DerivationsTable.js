import { AgGridReact } from "ag-grid-react";
import classNames from "classnames";
import { isEqual } from "lodash-es";
import rafSchd from "raf-schd";
import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import Config from "../../config";
import { GridItemWrapper } from "../../grid";
import createSelector from "selectorator";
import { saveColumnState } from "../actions";
import { getDerivationsAsList } from "../selectors";

/**
 * Presentational component for the derivation request status tracker.
 * Uses `ag-grid` to display a list of tracked derivation requests.
 * @param props
 * @constructor
 */
function DerivationsTable(props) {
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

  return (
    <>
      <p>Derivations being tracked:</p>

      <div className="has-margin-bottom-0 buttons">
        <button className="button" onClick={sizeToFit}>
          <span className="icon">
            <i className="fas fa-arrows-alt-h" />
          </span>
          <span>Fit columns to table</span>
        </button>
      </div>

      <div
        className={classNames(
          // `ag-grid` theme
          "ag-theme-balham",
          // Sets up the minimum dimensions and scrolling for the table itself
          "lexical-item-list-container",
          // Integrates the table into the grid layout by allowing it to
          // expand/shrink as necessary when the grid item size changes
          "grid-expand grid-shrink"
        )}
      >
        <AgGridReact
          // - Columns
          columnDefs={Config.derivationsColumnDefs}
          defaultColDef={Config.derivationsDefaultColDef}
          // - Selection
          suppressCellSelection={true}
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

/**
 * HOCs and React-redux binding
 */
let Wrapped = DerivationsTable;

Wrapped = GridItemWrapper(Wrapped);

const actionCreators = {
  // `ag-grid`
  saveColumnState
};

Wrapped = connect(
  createSelector({
    // Pass through to view
    derivations: getDerivationsAsList,
    columnState: "derivations.columnState"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
