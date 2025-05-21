import React from 'react'
import DocumentTitle from 'react-document-title'
import {connect} from 'react-redux'
import {change, Field, reduxForm, SubmissionError, untouch} from 'redux-form'
import {
    Button,
    ButtonGroup,
    Col,
    Dialog,
    DialogBody,
    DialogControls,
    DismissibleAlert,
    InlineAlert,
    Row,
    Table
} from 'rivet-react'
import {PersonSelectInput, Textarea} from '../components/form/controls'
import DisapproveDialog from './DisapproveDialog'
import arrangementActions from '../reducers/arrangement'
import {Loading, maxLengthApproverComments} from "../util/common"
import _ from 'lodash'
import {DISPLAY_STATUS_MAP, Forms} from '../constants'
import {AttestationTextList} from "../components/AttestationTextList";
import {useParams} from "react-router";
import {navigate} from "../App";

class ReviewArrangement extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (!this.props.docLoaded) {
            this.props.loadDocument()
        } else {
            this.props.setDocLoaded(false)
        }
    }

    componentDidUpdate() {
        this.queueAlertDismiss()
    }

    componentWillReceiveProps(nextProps) {
        const currentInProcess = this.props.arrangement && this.props.arrangement.workflowDocument &&
            this.props.arrangement.workflowDocument.inProcess
        const nextInProcess = nextProps.arrangement && nextProps.arrangement.workflowDocument &&
            nextProps.arrangement.workflowDocument.inProcess
        if (!currentInProcess && nextInProcess) {
            this.props.loadWorkflowActions()
        }
    }

    queueAlertDismiss() {
        if (document.getElementById("page-alert")) {
            setTimeout(this.props.clearMessage, 2000)
        }
    }

    render() {
        const {currentUser, riceUrl, arrangement, workflowActions, approve, pushback, showConfirmDisapproveDialog, showConfirmDisapprove,
            hideConfirmDisapprove, disapprove, acknowledge, save, cancel, loading, invalid, message, clearMessage,
            setFormValue, untouch, handleSubmit} = this.props

        if (!arrangement || !arrangement.documentNumber || loading) {
            return <Loading/>
        }

        const inProcess = arrangement.workflowDocument && arrangement.workflowDocument.inProcess
        const canApprove = arrangement.workflowDocument && arrangement.workflowDocument.canApprove
        const canDisapprove = arrangement.workflowDocument && arrangement.workflowDocument.canDisapprove
        const canAcknowledge = arrangement.workflowDocument && arrangement.workflowDocument.canAcknowledge

        const isSupervisor = arrangement.supervisorReviewerId == currentUser.networkId
        const isHrReviewer = arrangement.hrReviewerId == currentUser.networkId
        const atSupervisorNode = workflowActions && workflowActions.length === 1
        const superUserComplete = currentUser.admin && inProcess && atSupervisorNode

        const fixedDays = {
            'Monday': arrangement.arrangementWorkDays.fixedMonday,
            'Tuesday': arrangement.arrangementWorkDays.fixedTuesday,
            'Wednesday': arrangement.arrangementWorkDays.fixedWednesday,
            'Thursday': arrangement.arrangementWorkDays.fixedThursday,
            'Friday': arrangement.arrangementWorkDays.fixedFriday,
            'Saturday': arrangement.arrangementWorkDays.fixedSaturday,
            'Sunday': arrangement.arrangementWorkDays.fixedSunday
        }
        const fixedDaysString = _.join(_.compact(_.map(fixedDays, (value, key) => value ? key : null)), ', ')

        const writeMultiLineString = string => {
            const stringLines = (string || '').split('\n')
            return (
                <span>
                {stringLines.map((line, i) => <span key={i}>{line}<br/></span>)}
            </span>
            )
        }

        const displayStatus = DISPLAY_STATUS_MAP[arrangement.status]
        const statusAlertVariant = arrangement.status === 'A' ? 'danger' : (arrangement.status === 'C' ? 'success' : 'info')

        return (
            <div id="review-agreement">
                <DocumentTitle title="Review Remote Work Arrangement - Indiana University"/>
                <div className="rvt-m-bottom-md">
                    {canApprove && <h1>Review Remote Work Arrangement</h1>}
                    {!canApprove && <h1>Remote Work Arrangement</h1>}

                    {message &&
                    <DismissibleAlert id="page-alert"
                                      variant={message.variant}
                                      title={message.title}
                                      onDismiss={clearMessage}>
                        {message.text}
                    </DismissibleAlert>
                    }
                    <InlineAlert id="status-alert" className={"rvt-m-top-sm"} variant={statusAlertVariant} standalone>Status: {displayStatus}</InlineAlert>
                </div>

                {inProcess && canApprove &&
                <h2 className="rvt-m-bottom-sm">You are reviewing for {arrangement.employeeFirstName} {arrangement.employeeLastName}</h2>}

                <Row className="rvt-m-bottom-xs rvt-m-top-md">
                    <Col columnWidth={6}>
                        <h3>Employee Information</h3>
                    </Col>
                </Row>

                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Name: </span> <span id="name">{arrangement.employee.firstName} {arrangement.employee.lastName}</span>
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">University ID: </span> {arrangement.job.emplid}
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Phone Number: </span> <span id="campusPhoneNumber">{arrangement.employee.campusPhoneNumber}</span>
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Job Title/Rank: </span> <span id="jobTitle">{arrangement.job.jobTitle}</span>
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Department Code: </span> <span id="jobDepartmentId">{arrangement.job.jobDepartmentId}</span>
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Campus: </span> <span id="campus">{arrangement.employee.campus}</span>
                    </Col>
                </Row>

                <Row className="rvt-m-bottom-xs rvt-m-top-md">
                    <Col columnWidth={6}>
                        <h3>Remote Work Arrangement Details</h3>
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Work Type: </span> <span id="remoteWorkType">{arrangement.remoteWorkType}</span>
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Start Date: </span> <span id="remoteWorkStartDate">{arrangement.remoteWorkStartDate}</span>
                    </Col>
                </Row>
                {arrangement.remoteWorkEndDate && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">End Date: </span> <span id="remoteWorkEndDate">{arrangement.remoteWorkEndDate}</span>
                        {arrangement.endedDueToSupervisorChange && <span id="supervisorChange">. This Arrangement was ended due to a supervisor change.</span>}
                    </Col>
                </Row>}
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Core Work Hours: </span> <span id="coreHours">{arrangement.arrangementWorkDays.formattedCoreHoursStartTime} - {arrangement.arrangementWorkDays.formattedCoreHoursEndTime} EST daily</span>
                    </Col>
                </Row>
                {arrangement.remoteWorkType === "HYBRID" && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Fixed or Floating Remote Days: </span> <span id="workDaysType">{arrangement.arrangementWorkDays.workDaysType}</span>
                    </Col>
                </Row>}
                {arrangement.arrangementWorkDays.workDaysType === 'FLOATING' && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Number of Remote Days Per Week: </span> <span id="floatingNumberOfDays">{arrangement.arrangementWorkDays.floatingNumberOfDays}</span>
                    </Col>
                </Row>}
                {arrangement.arrangementWorkDays.workDaysType === 'FIXED' && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Days Worked Remotely: </span> <span id="remoteWorkDays">{fixedDaysString}</span>
                    </Col>
                </Row>}
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <div className="rvt-flex">
                            <div className="fieldLabel">Remote Work Location: </div>
                            {arrangement.workAddressHome ? <div id="workLocation" className="rvt-m-left-xs">Home</div> :
                                <div id="workLocation" className="rvt-m-left-xs">
                                    {arrangement.workAddressLine1}<br/>
                                    {arrangement.workAddressLine2 && <span>{arrangement.workAddressLine2}<br/></span>}
                                    {arrangement.workAddressCity}
                                    {arrangement.workAddressState && <span>, {(arrangement.workState || {}).postalStateName} ({arrangement.workAddressState}) </span>}
                                    <br/>
                                    {arrangement.workAddressZip}<br/>
                                    {(arrangement.workCountry || {}).postalCountryName} ({arrangement.workAddressCountry})
                                </div>}
                        </div>
                    </Col>
                </Row>
                {arrangement.workAddressHome && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Country Working From: </span> <span id="workCountry">{(arrangement.workCountry || {}).postalCountryName} ({arrangement.workAddressCountry})</span>
                    </Col>
                </Row>}
                {arrangement.workAddressHome && arrangement.workAddressState && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">State Working From: </span> <span id="workState">{(arrangement.workState || {}).postalStateName} ({arrangement.workAddressState})</span>
                    </Col>
                </Row>}
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={8}>
                        <span className="fieldLabel">Within 30 miles of an IU campus: </span> <span id="distanceIuCampus">{arrangement.distanceIuCampus === null ? '' : arrangement.distanceIuCampus ? 'Yes' : 'No'}</span>
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={8}>
                        <span className="fieldLabel">Student-facing percentage: </span> <span id="studentFacingPercentage">{arrangement.studentFacingPercentage}%</span>
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={8}>
                        <span className="fieldLabel">Reason for Remote Work: </span>{arrangement.reason && <br/>}<span id="reason">{writeMultiLineString(arrangement.reason)}</span>
                    </Col>
                </Row>

                <Row className="rvt-m-bottom-xs rvt-m-top-md">
                    <Col columnWidth={6}>
                        <h3>Review Information</h3>
                    </Col>
                </Row>
                {arrangement.supervisorReviewerId && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Supervisor: </span> <span id="supervisor">{arrangement.supervisor.firstName} {arrangement.supervisor.lastName}</span>
                    </Col>
                </Row>}
                {arrangement.hrReviewerId && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Human Resources Reviewer: </span> {arrangement.hrReviewer.firstName} {arrangement.hrReviewer.lastName}
                    </Col>
                </Row>}
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Document Number: </span> <span id="documentNumber">{arrangement.documentNumber}</span>
                    </Col>
                </Row>
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Create Date: </span> <span id="createDate">{arrangement.formattedCreateTimestamp}</span>
                    </Col>
                </Row>
                {(arrangement.status === 'C') && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Completed Date: </span> <span id="completeDate">{arrangement.formattedCompletedTimestamp}</span>
                    </Col>
                </Row>}
                {arrangement.disapproveReason && <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Reason for disapproving: </span> <span id="disapproveReason">{arrangement.disapproveReason}</span>
                    </Col>
                </Row>}
                <Row className="rvt-m-bottom-xs">
                    <Col columnWidth={6}>
                        <span className="fieldLabel">Last Updated Timestamp: </span> <span id="lastUpdatedTs">{arrangement.formattedLastUpdatedTimestamp}</span>
                    </Col>
                </Row>

                {(inProcess && (canApprove || superUserComplete))
                    ?
                    <div className="rvt-m-top-md">
                        <form onSubmit={e => e.preventDefault()}>
                            <Row className="rvt-m-bottom-sm">
                                <Col lg={8}>
                                    <div className="fieldLabel">Actions Taken: </div>
                                    <Table id="actions-taken" className="rvt-m-top-xs" compact variant="stripes">
                                        <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Action</th>
                                            <th width="25%">Date</th>
                                            <th>Approver Comments</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {workflowActions.map((action, i) => <tr key={i}>
                                            <td>{action.principalName}</td>
                                            <td>{action.type}</td>
                                            <td>{action.formattedCreateTime}</td>
                                            <td>{action.annotation}</td>
                                        </tr>)}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                            {(isSupervisor || superUserComplete) &&
                            <Row className="rvt-m-bottom-sm">
                                <Col lg={4}>
                                    <Field name="hrReviewerId" label="Who is your human resources reviewer?"
                                           component={PersonSelectInput} required={true}
                                           id="hrReviewer"
                                           defaultValue={
                                               arrangement.hrReviewerId ?
                                               {
                                                   value: arrangement.hrReviewerId,
                                                   label: arrangement.hrReviewer.lastName + ", " + arrangement.hrReviewer.firstName + " (" + arrangement.hrReviewerId + ")"
                                               }
                                               : undefined}
                                    />
                                </Col>
                            </Row>
                            }
                            {canApprove && <Row className="rvt-m-bottom-sm">
                                <Col lg={4}>
                                    <Field name="additionalReviewerId" label="Additional reviewer" component={PersonSelectInput} id="adhoc"/>
                                </Col>
                            </Row>}
                            {canApprove && <Row className="rvt-m-bottom-sm">
                                <Col lg={8}>
                                    <label htmlFor="comments" className='rvt-label'>Approver Comments</label>
                                    <div className="rvt-ts-14">Comments entered below are visible to all university employees via the Workflow Route Log.</div>
                                    <Field id="comments" label="comments" name="comments" className="no-label" component={Textarea} validate={[maxLengthApproverComments]} maxLength={"300"}/>
                                </Col>
                            </Row>}

                            <Row className="rvt-m-bottom-sm">
                                <Col>
                                    <ButtonGroup>
                                        {canApprove && <Button id="approve" alt="Approve Arrangement"
                                                               disabled={loading} onClick={handleSubmit(form => approve(form, isSupervisor, isHrReviewer))}>Approve</Button>}
                                        {isHrReviewer && <Button id="pushback" alt="Send AdHoc"
                                                               disabled={loading} onClick={handleSubmit(form => pushback(form))}>Send AdHoc</Button>}
                                        {canDisapprove && <Button id="disapprove" modifier="secondary" alt="Disapprove Arrangement"
                                                                  disabled={loading} onClick={showConfirmDisapprove}>Disapprove</Button>}
                                        {!canApprove && superUserComplete && <Button id="save" alt="Save Arrangement"
                                                               disabled={loading} onClick={handleSubmit(save)}>Save</Button>}
                                        <Button id="cancel" modifier="secondary" alt="Cancel" onClick={cancel}
                                                disabled={loading}>Cancel</Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </form>
                    </div>
                    :
                    <div className="rvt-m-top-md">
                        <Row>
                            <Col columnWidth={8}>
                                <div className="fieldLabel">Acknowledgement</div>
                                <div className="rvt-m-top-xs">
                                    <AttestationTextList text={arrangement.attestationText.text}/>
                                </div>
                            </Col>
                        </Row>
                        <Row className="rvt-m-top-md print-arrangement">
                            <Col>
                                <Row>
                                    <Col><span className="fieldLabel">Print or Save a copy as PDF</span></Col>
                                </Row>
                                <Row>
                                    <Col typescale={14}>You can print a copy of this request or save an electronic copy as PDF.</Col>
                                </Row>
                                <Row className={"rvt-m-top-sm"}>
                                    <Col>
                                        <ButtonGroup>
                                            <Button id="print" onClick={window.print}>Print/Save</Button>
                                            <Button id="return-home" modifier="secondary" onClick={cancel}>Return to Home</Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="rvt-m-top-md">
                            <Col>
                                <a target="_blank" href={riceUrl + `kew/RouteLog.do?documentId=${arrangement.documentNumber}`}>View Actions Taken and Comments</a>
                            </Col>
                        </Row>
                    </div>
                }
                {canAcknowledge &&
                <Row className="rvt-m-top-md">
                    <Col>
                        <ButtonGroup>
                            <Button id="acknowledge" alt="Acknowledge Arrangement"
                                    disabled={loading} onClick={acknowledge}>Acknowledge</Button>
                        </ButtonGroup>
                    </Col>
                </Row>
                }
                {showConfirmDisapproveDialog &&
                <Dialog isOpen={true} title="Confirm Disapprove">
                    <DialogBody>
                        <DisapproveDialog
                            setFormValue={setFormValue}
                            untouch={untouch}
                        />
                    </DialogBody>
                    <DialogControls>
                        <Button id="disapprove-submit" onClick={handleSubmit(form => disapprove(form))}>Submit</Button>
                        <Button id="disapprove-cancel" modifier={"secondary"} onClick={hideConfirmDisapprove}>Cancel</Button>
                    </DialogControls>
                </Dialog>
                }
            </div>
        )
    }
}

const stateToProps = ({app, arrangement}) => {
    return {
        currentUser: app.user,
        riceUrl: app.env.riceUrl,
        docLoaded: arrangement.docLoaded,
        arrangement: arrangement.doc,
        initialValues: arrangement.doc,
        workflowActions: arrangement.workflowActions,
        loading: arrangement.loading,
        message: arrangement.message,
        showConfirmDisapproveDialog: arrangement.showConfirmDisapproveDialog,
    }
}

const dispatchToProps = (dispatch, ownProps) => {
    let {documentNumber} = useParams()

    return {
        loadDocument: () => {
            dispatch(arrangementActions.fetchArrangement(documentNumber))
        },
        loadWorkflowActions: () => {
            dispatch(arrangementActions.fetchWorkflowActions(documentNumber))
        },
        setDocLoaded: (loaded) => {
            dispatch(arrangementActions.setDocLoaded(loaded))
        },
        approve: (arrangement, isSupervisor, isHrReviewer) => {
            arrangement.hrReviewerId = arrangement.hrReviewerId ? (typeof arrangement.hrReviewerId === 'object' ? arrangement.hrReviewerId.networkId : arrangement.hrReviewerId) : null
            arrangement.additionalReviewerId = arrangement.additionalReviewerId ? (typeof arrangement.additionalReviewerId === 'object' ? arrangement.additionalReviewerId.networkId : arrangement.additionalReviewerId) : null

            if (isSupervisor && !arrangement.hrReviewerId) {
                throw new SubmissionError({
                    hrReviewerId: 'Required'
                })
            }

            if (isHrReviewer && arrangement.additionalReviewerId) {
                throw new SubmissionError({
                    additionalReviewerId: 'Must be empty to approve at HR node'
                })
            }

            dispatch(arrangementActions.approveArrangement(documentNumber, arrangement))
        },
        pushback: arrangement => {
            if (!arrangement.additionalReviewerId) {
                throw new SubmissionError({
                    additionalReviewerId: 'Required for Send AdHoc'
                })
            }

            dispatch(arrangementActions.pushbackArrangement(documentNumber, arrangement))
        },
        disapprove: (arrangement) => {
            dispatch(arrangementActions.hideConfirmDisapprove())
            dispatch(arrangementActions.disapproveArrangement(documentNumber, arrangement))
        },
        acknowledge: () => {
            dispatch(arrangementActions.acknowledgeArrangement(documentNumber))
        },
        save: (arrangement) => {
            dispatch(arrangementActions.saveArrangement(documentNumber, arrangement))
        },
        clearMessage: () => dispatch(arrangementActions.clearMessage()),
        showConfirmDisapprove: () => dispatch(arrangementActions.showConfirmDisapprove()),
        hideConfirmDisapprove: () => dispatch(arrangementActions.hideConfirmDisapprove()),
        cancel: () => {
            navigate('/')
        },
        setFormValue: (field, value) => {
            dispatch(change(Forms.REVIEW_ARRANGEMENT_FORM, field, value))
        },
        untouch: (field) => {
            dispatch(untouch(Forms.REVIEW_ARRANGEMENT_FORM, field))
        }
    }
}

export default connect(stateToProps, dispatchToProps)(reduxForm({
    enableReinitialize: true,
    form: Forms.REVIEW_ARRANGEMENT_FORM,
})(ReviewArrangement))
