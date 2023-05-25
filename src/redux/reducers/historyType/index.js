import { HISTORYTYPES } from "redux/constants";

const initialState = {
  historyTypes: []
}

const historyTypesReducer = (state = initialState, action) => {
  switch (action.type) {
    case HISTORYTYPES:
      return {
        ...state,
        historyTypes: action.payload
      }
    default:
      return state;
  }
}

export default historyTypesReducer;