/**
 * Configures and returns the main Redux store.
 */
import { configureStore } from "redux-starter-kit";
import { reducer as lexicalArray } from "./lexicalArray";
import { reducer as navbar } from "./navbar";

export default configureStore({
  reducer: {
    lexicalArray,
    navbar
  }
});
