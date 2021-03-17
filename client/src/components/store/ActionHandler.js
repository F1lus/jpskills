import {setName, setPerm, setStatus} from './UserManager'
import { setLoading } from './LoadingManager'

export const setNameHandler = (store, user) => {
    store.dispatch(setName(user))
}

export const setPermHandler = (store, perm) => {
    store.dispatch(setPerm(perm))
}

export const setStatusHandler = (store, status) => {
    store.dispatch(setStatus(status))
}

export const setLoad = (store, loading) => {
    store.dispatch(setLoading(loading))
}