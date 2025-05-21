import {createAction, createActions, handleActions} from 'redux-actions'
import {getResource, postResource} from '../util/RemoteOperations'
import {navigate} from '../App'

let actions = {}

const defaultState = {
    loading: false,
    isSubmitting: false,
    doc: null,
    docLoaded: false,
    workflowActions: [],
    message: null,
    keepMessageOnLoad: false,
    showConfirmDisapproveDialog: false,
    shouldShowCancelDialog: false,
    submitClicked: false
}

actions.BEGIN_SUBMIT_ARRANGEMENT = (state, action) => {
    return {
        ...state,
        isSubmitting: true,
        message: null
    }
}

actions.END_SUBMIT_ARRANGEMENT = (state, action) => {
    let message

    const doc = action.payload ? action.payload : state.doc
    let docLoaded = false
    if (action.payload && action.payload.documentNumber) {
        docLoaded = true
        message = {
            variant: 'success',
            text: 'Arrangement was submitted for approval.'
        }
        navigate(`/arrangement/review/${action.payload.documentNumber}`)
    }

    return {
        ...state,
        isSubmitting: false,
        message,
        keepMessageOnLoad: true,
        doc,
        docLoaded
    }
}

actions.BEGIN_FETCH_ARRANGEMENT = (state, action) => {
    return {
        ...state,
        loading: true,
        message: state.keepMessageOnLoad ? state.message : null,
        showConfirmDisapproveDialog: false,
        keepMessageOnLoad: false
    }
}

actions.END_FETCH_ARRANGEMENT = (state, action) => {
    const doc = action.payload ? action.payload : state.doc
    return {
        ...state,
        loading: false,
        doc
    }
}

actions.EDIT_ARRANGEMENT = (state, action) => {
    return {
        ...state,
        doc: action.payload
    }
}

actions.SET_DOC_LOADED = (state, action) => {
    return {
        ...state,
        docLoaded: action.payload
    }
}

actions.BEGIN_FETCH_WORKFLOW_ACTIONS = (state, action) => {
    return {
        ...state,
        workflowActions: []
    }
}

actions.END_FETCH_WORKFLOW_ACTIONS = (state, action) => {
    return {
        ...state,
        workflowActions: action.payload
    }
}

actions.BEGIN_APPROVE_ARRANGEMENT = (state, action) => {
    return {
        ...state,
        loading: true,
        message: null
    }
}

actions.END_APPROVE_ARRANGEMENT = (state, action) => {
    const message = {
        variant: 'success',
        text: 'Arrangement was successfully approved.'
    }

    return {
        ...state,
        loading: false,
        doc: action.payload,
        message
    }
}

actions.BEGIN_PUSHBACK_ARRANGEMENT = (state, action) => {
    return {
        ...state,
        loading: true,
        message: null
    }
}

actions.END_PUSHBACK_ARRANGEMENT = (state, action) => {
    const message = {
        variant: 'success',
        text: 'AdHoc was successfully sent.'
    }

    action.asyncDispatch(reduxActions.fetchWorkflowActions(action.payload.documentNumber))

    return {
        ...state,
        loading: false,
        doc: action.payload,
        message
    }
}

actions.BEGIN_SAVE_ARRANGEMENT = (state, action) => {
    return {
        ...state,
        loading: true,
        message: null
    }
}

actions.END_SAVE_ARRANGEMENT = (state, action) => {
    const message = {
        variant: 'success',
        text: 'Arrangement was successfully updated.'
    }

    return {
        ...state,
        loading: false,
        doc: action.payload,
        message
    }
}

actions.BEGIN_ACKNOWLEDGE_ARRANGEMENT = (state, action) => {
    return {
        ...state,
        loading: true,
        message: null
    }
}

actions.END_ACKNOWLEDGE_ARRANGEMENT = (state, action) => {
    const message = {
        variant: 'success',
        text: 'Arrangement was successfully acknowledged.'
    }

    return {
        ...state,
        loading: false,
        doc: action.payload,
        message
    }
}

actions.BEGIN_DISAPPROVE_ARRANGEMENT = (state, action) => {
    return {
        ...state,
        loading: true,
        message: null,
        showConfirmDisapproveDialog: false
    }
}

actions.END_DISAPPROVE_ARRANGEMENT = (state, action) => {
    const message = {
        variant: 'success',
        text: 'Arrangement was disapproved.'
    }

    return {
        ...state,
        loading: false,
        doc: action.payload,
        message
    }
}

actions.CLEAR_MESSAGE = (state, action) => {
    return {
        ...state,
        message: null
    }
}

actions.SHOW_CONFIRM_DISAPPROVE = (state, action) => {
    return {
        ...state,
        message: null,
        showConfirmDisapproveDialog: true
    }
}

actions.HIDE_CONFIRM_DISAPPROVE = (state, action) => {
    return {
        ...state,
        message: null,
        showConfirmDisapproveDialog: false
    }
}

actions.SHOW_CANCEL_DIALOG = (state) => {
    return {
        ...state,
        shouldShowCancelDialog: true
    }
}


actions.HIDE_CANCEL_DIALOG = (state) => {
    return {
        ...state,
        shouldShowCancelDialog: false
    }
}

actions.SET_SUBMIT_CLICKED = (state) => {
    return {
        ...state,
        submitClicked: true
    }
}

actions.UNSET_SUBMIT_CLICKED = (state) => {
    return {
        ...state,
        submitClicked: false
    }
}

export const reducers = handleActions(actions, defaultState)
const reduxActions = createActions({}, ..._.keys(actions))

export default reduxActions

reduxActions.submitArrangement = (form) => (dispatch) => {
    dispatch(createAction('BEGIN_SUBMIT_ARRANGEMENT')());
    dispatch(createAction('END_SUBMIT_ARRANGEMENT', postResource('/api/arrangement/submit', form))());
}

reduxActions.fetchArrangement = documentNumber => (dispatch) => {
    dispatch(createAction('BEGIN_FETCH_ARRANGEMENT')());
    dispatch(createAction('END_FETCH_ARRANGEMENT', getResource('/api/arrangement/' + documentNumber))());
}

reduxActions.fetchWorkflowActions = documentNumber => (dispatch) => {
    dispatch(createAction('BEGIN_FETCH_WORKFLOW_ACTIONS')());
    dispatch(createAction('END_FETCH_WORKFLOW_ACTIONS', getResource('/api/arrangement/' + documentNumber + '/actions'))());
}

reduxActions.approveArrangement = (documentNumber, arrangement) => (dispatch) => {
    dispatch(createAction('BEGIN_APPROVE_ARRANGEMENT')());
    dispatch(createAction('END_APPROVE_ARRANGEMENT', postResource('/api/arrangement/' + documentNumber + '/approve',
        arrangement))());
}

reduxActions.pushbackArrangement = (documentNumber, arrangement) => (dispatch) => {
    dispatch(createAction('BEGIN_PUSHBACK_ARRANGEMENT')());
    dispatch(createAction('END_PUSHBACK_ARRANGEMENT', postResource('/api/arrangement/' + documentNumber + '/pushback',
        arrangement))());
}

reduxActions.saveArrangement = (documentNumber, arrangement) => (dispatch) => {
    dispatch(createAction('BEGIN_SAVE_ARRANGEMENT')());
    dispatch(createAction('END_SAVE_ARRANGEMENT', postResource('/api/arrangement/' + documentNumber + '/save',
        arrangement))());
}

reduxActions.disapproveArrangement = (documentNumber, arrangement) => (dispatch) => {
    dispatch(createAction('BEGIN_DISAPPROVE_ARRANGEMENT')());
    dispatch(createAction('END_DISAPPROVE_ARRANGEMENT', postResource('/api/arrangement/' + documentNumber + '/disapprove',
        arrangement))());
}

reduxActions.acknowledgeArrangement = (documentNumber) => (dispatch) => {
    dispatch(createAction('BEGIN_ACKNOWLEDGE_ARRANGEMENT')());
    dispatch(createAction('END_ACKNOWLEDGE_ARRANGEMENT', postResource('/api/arrangement/' + documentNumber + '/acknowledge',
        {}))());
}
