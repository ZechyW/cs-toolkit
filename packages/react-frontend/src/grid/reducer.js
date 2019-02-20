import { createReducer } from "redux-starter-kit";
import Config from "../config";
import { saveItemMinHeight, saveLayouts } from "./actions";

const reducer = createReducer(
  {
    layouts: Config.gridDefaultLayout,
    minHeights: {}
  },
  {
    [saveLayouts]: (state, action) => {
      state.layouts = action.payload;
    },
    [saveItemMinHeight]: (state, action) => {
      const { id, minHeight } = action.payload;
      state.minHeights[id] = minHeight;
    }
  }
);

export default reducer;
