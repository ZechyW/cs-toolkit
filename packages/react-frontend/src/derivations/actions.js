import { createAction } from "redux-starter-kit";

export const reset = createAction("derivations/reset");

// -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
// Selection of Derivations for detailed view
// - Each row corresponds to one DerivationRequest. Multiple
// DerivationRequests may have the same Derivation, so the selected row
// isn't always in a one-to-one relationship with the selected Derivation.
export const selectRow = createAction("derivations/selectRow");
export const selectDerivation = createAction("derivations/selectDerivation");

// -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
// `ag-grid` state
export const saveColumnState = createAction("derivations/saveColumnState");
