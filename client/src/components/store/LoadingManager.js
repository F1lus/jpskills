const loadState = {
    loading: true
}

const SET_LOADING = 'SET_LOADING'

export function setLoading(loading){
    return {
        type: SET_LOADING,
        loading
    }
}

export default function loadReducer(state = loadState, action){
    switch(action.type){
        case SET_LOADING:
            return {
                loading: action.loading
            }
        default:
            return state
    }
}