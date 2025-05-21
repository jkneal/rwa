import {createAction, createActions, handleActions} from 'redux-actions'
import {navigate} from '../App'
import _ from "lodash";

let actions = {}

const defaultState = {
    message: null
}

actions.HANDLE_ERROR = (state, action) => {
    return {
        ...state,
        message: action.payload
    }
}

export const redirectToErrorPage = (errorMessage) => dispatch => {
    dispatch(createAction('HANDLE_ERROR')(errorMessage));
    navigate('/error')
}

export const reducers = handleActions(actions, defaultState)
const reduxActions = createActions({}, ..._.keys(actions))

export default reduxActions
