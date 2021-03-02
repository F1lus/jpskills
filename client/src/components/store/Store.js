import {combineReducers, createStore} from 'redux'

import userReducer from './UserManager'

const reducer = combineReducers({
    userReducer
})

const store = createStore(reducer)

export default store