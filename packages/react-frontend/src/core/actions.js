/**
 * Core/global actions
 */
import { createAction } from "redux-starter-kit";

// Resets
export const resetAll = createAction("reset/all");
export const resetGrid = createAction("reset/grid");

// UI item visibility toggles
export const showItem = createAction("core/showItem");
export const hideItem = createAction("core/hideItem");
