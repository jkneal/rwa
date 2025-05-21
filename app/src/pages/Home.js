import {Container, InlineAlert} from "rivet-react";
import {connect} from "react-redux"
import homeActions from '../reducers/home'
import {reduxForm} from "redux-form";
import {Forms} from "../constants";
import loader from "../util/loader";
import JobArrangement from "../components/JobArrangement";
import React from "react";
import {navigate} from '../App'
import {Loading} from "../util/common";

const Home = ({arrangements, oldArrangements, currentUser, loading, createArrangement, renewArrangement, viewArrangement}) => {
    if (!currentUser || !currentUser.networkId) {
        return null
    }
    if (loading) {
        return <Loading/>
    }

    const previousDocumentsCount =
        (arrangements && arrangements.length != 0) ?
            arrangements
                .map(arrangement => arrangement.previousDocuments && arrangement.previousDocuments.length)
                .reduce((a,b) => a + b) : 0;

    return (
        <React.Fragment>
            <h1>Remote Work Arrangement</h1>

            <div id="rwa-info" className="rvt-p-tb-md">
                Please discuss remote work opportunities with your supervisor and review the&nbsp;
                <a href="https://policies.iu.edu/policies/hr-06-80-remote-work-employees/index.html"
                   target="_blank">remote work policy</a> and&nbsp;
                <a href="https://hr.iu.edu/relations/remote-work.html"
                   target="_blank">supplemental information</a> before completing this form.
            </div>

            {
                arrangements && arrangements.length > 0 ?
                    arrangements.map((arrangement, index) =>
                        <div id={`job-arrangement-` + index} key={index} className="rvt-p-bottom-md">
                            <JobArrangement arrangement={arrangement} loading={loading} createArrangement={createArrangement}
                                            renewArrangement={renewArrangement} viewArrangement={viewArrangement}/>
                        </div>
                    )
                    :
                    <InlineAlert id="no-eligible-positions-warning" variant="warning" standalone margin={{ bottom: 'md' }}>
                        This position is not eligible for a remote work arrangement. Please contact your supervisor for additional information.
                    </InlineAlert>
            }
            {
                arrangements && arrangements.length > 0 && arrangements.map((arrangement, index) =>
                    <div key={index} className="rvt-p-bottom-xs">
                        {
                            index === 0 && previousDocumentsCount > 0 &&
                            <React.Fragment>
                                <hr/>
                                <h3>Previous Arrangements</h3>
                            </React.Fragment>
                        }
                        {
                            arrangement.previousDocuments && arrangement.previousDocuments.length > 0 &&
                            <React.Fragment>
                                {arrangement.job.jobTitle} ({arrangement.job.jobDepartmentId}, Rec {arrangement.job.jobRecordNumber})
                                {
                                    arrangement.previousDocuments.map((previousDocument, index) =>
                                        <Container key={index} margin={{left: 'md'}}>
                                            <a href="#" onClick={() => viewArrangement(previousDocument.documentNumber)}>
                                                {previousDocument.status === "C" ? "Approved" : previousDocument.status} on {previousDocument.formattedCompletedTimestamp}
                                            </a>
                                        </Container>
                                    )
                                }
                            </React.Fragment>
                        }
                    </div>
                )
            }
            {
                oldArrangements && oldArrangements.length > 0 &&
                <React.Fragment>
                    <hr/>
                    <h3>Previous Arrangements from Inactive Jobs</h3>
                    {
                        oldArrangements.map((arrangement, index) =>
                            <div key={index} className="rvt-p-bottom-xs">
                                {arrangement.job.jobTitle} ({arrangement.job.jobDepartmentId}, Rec {arrangement.job.jobRecordNumber})
                                    &nbsp;
                                    <a href="#" onClick={() => viewArrangement(arrangement.documentNumber)}>
                                        {arrangement.status === "C" ? "Approved" : arrangement.status} on {arrangement.formattedCompletedTimestamp}
                                    </a>

                            </div>
                        )
                    }
                </React.Fragment>
            }
        </React.Fragment>
    )
}

const stateToProps = ({app, home}) => {
    return {
        currentUser: app.user,
        arrangements: home.arrangementOptions.arrangements,
        oldArrangements: home.arrangementOptions.oldArrangements,
        loading: home.loading,
    }
}

const dispatchToProps = (dispatch) => {
    return {
        onLoad: () => {
            dispatch(homeActions.fetchArrangementOptions)
        },
        createArrangement: (job) => {
            dispatch(homeActions.createArrangement(job))
        },
        renewArrangement: (documentNumber) => {
            dispatch(homeActions.renewArrangement(documentNumber))
        },
        viewArrangement: (documentNumber) => {
            navigate(`/arrangement/review/${documentNumber}`)
        }
    }
}

export default connect(stateToProps, dispatchToProps)(reduxForm({
    form: Forms.HOME_FORM,
})(loader(Home)))
