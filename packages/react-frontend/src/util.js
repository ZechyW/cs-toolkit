/**
 * Utility functions
 */

import React from "react";
import { useEffect, useState } from "react";
import Config from "./config";

/**
 * Retrieves the value with the given key from the App's namespace in
 * localStorage, if available.
 * The value is assumed to be a JSON string, and will be parsed before it is
 * returned.
 * Returns `undefined` if the data cannot be found or read.
 * @param key
 * @return {*}
 */
export function loadFromLS(key) {
  try {
    const allData =
      JSON.parse(localStorage.getItem(Config.localStorageNamespace)) || {};
    return allData[key];
  } catch (err) {
    return undefined;
  }
}

/**
 * Saves some key-value pair to the App's namespace in localStorage, if
 * available.
 * The value will be converted into a JSON string before it is saved.
 * @param key
 * @param value
 */
export function saveToLS(key, value) {
  try {
    const allData =
      JSON.parse(localStorage.getItem(Config.localStorageNamespace)) || {};
    allData[key] = value;
    localStorage.setItem(Config.localStorageNamespace, JSON.stringify(allData));
  } catch (err) {
    // Ignore any write errors
  }
}

/**
 * A React hook that allows us to check against media queries programmatically
 * (From: https://usehooks.com/)
 * @param queries
 * @param values
 * @param defaultValue
 * @return {*}
 */
export function useMedia(queries, values, defaultValue) {
  // Array containing a media query list for each query
  const mediaQueryLists = queries.map((q) => window.matchMedia(q));

  // Function that gets value based on matching media query
  const getValue = () => {
    // Get index of first media query that matches
    const index = mediaQueryLists.findIndex((mql) => mql.matches);
    // Return related value or defaultValue if none
    return typeof values[index] !== "undefined" ? values[index] : defaultValue;
  };

  // State and setter for matched value
  const [value, setValue] = useState(getValue);

  useEffect(
    () => {
      // Event listener callback
      // Note: By defining getValue outside of useEffect we ensure that it has
      // ... ... current values of hook args (as this hook callback is created
      // once on mount).
      const handler = () => setValue(getValue);
      // Set a listener for each media query with above handler as callback.
      mediaQueryLists.forEach((mql) => mql.addListener(handler));
      // Remove listeners on cleanup
      return () =>
        mediaQueryLists.forEach((mql) => mql.removeListener(handler));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Empty array ensures effect is only run on mount and unmount
  );

  return value;
}

/**
 * A simple React HOC that injects an arbitrary set of extra props into a
 * component.
 */
export function InjectProps(WrappedComponent, extraProps) {
  // Return a new functional Component
  return (wrappedProps) => {
    const props = { ...wrappedProps, ...extraProps };
    return <WrappedComponent {...props} />;
  };
}

/**
 * Redux profiling middleware
 * (https://medium.com/@vcarl/performance-profiling-a-redux-app-c85e67bf84ae)
 * @return {function(*): Function}
 */
export const userTiming = () => (next) => (action) => {
  if (performance.mark === undefined) return next(action);
  performance.mark(`${action.type}_start`);
  const result = next(action);
  performance.mark(`${action.type}_end`);
  performance.measure(
    `${action.type}`,
    `${action.type}_start`,
    `${action.type}_end`
  );
  return result;
};
