import {createAction, createActions, handleActions} from 'redux-actions'
import {getResource, postResource} from '../util/RemoteOperations'
import {navigate} from '../App'
import arrangementActions from './arrangement'

let actions = {}

const defaultState = {
    loading: false,
    arrangementOptions: []
}

actions.BEGIN_CREATE_ARRANGEMENT = (state) => {
    return {
        ...state,
        loading: true
    }
}

actions.END_CREATE_ARRANGEMENT = (state, action) => {
    if (action.payload) {
        action.asyncDispatch(arrangementActions.editArrangement(action.payload))
        navigate('/arrangement/new')
    }

    return {
        ...state,
        loading: false
    }
}

actions.FETCH_ARRANGEMENT_OPTIONS = (state, action) => {
    return {
        ...state,
        arrangementOptions: {
            arrangements : action.payload[0],
            oldArrangements : action.payload[1]
        }
    }
}

actions.BEGIN_RENEW_ARRANGEMENT = (state) => {
    return {
        ...state,
        loading: true
    }
}

actions.END_RENEW_ARRANGEMENT = (state, action) => {
    if (action.payload) {
        action.asyncDispatch(arrangementActions.editArrangement(action.payload))
        navigate('/arrangement/update')
    }

    return {
        ...state,
        loading: false
    }
}

export const reducers = handleActions(actions, defaultState)
const reduxActions = createActions({}, ..._.keys(actions))

export default reduxActions

reduxActions.createArrangement = (job) => (dispatch) => {
    dispatch(createAction('BEGIN_CREATE_ARRANGEMENT')());
    dispatch(createAction('END_CREATE_ARRANGEMENT', postResource('/api/arrangement', job))());
}

reduxActions.fetchArrangementOptions = dispatch => {
    dispatch(createAction('FETCH_ARRANGEMENT_OPTIONS', () => {
        return Promise.all([
            getResource('/api/user/rwas/status')(),
            getResource('/api/user/oldRwas/')()
        ])
            .then(result => {
                return result
            })
    })());
}

reduxActions.renewArrangement = (documentNumber) => (dispatch) => {
    dispatch(createAction('BEGIN_RENEW_ARRANGEMENT')());
    dispatch(createAction('END_RENEW_ARRANGEMENT', getResource(`/api/arrangement/${documentNumber}/update`))());
}
