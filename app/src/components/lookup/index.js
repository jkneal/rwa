import React, {useEffect} from 'react'
import {connect} from "react-redux"
import DocumentTitle from 'react-document-title'
import {Tooltip} from 'react-tooltip'
import {Button, ButtonGroup, Col, Row} from 'rivet-react'
import LookupResults from './LookupResults'
import actions from '../../reducers/lookup'
import {useNavigate} from 'react-router-dom'
import useRouteLeave from '../useRouteLeave'

import './lookup.css'
import 'react-tooltip/dist/react-tooltip.css'

const Lookup = ({name, description, defaultShowFilters, SearchForm, resources, resultFields, sortableFields = true,
                    onReturn, onReturnResults, actionLinkGenerator, dispatch, defaultSortField, filterBy, loading, displayResults,
                    resultLimit, searchFormProps = {}, showHeader = true, fetchAllUrl, onLoad, resetLookup, excelExporter,
                    defaultUsePaging, defaultSortDirection}) => {

    const navigate = useNavigate();
    const navigateToPage = (url) => navigate(url);

    useRouteLeave(resetLookup)

    useEffect(() => {
        onLoad()
    }, [fetchAllUrl])

    return (
        <div>
            <DocumentTitle title={`${name} - Remote Work Arrangement Indiana University`}/>
            <div>
                <LookupHeader name={name} description={description} SearchForm={SearchForm}
                              searchFormProps={searchFormProps} showHeader={showHeader}/>
                {
                    !loading && displayResults &&
                    <LookupResults resources={resources} defaultShowFilters={defaultShowFilters}
                                   resultFields={resultFields} sortableFields={sortableFields} onReturn={onReturn} onReturnResults={onReturnResults} actionLinkGenerator={actionLinkGenerator}
                                   defaultSortField={defaultSortField} navigateToPage={navigateToPage} dispatch={dispatch} filterBy={filterBy}
                                   resultLimit={resultLimit} excelExporter={excelExporter}
                                   defaultUsePaging={defaultUsePaging} defaultSortDirection={defaultSortDirection}
                    />
                }
                <Tooltip place="top" type="dark" effect="solid"/>
                {onReturn &&
                    <ButtonGroup padding={{ top: 'sm' }}>
                        <Button onClick={() => onReturn()} modifier="secondary">Cancel</Button>
                    </ButtonGroup>
                }
            </div>
        </div>
    )
}

const LookupHeader = ({name, description, loading, SearchForm, searchFormProps, showHeader}) => (
    <Row className="sectionHead">
        <Col>
            {showHeader && <h2 className="resourceName">{name}</h2>}
            <div className="rvt-ts-14">{description}</div>
            {loading && <div className="rvt-loader" aria-label="Content loading"></div>}
            {SearchForm && <SearchForm {...searchFormProps}/>}
        </Col>
    </Row>
)

export const mapStateToProps = ({ lookup: { loading, resources, displayResults, filterBy } }) => {
    return {
        loading,
        resources: resources,
        displayResults,
        filterBy: filterBy
    }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onLoad: (filterBy) => {
            let fetchAllUrl = ownProps.fetchAllUrl;

            // If the results for this lookup need to be filtered (example, filtering buildings by campus code)
            if (filterBy) {
                for (const filter in filterBy) {
                    if (filterBy[filter]) {
                        fetchAllUrl += filter + '/' + filterBy[filter] + '/'
                    }
                }
            }

            if (fetchAllUrl) {
                dispatch(actions.fetchAll(fetchAllUrl,null, ownProps.fetchCallback))
            } else if (!ownProps.keepResultsOnLoad) {
                dispatch(actions.resetLookup())
            }
        },
        resetLookup: () => dispatch(actions.resetLookup()),
        dispatch: dispatch
    }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return {
        ...stateProps,
        ...dispatchProps,
        ...ownProps,
        onLoad: () => { dispatchProps.onLoad(stateProps.filterBy) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Lookup)
