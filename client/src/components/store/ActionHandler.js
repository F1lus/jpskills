import {setName, setPerm, setStatus} from './UserManager'

export const setNameHandler = (store, user) => {
    store.dispatch(setName(user))
}

export const setPermHandler = (store, perm) => {
    store.dispatch(setPerm(perm))
}

export const setStatusHandler = (store, status) => {
    store.dispatch(setStatus(status))
}