import { HISTORYTYPES } from "redux/constants";

export const setHistoryTypes = (historyTypes) => {
  return {
    type: HISTORYTYPES,
    payload: historyTypes
  }
}