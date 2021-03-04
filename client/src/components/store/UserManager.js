const userState = {
    loggedIn: false,
    name: '',
    permission: ''
}

const LOGIN_STATUS = 'LOGIN_STATUS'
const UPDATE_NAME = 'UPDATE_NAME'
const UPDATE_PERM = 'UPDATE_PERM'

export function setStatus(status) {
    return {
        type: LOGIN_STATUS,
        status
    }
}

export function setName(name) {
    return {
        type: UPDATE_NAME,
        name
    }
}

export function setPerm(permission) {
    return {
        type: UPDATE_PERM,
        permission
    }
}

export default function userReducer(state = userState, action) {
    switch (action.type) {
        case LOGIN_STATUS:
            return {
                loggedIn: action.status,
                name: state.name,
                permission: state.permission
            }
        case UPDATE_NAME:
            return {
                loggedIn: state.loggedIn,
                name: action.name,
                permission: state.permission
            }
        case UPDATE_PERM:
            return {
                loggedIn: state.loggedIn,
                name: state.name,
                permission: action.permission
            }
        default:
            return state
    }
}