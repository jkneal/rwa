import React, { useState } from 'react';
import {Button, ButtonGroup} from "rivet-react";
import PropTypes from "prop-types";
// Missing import for modal component we'll use later

export const JobArrangement = ({arrangement, loading, createArrangement, renewArrangement, viewArrangement}) => {
    const [showDetails, setShowDetails] = useState(false)
    const [detailsCache, setDetailsCache] = useState({})
    
    const fetchArrangementDetails = async (documentNumber) => {
        const respone = await fetch(`/api/arrangement/${documentNumber}/details`)
        const data = await respone.json()
        setDetailsCache({...detailsCache, [documentNumber]: data})
        return data
    }
    
    const toggleDetails = (documentNumber) => {
        setShowDetails(!showDetails)
        fetchArrangementDetails(documentNumber)
    }
    function iconPending() {
        return (
            <span className="rvt-inline-alert__icon">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                    <g fill="currentColor">
                        <path d="M11,9H5A1,1,0,0,1,5,7h6a1,1,0,0,1,0,2Z"/>
                        <path d="M8,16a8,8,0,1,1,8-8A8,8,0,0,1,8,16ZM8,2a6,6,0,1,0,6,6A6,6,0,0,0,8,2Z"/>
                    </g>
                </svg>
            </span>
        )
    }

    function iconApproved() {
        return (
            <span className="rvt-inline-alert__icon">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                    <g fill="green">
                        <path d="M10.2,5.4,7.1,9.53,5.67,8.25a1,1,0,1,0-1.34,1.5l2.05,1.82a1.29,1.29,0,0,0,.83.32h.12a1.23,1.23,0,0,0,.88-.49L11.8,6.6a1,1,0,1,0-1.6-1.2Z"/>
                        <path d="M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0ZM8,14a6,6,0,1,1,6-6A6,6,0,0,1,8,14Z"/>
                    </g>
                </svg>
            </span>
        )
    }

    function iconDisapproved() {
        return (
            <span className="rvt-inline-alert__icon">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                    <g fill="red">
                        <path d="M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0ZM8,14a6,6,0,1,1,6-6A6,6,0,0,1,8,14Z"/>
                        <path d="M10.83,5.17a1,1,0,0,0-1.41,0L8,6.59,6.59,5.17A1,1,0,0,0,5.17,6.59L6.59,8,5.17,9.41a1,1,0,1,0,1.41,1.41L8,9.41l1.41,1.41a1,1,0,0,0,1.41-1.41L9.41,8l1.41-1.41A1,1,0,0,0,10.83,5.17Z"/>
                    </g>
                </svg>
            </span>
        )
    }

    function buttonStart(optionalText) {
        return (
            <div className="rvt-p-left-md rvt-p-top-xs">
                {optionalText}
                <ButtonGroup margin={{ top: 'xs' }}>
                    <Button disabled={loading} onClick={() => createArrangement(arrangement.job)}>
                        Start your request</Button>
                </ButtonGroup>
            </div>
        )
    }

    function buttonsViewSubmissionAndRouteLog() {
        return (
            <div className="rvt-p-left-md rvt-p-top-xs">
                Thank you for submitting your request. It has been routed for approval. You will receive an
                email when it has been approved.
                <ButtonGroup margin={{ top: 'xs' }}>
                    <Button disabled={loading}
                            onClick={() => viewArrangement(arrangement.pendingOrDisapprovedDocument.documentNumber)}>
                        View submission</Button>
                </ButtonGroup>
            </div>
        )
    }

    function buttonsRenewAndViewArrangement() {
        return (
            <div className="rvt-p-left-md rvt-p-top-xs">
                Date approved: {arrangement.completedDocument.formattedCompletedTimestamp}<br/>
                Start Date: {arrangement.completedDocument.remoteWorkStartDate}
                {arrangement.completedDocument.remoteWorkEndDate != null
                    ? <div>End Date: {arrangement.completedDocument.remoteWorkEndDate}</div> : null}
                <ButtonGroup margin={{ top: 'xs' }}>
                    <Button disabled={loading}
                            onClick={() => renewArrangement(arrangement.completedDocument.documentNumber)}>
                        Renew or update request</Button>
                    <Button disabled={loading}
                            modifier="secondary"
                            onClick={() => viewArrangement(arrangement.completedDocument.documentNumber)}>
                        View arrangement</Button>
                    <Button 
                            onClick={() => toggleDetails(arrangement.completedDocument.documentNumber)}>
                        {showDetails ? "Hide details" : "Show details"}</Button>
                </ButtonGroup>
                {showDetails && detailsCache[arrangement.completedDocument.documentNumber] && (
                    <div className="arrangement-details">
                        <h4>Arrangement Details</h4>
                        <ul>
                            {Object.entries(detailsCache[arrangement.document.documentNumber] || {}).map(([key, value]) => (
                                <li key={key}>{key}: {value}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )
    }

    function notStartedArrangement() {
        return (
            <React.Fragment>
                <h3 className="job-status-header" style={{ fontWeight: "normal" }}>{iconPending()} No arrangement in place for <b>{arrangement.job.jobTitle}</b> ({arrangement.job.jobDepartmentId}, Rec {arrangement.job.jobRecordNumber})</h3>
                {buttonStart()}
            </React.Fragment>
        )
    }

    function completedArrangement() {
        return (
            <React.Fragment>
                <h3 className="job-status-header" style={{ fontWeight: "normal" }}>{iconApproved()} Work arrangement has been approved for <b>{arrangement.job.jobTitle}</b> ({arrangement.job.jobDepartmentId}, Rec {arrangement.job.jobRecordNumber})</h3>
                {buttonsRenewAndViewArrangement()}
            </React.Fragment>
        )
    }

    function completedAndExpiredArrangement() {
        return (
            <React.Fragment>
                <h3 className="job-status-header" style={{ fontWeight: "normal" }}>{iconPending()} Work arrangement for <b>{arrangement.job.jobTitle}</b> ({arrangement.job.jobDepartmentId}, Rec {arrangement.job.jobRecordNumber}) has expired</h3>
                {buttonsRenewAndViewArrangement()}
            </React.Fragment>
        )
    }

    function pendingArrangement() {
        return (
            <React.Fragment>
                <h3 className="job-status-header" style={{ fontWeight: "normal" }}>{iconPending()} Approval pending for <b>{arrangement.job.jobTitle}</b> ({arrangement.job.jobDepartmentId}, Rec {arrangement.job.jobRecordNumber})</h3>
                {buttonsViewSubmissionAndRouteLog()}
            </React.Fragment>
        )
    }

    function disapprovedArrangement() {
        return (
            <React.Fragment>
                <h3 className="job-status-header" style={{ fontWeight: "normal" }}>{iconDisapproved()} Work arrangement request denied for <b>{arrangement.job.jobTitle}</b> ({arrangement.job.jobDepartmentId}, Rec {arrangement.job.jobRecordNumber})</h3>
                {buttonStart(`Your request was denied: ${arrangement.pendingOrDisapprovedDocument.disapproveReason}`)}
            </React.Fragment>
        )
    }

    if (arrangement.completedDocument === null && arrangement.pendingOrDisapprovedDocument === null) {
        return notStartedArrangement();
    } else if (arrangement.pendingOrDisapprovedDocument !== null) {
        if (arrangement.pendingOrDisapprovedDocument.status === "R") {
            return pendingArrangement()
        } else {
            return disapprovedArrangement()
        }
    } else if (arrangement.completedDocument !== null) {
        if (arrangement.completedDocument.expired) {
            return completedAndExpiredArrangement()
        } else {
            return completedArrangement()
        }
    } else {
        return null
    }
}

JobArrangement.displayName = 'JobArrangement';
JobArrangement.propTypes = {
    arrangement: PropTypes.object.isRequired,
    createArrangement: PropTypes.func.isRequired,
    renewArrangement: PropTypes.func.isRequired,
    viewArrangement: PropTypes.func.isRequired,
};

export default JobArrangement;
