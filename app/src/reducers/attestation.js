import {createAction, createActions, handleActions} from 'redux-actions'
import {getResource, postResource} from "../util/RemoteOperations"
import {navigate} from '../App'

let actions = {}

const defaultState = {
    loading: false,
    currentAttestation: {},
    futureAttestations: [],
    message: {},
    editAttestation: null
}

actions.BEGIN_FETCH_ATTESTATIONS = (state) => {
    return {
        ...state,
        loading: true,
        message: {}
    }
}

actions.END_FETCH_ATTESTATIONS = (state, action) => {
    return {
        ...state,
        loading: false,
        currentAttestation: action.payload.currentAttestation,
        futureAttestations: action.payload.futureAttestations
    }
}

actions.BEGIN_SAVE_ATTESTATIONS = (state) => {
    return {
        ...state,
        loading: true,
        message: {}
    }
}

actions.END_SAVE_ATTESTATIONS = (state, action) => {
    let message = {}
    if (action.payload.errors && action.payload.errors.length > 0) {
        message = {
            variant: 'danger',
            text: 'Errors encountered during update: ' + action.payload.errors.join(" ")
        }
    } else {
        navigate('/admin/attestation')

        message = {
            variant: 'success',
            text: 'Attestation was succesfully updated.'
        }
    }

    return {
        ...state,
        loading: false,
        message
    }
}

actions.EDIT_ATTESTATION = (state, action) => {
    return {
        ...state,
        loading: false,
        editAttestation: action.payload,
        message: {}
    }
}

actions.CLEAR_MESSAGE = (state, action) => {
    return {
        ...state,
        message: null
    }
}

export const reducers = handleActions(actions, defaultState)
const reduxActions = createActions({}, ..._.keys(actions))

export default reduxActions

reduxActions.fetchAttestations = (dispatch) => {
    dispatch(createAction('BEGIN_FETCH_ATTESTATIONS')());
    dispatch(createAction('END_FETCH_ATTESTATIONS', getResource('/api/admin/attestation'))());
}

reduxActions.saveAttestation = attestation => (dispatch) => {
    dispatch(createAction('BEGIN_SAVE_ATTESTATIONS')());
    dispatch(createAction('END_SAVE_ATTESTATIONS', postResource('/api/admin/attestation', attestation))());
}
