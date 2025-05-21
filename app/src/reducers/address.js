import {createAction, createActions, handleActions} from 'redux-actions'
import {getResource} from "../util/RemoteOperations"

let actions = {}

const defaultState = {
    countries: [],
    states: []
}

actions.FETCH_COUNTRIES = (state, action) => {
    return {
        ...state,
        countries: action.payload
    }
}

actions.FETCH_STATES = (state, action) => {
    return {
        ...state,
        states: action.payload
    }
}

export const reducers = handleActions(actions, defaultState)
const reduxActions = createActions({}, ..._.keys(actions))

export default reduxActions

reduxActions.fetchCountries = () => (dispatch) => {
    dispatch(createAction("FETCH_COUNTRIES", getResource("/api/countries/"))());
}

reduxActions.fetchStates = () => (dispatch) => {
    dispatch(createAction("FETCH_STATES", getResource("/api/states/"))());
}
