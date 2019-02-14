/**
 * Utility functions
 */

import Config from "./config";

/**
 * Retrieves the value with the given key from the App's namespace in
 * localStorage, if available.
 * The value is assumed to be a JSON string, and will be parsed before it is
 * returned.
 * @param key
 * @return {*}
 */
export function getFromLS(key) {
  let ls = {};
  if (localStorage) {
    try {
      ls = JSON.parse(localStorage.getItem(Config.localStorageNamespace)) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

/**
 * Saves some key-value pair to the App's namespace in localStorage, if
 * available.
 * The value will be converted into a JSON string before it is saved.
 * @param key
 * @param value
 */
export function saveToLS(key, value) {
  if (localStorage) {
    const ls =
      JSON.parse(localStorage.getItem(Config.localStorageNamespace)) || {};
    ls[key] = value;
    localStorage.setItem(Config.localStorageNamespace, JSON.stringify(ls));
  }
}
