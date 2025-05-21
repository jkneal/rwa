import {createAction, createActions, handleActions} from 'redux-actions'

import {postResource} from "../util/RemoteOperations";

import adminActions from "./admin"

const DEFAULT_STATE = () => {
  return {
    arrangements: [],
    form: DEFAULT_FORM(),
    saving: false,
    searchParameters: null
  }
}

const DEFAULT_FORM = () => {
  return {
    inactivationDate: null
  }
}

const defaultState = DEFAULT_STATE()
let actions = {}

actions.CLOSE_DIALOG = (state, action) => {
  return {
    ...state,
    ...DEFAULT_STATE()
  }
}

actions.OPEN_DIALOG = (state, action) => {
  const { arrangements, searchParameters } = action.payload
  return {
    ...state,
    arrangements,
    searchParameters
  }
}

actions.BEGIN_ACTION_REQUEST = (state, action) => {
  return {
    ...state,
    saving: true
  }
}

actions.END_ACTION_REQUEST = (state, action) => {
  const { searchParameters } = state
  action.asyncDispatch(adminActions.setMessage(getMessage(action)))
  action.asyncDispatch(adminActions.searchArrangements(searchParameters))

  return {
    ...state,
    ...DEFAULT_STATE()
  }
}

function getMessage(action) {
  const { invalid } = action.payload
  if(_.isEmpty(invalid)) {
    return {
      title: 'Arrangement Inactivation',
      variant: 'success',
      text: 'All arrangements inactivated'
    }
  }
  const invalidArrangements = invalid.join(', ')
  return {
    title: 'Arrangement Inactivation',
    variant: 'warning',
    text: `Unable to inactivate: ${invalidArrangements}`
  }
}

export const reducers = handleActions(actions, defaultState)

const reduxActions = createActions({
}, ..._.keys(actions))

reduxActions.actionRequest = (request) => dispatch => {
  const {ids, inactivationDate} = request
  const body = {
    ids,
    inactivationDate
  }

  dispatch(createAction('BEGIN_ACTION_REQUEST')());
  dispatch(createAction('END_ACTION_REQUEST', postResource('/api/arrangement/inactivate', body))())
}

export default reduxActions