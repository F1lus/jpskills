import { combineReducers, createStore } from 'redux'

import userReducer from './UserManager'
import loadReducer from './LoadingManager'

const reducer = combineReducers({
    userReducer,
    loadReducer
})

const store = createStore(reducer)

export default store