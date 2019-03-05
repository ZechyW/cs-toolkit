/**
 * Configures and returns the main Redux store.
 */
import { combineReducers } from "redux";
import immutableStateInvariant from "redux-immutable-state-invariant";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import createSagaMiddleware from "redux-saga";
import { all } from "redux-saga/effects";
import { configureStore } from "redux-starter-kit";
import thunk from "redux-thunk";

import { actions as coreActions } from "./core";
import { reducer as derivationInput } from "./derivationInput";
import { reducer as derivations, saga as derivationsSaga } from "./derivations";
import { reducer as grid } from "./grid";
import { reducer as lexicalItems } from "./lexicalItems";
import { reducer as navbar } from "./navbar";
import { saga as notificationSaga } from "./notifications";

import { userTiming } from "./util";
import { middleware as wsMiddleware, reducer as websocket } from "./websocket";

// Persistence configs
const rootPersistConfig = {
  key: "root",
  storage,
  blacklist: ["websocket"]
};

// N.B.: Currently, nested persists don't work with our immutable state
// (https://github.com/rt2zz/redux-persist/issues/913).
// Either deal and not use nested persists, or apply:
// https://github.com/ctrlplusb/easy-peasy/issues/40

// Root reducer with top-level reset functionality
const appReducer = combineReducers({
  derivationInput,
  derivations,
  grid,
  lexicalItems,
  navbar,
  websocket
});
const rootReducer = (state, action) => {
  // Full reset
  if (action.type === coreActions.resetAll.toString()) {
    state = undefined;
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// Middleware
// The included default `serializable-state-invariant-middleware` from
// `redux-starter-kit` throws errors with `redux-persist`, so we don't load
// it here.

const sagaMiddleware = createSagaMiddleware();

let middleware = [thunk, wsMiddleware, sagaMiddleware];
if (process.env.NODE_ENV !== "production") {
  middleware = middleware.concat([immutableStateInvariant(), userTiming]);
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware
});
export const persistor = persistStore(store);

// Sagas
// (Must be run after the store is configured)
sagaMiddleware.run(function*() {
  yield all([derivationsSaga(), notificationSaga()]);
});
