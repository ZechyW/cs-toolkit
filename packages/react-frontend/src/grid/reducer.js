import { createReducer } from "redux-starter-kit";
import Config from "../config";
import { saveItemMinHeight, saveLayout } from "./actions";

const reducer = createReducer(
  {
    layouts: Config.gridDefaultLayout,
    minHeights: {}
  },
  {
    [saveLayout]: (state, action) => {
      state.layouts = action.payload;
    },
    [saveItemMinHeight]: (state, action) => {
      const { id, minHeight } = action.payload;
      state.minHeights[id] = minHeight;
    }
  }
);

export default reducer;
