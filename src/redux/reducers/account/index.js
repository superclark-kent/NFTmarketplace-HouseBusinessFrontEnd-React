// Import Constants
import { SET_ACCOUNT } from "redux/constants";

const initialState = {
  account: null,
};

const accountReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ACCOUNT:
      return {
        ...state,
        account: action.payload,
      };
    default:
      return state;
  }
};

export default accountReducer;
