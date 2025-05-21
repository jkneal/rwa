import {connect} from "react-redux"
import {navigate} from '../../App'
import attestationActions from "../../reducers/attestation"
import loader from "../../util/loader"
import DocumentTitle from "react-document-title"
import {Badge, Button, Col, DismissibleAlert, Row} from "rivet-react"
import {Loading} from "../../util/common"
import {AttestationTextList} from "../../components/AttestationTextList";

const AttestationText = ({currentAttestation, futureAttestations, loading, message, createNewVersion,
                                 editAttestation, clearMessage}) => {
    if (!currentAttestation.text || loading) {
        return <Loading/>
    }

    return (
        <div>
            <DocumentTitle title="Attestation Text Maintenance - Indiana University"/>
            <h1>Attestation Text Maintenance</h1>

            {message && message.text &&
            <DismissibleAlert id="page-alert" variant={message.variant} title={message.title}
                              onDismiss={clearMessage}>{message.text}</DismissibleAlert>}

            <Badge variant="success" className="rvt-m-top-xs rvt-m-bottom-xs">Current</Badge>
            <Attestation attestation={currentAttestation}/>
            <div>
                <Button id={'create-new-version'} alt="Create New Version" disabled={loading} size="small"
                        onClick={() => createNewVersion(currentAttestation)}>Create New Version</Button>
            </div>

            {futureAttestations.map((attestation, i) => <div key={i}>
                <Badge variant="warning" className="rvt-m-top-md rvt-m-bottom-xs">Future {attestation.effectiveDate}</Badge>
                <Attestation attestation={attestation}/>
                <div>
                    <Button alt="Edit Attestation" disabled={loading} size="small"
                            onClick={() => editAttestation(attestation)}>Edit</Button>
                </div>
            </div>)}
        </div>
    )
}

const Attestation = ({attestation}) => {
    return (
        <div>
            <Row className="rvt-m-bottom-xs">
                <Col columnWidth={4}>
                    <span className="fieldLabel">Effective Date: </span> {attestation.effectiveDate}
                </Col>
                <Col columnWidth={3}>
                    <span className="fieldLabel">Last Update User: </span> {attestation.lastUpdatedUserId}
                </Col>
                <Col columnWidth={5}>
                    <span className="fieldLabel">Last Update Timestamp: </span> {attestation.lastUpdatedTimestamp}
                </Col>
            </Row>

            <Row className="rvt-m-bottom-xs">
                <Col columnWidth={11}>
                    <div className="fieldLabel rvt-m-bottom-xs">Text: </div>
                    <div>
                        <AttestationTextList text={attestation.text}/>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

const stateToProps = ({attestation}) => {
    return {
        currentAttestation: attestation.currentAttestation,
        futureAttestations: attestation.futureAttestations,
        loading: attestation.loading,
        message: attestation.message
    }
}

const dispatchToProps = (dispatch) => {
    return {
        onLoad: () => {
            dispatch(attestationActions.fetchAttestations)
        },
        createNewVersion: (currentAttestation) => {
            const newVersion = {...currentAttestation, id: null, effectiveDate: null}
            dispatch(attestationActions.editAttestation(newVersion))
            navigate('/admin/attestation/edit')
        },
        editAttestation: (attestation) => {
            dispatch(attestationActions.editAttestation(attestation))
            navigate('/admin/attestation/edit')
        },
        clearMessage: () => dispatch(attestationActions.clearMessage())
    }
}

export default connect(stateToProps, dispatchToProps)(loader(AttestationText))
