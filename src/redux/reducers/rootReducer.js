// ** Redux Imports
import { combineReducers } from 'redux'

// Reducers Import
import houseReducer from './houseNft'
import accountReducer from './account'
import labelPercentReducer from './admin'
import historyTypesReducer from './historyType'

const rootReducer = combineReducers({
    houseNft: houseReducer,
    account: accountReducer,
    adminSetting: labelPercentReducer,
    historyTypes: historyTypesReducer
})

export default rootReducer