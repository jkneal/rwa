import {createAction, createActions, handleActions} from 'redux-actions'
import {getResource, postResource} from "../util/RemoteOperations"
import _ from 'lodash'

let actions = {}

const defaultState = {
    charts: [],
    organizations: [],
    arrangements: [],
    arrangementsLoading: false,
    message: null
}

actions.FETCH_CHARTS = (state, action) => {
    return {
        ...state,
        charts: action.payload.map(e => ({value: e.code, label: e.description + " (" + e.code + ")"})),
    }
}

actions.FETCH_ORGANIZATIONS = (state, action) => {
    return {
        ...state,
        organizations: action.payload.map(e => ({...e, name: e.name + " (" + e.code + ")"})),
    }
}

actions.BEGIN_FETCH_ARRANGEMENTS = (state, action) => {
    return {
        ...state,
        arrangementsLoading: true
    }
}

actions.END_FETCH_ARRANGEMENTS = (state, action) => {
    return {
        ...state,
        arrangements: _.sortBy(action.payload, 'name'),
        arrangementsLoading: false
    }
}

actions.RESET_FETCH_ARRANGEMENTS = (state) => {
    return {
        ...state,
        arrangements: [],
        arrangementsLoading: false,
    }
}

actions.CLEAR_MESSAGE = (state, action) => {
    return {
        ...state,
        message: null
    }
}

actions.SET_MESSAGE = (state, action) => {
    return {
        ...state,
        message: action.payload
    }
}

export const reducers = handleActions(actions, defaultState)
const reduxActions = createActions({}, ..._.keys(actions))

export default reduxActions

reduxActions.fetchCharts = () => (dispatch) => {
    dispatch(createAction('FETCH_CHARTS', getResource('/api/charts/'))())
}

reduxActions.fetchOrganizations = () => (dispatch) => {
    dispatch(createAction('FETCH_ORGANIZATIONS', getResource('/api/organizations/'))())
}

reduxActions.searchArrangements = (values) => (dispatch) => {
    dispatch(createAction('BEGIN_FETCH_ARRANGEMENTS')())
    dispatch(createAction('END_FETCH_ARRANGEMENTS', postResource('/api/admin/arrangements/search', values))())
}

reduxActions.reset = () => (dispatch) => {
    dispatch(createAction('RESET_FETCH_ARRANGEMENTS')())
}
