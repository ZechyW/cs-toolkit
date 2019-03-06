import { createReducer } from "redux-starter-kit";

import Config from "../config";
import { saveItemMinHeight, saveLayouts } from "./actions";
import { actions as coreActions } from "../core";

const initialState = {
  layouts: Config.gridDefaultLayout,
  minHeights: {}
};

const reducer = createReducer(initialState, {
  [saveLayouts]: (state, action) => {
    state.layouts = action.payload;
  },
  [saveItemMinHeight]: (state, action) => {
    const { id, minHeight } = action.payload;
    state.minHeights[id] = minHeight;
  },

  // Reset
  [coreActions.resetGrid]: () => {
    return initialState;
  }
});

export default reducer;

const test = {
  lg: [
    {
      w: 6,
      h: 11,
      x: 0,
      y: 0,
      i: "derivationInput",
      minW: 2,
      minH: 11,
      maxH: 11,
      moved: false,
      static: false
    },
    {
      w: 6,
      h: 11,
      x: 6,
      y: 0,
      i: "lexicalItemList",
      minW: 2,
      minH: 8,
      moved: false,
      static: false
    }
  ]
  // md: [
  //   { w: 5, h: 11, x: 0, y: 0, i: "derivationInput", minW: 2 },
  //   { w: 5, h: 11, x: 5, y: 0, i: "lexicalItemList", minW: 2 },
  //   { w: 10, h: 8, x: 0, y: 11, i: "derivationStatusList", minW: 2 }
  // ],
  // sm: [
  //   { w: 3, h: 12, x: 0, y: 0, i: "derivationInput", minW: 2 },
  //   { w: 3, h: 12, x: 3, y: 0, i: "lexicalItemList", minW: 2 },
  //   { w: 6, h: 8, x: 0, y: 12, i: "derivationStatusList", minW: 2 }
  // ],
  // xs: [
  //   { w: 4, h: 11, x: 0, y: 0, i: "derivationInput", minW: 2 },
  //   { w: 4, h: 9, x: 0, y: 11, i: "lexicalItemList", minW: 2 },
  //   { w: 8, h: 8, x: 0, y: 20, i: "derivationStatusList", minW: 2 }
  // ],
  // xxs: [
  //   { w: 2, h: 13, x: 0, y: 0, i: "derivationInput", minW: 2 },
  //   { w: 2, h: 9, x: 0, y: 13, i: "lexicalItemList", minW: 2 },
  //   { w: 4, h: 8, x: 0, y: 22, i: "derivationStatusList", minW: 2 }
  // ]
};

const test2 = {
  lg: [
    { w: 12, h: 8, x: 0, y: 11, i: "derivationStatusList", minW: 2, minH: 6 },
    {
      w: 6,
      h: 11,
      x: 0,
      y: 0,
      i: "derivationInput",
      minW: 2,
      minH: 11,
      maxH: 11
    },
    { w: 6, h: 11, x: 6, y: 0, i: "lexicalItemList", minW: 2, minH: 8 }
  ]
  // md: [
  //   { w: 5, h: 11, x: 0, y: 0, i: "derivationInput", minW: 2 },
  //   { w: 5, h: 11, x: 5, y: 0, i: "lexicalItemList", minW: 2 },
  //   { w: 10, h: 8, x: 0, y: 11, i: "derivationStatusList", minW: 2 }
  // ],
  // sm: [
  //   { w: 3, h: 12, x: 0, y: 0, i: "derivationInput", minW: 2 },
  //   { w: 3, h: 12, x: 3, y: 0, i: "lexicalItemList", minW: 2 },
  //   { w: 6, h: 8, x: 0, y: 12, i: "derivationStatusList", minW: 2 }
  // ],
  // xs: [
  //   { w: 4, h: 11, x: 0, y: 0, i: "derivationInput", minW: 2 },
  //   { w: 4, h: 9, x: 0, y: 11, i: "lexicalItemList", minW: 2 },
  //   { w: 8, h: 8, x: 0, y: 20, i: "derivationStatusList", minW: 2 }
  // ],
  // xxs: [
  //   { w: 2, h: 13, x: 0, y: 0, i: "derivationInput", minW: 2 },
  //   { w: 2, h: 9, x: 0, y: 13, i: "lexicalItemList", minW: 2 },
  //   { w: 4, h: 8, x: 0, y: 22, i: "derivationStatusList", minW: 2 }
  // ]
};
