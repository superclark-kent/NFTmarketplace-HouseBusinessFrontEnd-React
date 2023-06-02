// Import Constants
import { SET_ACCOUNT, SET_INJECTED } from "redux/constants";

export const setAccount = (account) => {
  return {
    type: SET_ACCOUNT,
    payload: account,
  };
};

export const setInjected = (metamask) => {
  return {
    type: SET_INJECTED,
    payload: metamask
  }
}