import {createAction, createActions, handleActions} from 'redux-actions'
import {getResource} from "../util/RemoteOperations"

let actions = {}

const defaultState = {
  user: {},
  env: {}
}

actions.RECEIVE_USER = (state, action) => {
  return {
    ...state,
    user: action.payload
  }
}

actions.FETCH_ENVIRONMENT = (state, action) => {
    return {
        ...state,
        env: action.payload
    }
}

export const reducers = handleActions({...actions},  defaultState)
const reduxActions = createActions({}, ..._.keys(actions))

reduxActions.fetchUser = (dispatch) => {
  dispatch(createAction('RECEIVE_USER', getResource('/api/user'))());
}

reduxActions.fetchEnvironment = () => dispatch => {
    dispatch(createAction('FETCH_ENVIRONMENT', getResource(`/api/env`))());
}

export default reduxActions
