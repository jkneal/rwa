import {combineReducers} from 'redux'
import {reducer as formReducer} from 'redux-form'
import arrangementActions from '../reducers/arrangement'

import {reducers as app} from './app'
import {reducers as arrangement} from './arrangement'
import {reducers as address} from './address'
import {reducers as home} from './home'
import {reducers as attestation} from './attestation'
import {reducers as error} from './error'
import {reducers as admin} from './admin'
import {reducers as bulkInactivationDialog} from './bulkInactivationDialog'

export default () => combineReducers({
    app,
    arrangement,
    bulkInactivationDialog,
    home,
    attestation,
    address,
    error,
    admin,
    form: formReducer.plugin({
        arrangementForm: (state, action) => {
            if (action.type === "@@redux-form/SET_SUBMIT_FAILED") {
                action.asyncDispatch(arrangementActions.setSubmitClicked())
            }
            return state
        }
    })
})
