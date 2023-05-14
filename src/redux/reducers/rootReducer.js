// ** Redux Imports
import { combineReducers } from 'redux'

// Reducers Import
import houseReducer from './houseNft'
import accountReducer from './account'

const rootReducer = combineReducers({
    houseNft: houseReducer,
    account: accountReducer,
})

export default rootReducer