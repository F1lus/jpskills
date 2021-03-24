import { setName, setPerm, setStatus } from './UserManager'
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
    if (!loading) {
        setTimeout(() => store.dispatch(setLoading(loading)), 1000)
    } else {
        store.dispatch(setLoading(loading))
    }
}