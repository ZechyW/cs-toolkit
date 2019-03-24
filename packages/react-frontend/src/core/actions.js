/**
 * Core/global actions
 */
import { createAction } from "redux-starter-kit";

// -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
// Resets
export const resetAll = createAction("reset/all");
export const resetGrid = createAction("reset/grid");

// -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
// UI item visibility toggles
export const showItem = createAction("core/showItem");
export const hideItem = createAction("core/hideItem");
