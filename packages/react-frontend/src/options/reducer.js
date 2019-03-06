import { createReducer } from "redux-starter-kit";
import { hide, show } from "./actions";

export default createReducer(
  {
    showModal: false
  },
  {
    [show]: (state) => {
      state.showModal = true;
    },
    [hide]: (state) => {
      state.showModal = false;
    }
  }
);
