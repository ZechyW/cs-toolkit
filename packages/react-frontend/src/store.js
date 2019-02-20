/**
 * Configures and returns the main Redux store.
 */
import { combineReducers } from "redux";
import immutableStateInvariant from "redux-immutable-state-invariant";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { configureStore } from "redux-starter-kit";
import thunk from "redux-thunk";

import { actions as coreActions } from "./core";
import { reducer as grid } from "./grid";
import { reducer as lexicalArray } from "./lexicalArray";
import { reducer as navbar } from "./navbar";

window.resetAll = coreActions.resetAll;

// Persistence configs
const rootPersistConfig = {
  key: "root",
  storage
};

// N.B.: Currently, nested persists don't work with our immutable state
// (https://github.com/rt2zz/redux-persist/issues/913).
// Either deal and not use nested persists, or apply:
// https://github.com/ctrlplusb/easy-peasy/issues/40

// Root reducer with reset functionality
const appReducer = combineReducers({
  grid,
  navbar,
  lexicalArray
});
const rootReducer = (state, action) => {
  if (action.type === coreActions.resetAll.toString()) {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// Store and persistor
// The included default `serializable-state-invariant-middleware` from
// `redux-starter-kit` throws errors with `redux-persist`
let middleware;
if (process.env.NODE_ENV !== "production") {
  middleware = [immutableStateInvariant(), thunk];
} else {
  middleware = [thunk];
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware
});

export const persistor = persistStore(store);
