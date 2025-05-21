import { createActions, handleActions } from 'redux-actions'
import _ from 'lodash'
import {getResource} from '../util/RemoteOperations'

let actions = {}

const defaultState = {
    loading: false,
    resources: [],
    displayResults: false,
    showLookup: false,
    lookupResourceName: null,
    lookupOnReturn : null,
    fetchUrl: null,
    fetchQueryParams: null,
    fetchCallback: null
}

actions.LOOKUP_REQUEST_ALL = (state, action) => ({
    ...state,
    loading: true,
    fetchUrl: action.payload.fetchUrl,
    fetchQueryParams: action.payload.fetchQueryParams,
    fetchCallback: action.payload.fetchCallback
})

actions.LOOKUP_RECEIVE_ALL = (state, action) => {
    let resources = action.payload
    let message = null
    if (resources && resources.length === 0) {
        message = 'No results found'
    }
    if (resources._embedded) {
        resources = Object.keys(resources._embedded)[0]
    }

    if (state.fetchCallback) {
        resources = state.fetchCallback(resources)
    }

    return {
        ...state,
        loading: false,
        resources,
        displayResults: true,
        message
    }
}

actions.SHOW_LOOKUP = (state, action) => {
    return {
        ...state,
        showLookup: true,
        lookupResourceName: action.payload.resourceName,
        lookupOnReturn: action.payload.onReturn,
        lookupOnReturnResults: action.payload.onReturnResults,
        filterBy: action.payload.filterBy
    }
}

actions.RESET_LOOKUP = (state, action) => {
    return {
        ...state,
        loading: false,
        resources: null,
        fetchCallback: null,
        displayResults: false,
        message: null
    }
}

actions.RETURN_FROM_LOOKUP = (state, action) => {
    let newState = {
        ..._.cloneDeep(state),
        showLookup: false,
        lookupResourceName: null,
        lookupOnReturn: null,
        lookupOnReturnResults: null,
        resources: null
    }
    return newState
}

actions.REFRESH_RESULTS = (state, action) => {
    action.asyncDispatch(reduxActions.lookupReceiveAll(state.fetchUrl, state.fetchQueryParams))

    return {
        ...state,
        loading: true
    }
}

export const reducers = handleActions(actions, defaultState)
const reduxActions = createActions({
    LOOKUP_RECEIVE_ALL: (url, queryParams) => {
        if (queryParams) {
            const urlSearchParams = new URLSearchParams(queryParams)
            url += '?' + urlSearchParams.toString()
        }
        return getResource(url)()
    }
},  'LOOKUP_REQUEST_ALL',
    'SHOW_LOOKUP',
    'RESET_LOOKUP',
    'RETURN_FROM_LOOKUP', 'REFRESH_RESULTS')

reduxActions.fetchAll = (url, queryParams, fetchCallback) => (dispatch) => {
    dispatch(reduxActions.lookupRequestAll({
        fetchUrl: url,
        fetchQueryParams: queryParams,
        fetchCallback
    }))
    return dispatch(reduxActions.lookupReceiveAll(url, queryParams))
}

export default reduxActions
