import React from 'react'
import {connect} from 'react-redux'
import {Button, Col, Dialog, DialogBody, DialogControls, Row} from 'rivet-react'
import bulkInactivationDialog from '../reducers/bulkInactivationDialog'
import {Field, formValueSelector, getFormValues, reduxForm, reset} from 'redux-form'
import {required} from "../util/common";
import {DateInput} from "./form/controls";
import {isEmpty} from "lodash";


const BULK_INACTIVATION_FORM = 'BULK_INACTIVATION_FORM'
const selector = formValueSelector(BULK_INACTIVATION_FORM)

const BulkInactivationDialog = (props) => {
    const {
        closeDialog, invalid, isOpen, saving, submitDialog, submitRequest
    } = props
    return (
        <Dialog
            id="bulk-inactivation-Dialog"
            isOpen={isOpen}
            onDismiss={saving ? ()=>{} : closeDialog}
            title='Bulk Inactivation'
        >
            <DialogBody className='BulkInactivationDialog-dialog__body'>
                <Row>
                    <Col>
                        <Field
                            name="inactivationDate"
                            label="Inactivation Date"
                            component={DateInput}
                            validate={[required]}
                            popperPlacement="top-start"
                        />
                    </Col>
                </Row>
            </DialogBody>
            <DialogControls>
                <Button
                    data-cy={'BulkInactivation-submit'}
                    disabled={invalid}
                    loading={saving}
                    onClick={() => submitDialog(submitRequest)}
                >
                    Inactivate
                </Button>
                <Button
                    data-cy={'BulkInactivation-cancel'}
                    disabled={saving}
                    modifier={"secondary"}
                    onClick={closeDialog}
                >
                    Cancel
                </Button>
            </DialogControls>
        </Dialog>
    )
}

const stateToProps = (state, ownProps) => {
    const { arrangements, form, saving } = state.bulkInactivationDialog
    const isOpen = !isEmpty(arrangements)
    const formValues = getFormValues(BULK_INACTIVATION_FORM)(state) || {}
    return {
        initialValues: {
            ...form
        },
        isOpen,
        saving,
        submitRequest: {
            ...formValues,
            ids: arrangements.map(({ rwaDocumentNumber }) => rwaDocumentNumber)
        }
    }
}

const dispatchToProps = (dispatch, ownProps) => {
    return {
        closeDialog: () => {
            dispatch(bulkInactivationDialog.closeDialog())
            dispatch(reset(BULK_INACTIVATION_FORM))
        },
        submitDialog: (request) => {
            dispatch(bulkInactivationDialog.actionRequest(request))
            dispatch(reset(BULK_INACTIVATION_FORM))
            ownProps.submitCallback()
        }
    }
}


export default connect(stateToProps, dispatchToProps)(reduxForm({
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
    form: BULK_INACTIVATION_FORM
})(BulkInactivationDialog))
