// Import Constants
import { SET_ACCOUNT } from "redux/constants";

export const setAccount = (account) => {
  return {
    type: SET_ACCOUNT,
    payload: account,
  };
};
