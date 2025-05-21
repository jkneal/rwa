import {connect} from "react-redux"
import {navigate} from '../../App'
import attestationActions from "../../reducers/attestation"
import loader from "../../util/loader"
import DocumentTitle from "react-document-title"
import {Button, ButtonGroup, Col, Disclosure, DismissibleAlert, Row} from "rivet-react"
import {Field, formValueSelector, reduxForm} from "redux-form"
import {DateInput, Textarea} from '../../components/form/controls'
import {dateAfterToday, formatDate, maxLengthAttestationText, parseDate, required} from "../../util/common"
import {AttestationTextList} from "../../components/AttestationTextList";
import {Forms} from "../../constants";
import React from "react";

const EditAttestationText = ({loading, message, invalid, save, cancel, handleSubmit, clearMessage, text}) => {
    return (
        <div>
            <DocumentTitle title="Edit Attestation Text - Indiana University"/>
            <h1>Edit Attestation Text</h1>

            {message && message.text &&
            <DismissibleAlert id="page-alert" variant={message.variant} title={message.title}
                              onDismiss={clearMessage}>{message.text}</DismissibleAlert>}

            <form onSubmit={e => e.preventDefault()}>
                <Row className="rvt-m-bottom-sm">
                    <Col>
                        <Field name="effectiveDate" label="Effective Date" component={DateInput}
                               required={true} validate={[required, dateAfterToday]}/>
                    </Col>
                </Row>

                <Row className="rvt-m-bottom-sm">
                    <Col>
                        <label htmlFor="text">Text *</label>
                        <Disclosure className="help-collapse" title="Syntax Help">
                            <ul>
                                <li>For a list item, prepend line with '+ ' characters (must include a space after the '+')</li>
                                <li>To create a nested list item, add two spaces at the beginning of the line before the '+ ' characters</li>
                                <li>Links can be added with the syntax '[Link Text](Link URL)'</li>
                                <li>To make text bold, wrap the text with two asterisks: '**words to bold**'</li>
                            </ul>
                        </Disclosure>
                        <Field id={"attestation-text-textarea"} name="text" component={Textarea} className="attestation-textarea no-label"
                               required={true} validate={[required, maxLengthAttestationText]} maxLength={"4000"} label={"Text"}/>
                    </Col>
                    <Col>
                        <span id={'attestation-list-preview__header'}>Preview</span>
                        <AttestationTextList text={text}/>
                    </Col>
                </Row>

                <ButtonGroup className="rvt-m-top-md">
                    <Button id="save" alt="save" disabled={loading || invalid} onClick={handleSubmit(form => save(form))}>Save</Button>
                    <Button id="cancel" alt="cancel" disabled={loading} modifier="secondary" onClick={cancel}>Cancel</Button>
                </ButtonGroup>
            </form>
        </div>
    )
}

const stateToProps = (state) => {
    const selector = formValueSelector(Forms.EDIT_ATTESTATION_FORM)

    return {
        initialValues: {...state.attestation.editAttestation,
            effectiveDate: parseDate((state.attestation.editAttestation || {}).effectiveDate)},
        loading: state.attestation.loading,
        message: state.message,
        text: selector(state, "text")
    }
}

const dispatchToProps = (dispatch) => {
    return {
        save: (attestation) => {
            attestation = {...attestation, effectiveDate: formatDate(attestation.effectiveDate)}
            dispatch(attestationActions.saveAttestation(attestation))
        },
        cancel: () => {
            navigate('/admin/attestation')
        },
        clearMessage: () => dispatch(attestationActions.clearMessage())
    }
}

export default connect(stateToProps, dispatchToProps)(reduxForm({
    enableReinitialize: true,
    form: Forms.EDIT_ATTESTATION_FORM,
})(loader(EditAttestationText)))
