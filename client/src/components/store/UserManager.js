const userState = {
    loggedIn: false,
    user: '',
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

export function setName(user) {
    return {
        type: UPDATE_NAME,
        user
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
                user: state.user,
                permission: state.permission
            }
        case UPDATE_NAME:
            return {
                loggedIn: state.loggedIn,
                user: action.user,
                permission: state.permission
            }
        case UPDATE_PERM:
            return {
                loggedIn: state.loggedIn,
                user: state.user,
                permission: action.permission
            }
        default:
            return state
    }
}