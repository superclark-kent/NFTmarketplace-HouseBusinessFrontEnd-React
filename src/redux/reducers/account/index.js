// Import Constants
import { SET_ACCOUNT, SET_INJECTED } from "redux/constants";

const initialState = {
  account: null,
  injected: true,
};

const accountReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ACCOUNT:
      return {
        ...state,
        account: action.payload,
      };
    case SET_INJECTED:
      return {
        ...state,
        injected: action.payload
      }
    default:
      return state;
  }
};

export default accountReducer;
