import { createAction } from "redux-starter-kit";

export const reset = createAction("derivationViewer/reset");

// -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
// Selection of Derivation chains for timeline view

// Index of the Derivation chain to show
export const selectChain = createAction("derivationViewer/selectChain");

// Index of the timeline frame to show within the currently selected chain
export const selectFrame = createAction("derivationViewer/selectFrame");
