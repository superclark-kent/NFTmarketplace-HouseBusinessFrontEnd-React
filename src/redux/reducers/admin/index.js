import { LABELPERCENTS } from "redux/constants"

const initialState = {
  labelPercents: []
}

const labelPercentReducer = (state = initialState, action) => {
  switch (action.type) {
    case LABELPERCENTS:
      return {
        ...state,
        labelPercents: action.data
      }
    default:
      return state;
  }
}



export default labelPercentReducer