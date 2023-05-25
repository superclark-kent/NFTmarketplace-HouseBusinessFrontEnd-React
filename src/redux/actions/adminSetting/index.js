import { LABELPERCENTS } from "redux/constants";

export const setLabelPercents = (labelPercents) => {
  return dispatch => {
    return dispatch({
      type: LABELPERCENTS,
      data: labelPercents
    })
  }
}