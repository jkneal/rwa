import React, {useEffect, useState} from 'react'
import _ from 'lodash'
import {connect} from "react-redux"
import adminActions from "../../reducers/admin"
import bulkInactivationDialog from "../../reducers/bulkInactivationDialog"
import DocumentTitle from "react-document-title"
import LookupResults from '../../components/lookup/LookupResults'
import {Field, formValueSelector, getFormValues, reduxForm, reset} from "redux-form";
import {
    ARRANGEMENT_LOOKUP_OPTIONS,
    ARRANGEMENT_LOOKUPS,
    DISPLAY_PROCESSED_STATUS_MAP,
    DISPLAY_STATUS_MAP,
    Forms,
    PROCESSED_STATUS,
    STATUS,
    STATUS_EXCLUDED
} from "../../constants";
import {PersonSelectInput, ReactSelectInput} from "../../components/form/controls";
import {Button, ButtonGroup, Checkbox, Col, Container, DismissibleAlert, Row, Select} from 'rivet-react'
import loader from "../../util/loader";
import {parseDate} from '../../util/common'
import {isAfter, isBefore} from 'date-fns'
import BulkInactivationDialog from "../../components/BulkInactivationDialog";

// ArrangementLookup doesn't use the Lookup component so it needs to import lookup.css
import '../../components/lookup/lookup.css'

const ArrangementsLookup = (props) => {
    const {
        arrangementsLoading, arrangements, clearMessage, fetchCharts, fetchOrganizations, isAdmin, message,
        openBulkInactivation, resetForm, searchParameters
    } = props
    const [arrSelected, setArrSelected] = useState([])
    useEffect(() => {
        resetForm()
        fetchCharts()
        fetchOrganizations()
    }, [])

    const resultFields = [
        {
            field: 'bulkSelect', fieldTitle: 'Bulk Select', noFilter: true, show: false,
            converter: (value, resource, csv) => {
                const { bulkSelect, rwaDocumentNumber } = resource
                if(csv || !bulkSelect) {
                    return null
                }
                return (
                    <Checkbox
                        checked={arrSelected.includes(rwaDocumentNumber)}
                        id={`arragement-${rwaDocumentNumber}`}
                        label={`Arrangement ${rwaDocumentNumber}`}
                        labelVisibility={false}
                        onClick={(e) => {
                            const checked = e.currentTarget.checked
                            const newArrSelected = checked
                                ? [...arrSelected, rwaDocumentNumber]
                                : arrSelected.filter(s => s !== rwaDocumentNumber)
                            setArrSelected(_.uniq(newArrSelected))
                        }}
                    />
                )
            }
        },
        {
            field: 'rwaDocumentNumber', fieldTitle: 'Document Number', noFilter: true,
            converter: (value, resource, csv) => csv ? value :
                <a href={'/arrangement/review/' + value} target="_blank">{value}</a>
        },
        {field: 'employeeId', fieldTitle: 'Employee Id'},
        {field: 'name', fieldTitle: 'Name'},
        {field: 'jobRecordNumber', fieldTitle: 'Job Rcd Num', noFilter: true,},
        {field: 'supervisor', fieldTitle: 'Arrangement Supervisor'},
        {field: 'currentSupervisor', fieldTitle: 'Currently Reports-To'},
        {
            field: 'responsibilityCenter', fieldTitle: 'RC', noFilter: true,
            converter: (value, resource, csv) => csv ? `${value} - ${resource.responsibilityCenterName}` : value,
                filterByValues: true},
        {field: 'jobDepartmentChart', fieldTitle: 'Chart', filterByValues: true},
        {field: 'jobDepartmentOrg', fieldTitle: 'Org', filterByValues: true},
        {field: 'remoteWorkType', fieldTitle: 'Type', filterByValues: true},
        {field: 'remoteWorkStartDate', fieldTitle: 'Start Date', translateDateFormat: true, noFilter: true},
        {field: 'remoteWorkEndDate', fieldTitle: 'End Date', translateDateFormat: true, noFilter: true},
        {field: 'processedStatus', fieldTitle: 'Status', filterByValues: true,
            converter: (value) => DISPLAY_PROCESSED_STATUS_MAP(value),
            filterDisplayConverter: (value) => DISPLAY_PROCESSED_STATUS_MAP(value)
        }
    ]

    const selectedArrangements = arrangements.filter(({ rwaDocumentNumber }) => arrSelected.includes(rwaDocumentNumber))
    const clearSelected = () => setArrSelected([])

    return (
        <div>
            <DocumentTitle title="Arrangements Lookup - Indiana University"/>
            <h1 data-cy='ArrangementsLookup-header'>Arrangements Lookup</h1>
            {
                message &&
                    <DismissibleAlert
                        id="page-alert"
                        className="rvt-m-top-xs"
                        variant={message.variant}
                        title={message.title}
                        onDismiss={clearMessage}>
                        {message.text}
                    </DismissibleAlert>
            }
            <LookupForm {...props} resetArrSelected={clearSelected} />
            {arrangementsLoading && <div className='rvt-loader'/>}
            {
                !arrangementsLoading &&
                    <LookupResults
                        className="rvt-m-top-sm results-container"
                        initialFilters={{processedStatus: PROCESSED_STATUS.ACTIVE}}
                        resources={arrangements}
                        resultFields={resultFields}
                    >
                        {
                            isAdmin &&
                                <Button
                                    className='rvt-m-left-sm'
                                    data-cy={'ArrangementsLookup-bulkInactivation'}
                                    id="bulkInactivation"
                                    disabled={_.isEmpty(selectedArrangements)}
                                    onClick={(e) => openBulkInactivation(selectedArrangements, searchParameters)}
                                >
                                    Bulk Inactivation
                                </Button>
                        }
                    </LookupResults>
            }
            <BulkInactivationDialog submitCallback={clearSelected}/>
        </div>
    )
}

function LookupForm (props) {
    const { arrangementsLoading, handleSubmit, search, resetForm, resetLookup, resetArrSelected } = props
    const [lookupSelected, setLookupSelected] = useState(ARRANGEMENT_LOOKUPS.CHARTORG)
    const handleSearch = handleSubmit(search)
    const handleReset = handleSubmit(resetForm)
    return (
        <Container size="xl" margin={{top: 'sm'}}>
            <Row className="rvt-m-bottom-sm">
                <Col columnWidth={5}/>
                <Col columnWidth={2}>
                    <Select
                        label='Select search field'
                        data-cy="searchField"
                        value={lookupSelected}
                        onChange={(e) => {
                            const value = e.target.value
                            setLookupSelected(value)
                            resetLookup()
                        }}
                    >
                        {ARRANGEMENT_LOOKUP_OPTIONS.map(({label, value}) => (
                            <option key={`option-${value}`} value={value}>{label}</option>
                        ))}
                    </Select>
                </Col>
            </Row>
            <Row className="rvt-m-bottom-sm">
                <Col columnWidth={3}/>
                <Col columnWidth={6}>
                    <hr />
                </Col>
            </Row>
            <Row id='' className="rvt-m-bottom-sm">
                <RCLookup lookupSelected={lookupSelected} {...props} />
                <ChartOrgLookup lookupSelected={lookupSelected} {...props} />
                <EmployeeLookup lookupSelected={lookupSelected} {...props} />
                <SupervisorLookup lookupSelected={lookupSelected} {...props} />
            </Row>
            <Row className="rvt-m-bottom-sm">
                <Col columnWidth={3}/>
                <Col columnWidth={6}>
                    <hr/>
                </Col>
            </Row>

            <Row>
                <Container>
                    <ButtonGroup>
                        <Button
                            data-cy='ArrangementsLookup-search'
                            id="search"
                            onClick={(e) => {
                                resetArrSelected()
                                handleSearch(e)
                            }}
                            disabled={arrangementsLoading}
                        >
                            Search
                        </Button>
                        <Button
                            data-cy='ArrangementsLookup-clear'
                            id="clear"
                            onClick={(e) => {
                                resetArrSelected()
                                handleReset(e)
                            }}
                            modifier={'secondary'}
                        >
                            Clear
                        </Button>
                    </ButtonGroup>
                </Container>
            </Row>
        </Container>
    )
}

function RCLookup (props) {
    const { lookupSelected, organizations } = props
    if (lookupSelected !== ARRANGEMENT_LOOKUPS.RC) {
        return null
    }
    return (
        <>
            <Col columnWidth={3}/>
            <Col columnWidth={1}/>
            <Col columnWidth={4}>
                <Field name={"rc"} label={"RC"} component={ReactSelectInput}
                       options={_.sortBy(_.uniqBy(organizations, 'responsibilityCenter'), 'responsibilityCenter')}
                       getOptionValue={option => option.responsibilityCenter}
                       getOptionLabel={option => (`${option.responsibilityCenter} - ${option.responsibilityCenterName}`)}
                />
            </Col>
            <Col columnWidth={1}/>
            <Col columnWidth={3}/>
        </>
    )
}

function ChartOrgLookup (props) {
    const { charts, chartSelected, lookupSelected, organizations } = props
    if (lookupSelected !== ARRANGEMENT_LOOKUPS.CHARTORG) {
        return null
    }
    return (
        <>
            <Col columnWidth={3}/>
            <Col columnWidth={3}>
                <Field name={"chart"} label={"Chart"} component={ReactSelectInput}
                       options={charts}
                       getOptionValue={option => option.value}
                       getOptionLabel={option => option.label}
                />
            </Col>
            <Col columnWidth={3}>
                <Field name={"org"} label={"Org"} component={ReactSelectInput}
                       readOnly={!chartSelected}
                       isMulti={true}
                       options={organizations.filter(organization => organization.chartCode === chartSelected)}
                       getOptionValue={option => option.code}
                       getOptionLabel={option => option.name}
                />
            </Col>
            <Col columnWidth={3}/>
        </>
    )
}

function EmployeeLookup (props) {
    const { lookupSelected } = props
    if (lookupSelected !== ARRANGEMENT_LOOKUPS.EMPLOYEE) {
        return null
    }
    return (
        <>
            <Col columnWidth={3}/>
            <Col columnWidth={1}/>
            <Col columnWidth={4}>
                <Field
                    name="employeeId"
                    label="Employee"
                    data-cy="employeeId"
                    component={PersonSelectInput}
                    placeholder='Last name or username'
                />
            </Col>
            <Col columnWidth={1}/>
            <Col columnWidth={3}/>
        </>
    )
}

function SupervisorLookup (props) {
    const { lookupSelected } = props
    if (lookupSelected !== ARRANGEMENT_LOOKUPS.SUPERVISOR) {
        return null
    }
    return (
        <>
            <Col columnWidth={3}/>
            <Col columnWidth={3}>
                <Field name="supervisorId"
                       label="Arrangement Supervisor"
                       data-cy="supervisorId"
                       component={PersonSelectInput}
                       placeholder='Last name or username'
                />
            </Col>
            <Col columnWidth={3}>
                <Field name="currentSupervisorId"
                       label="Current Reports-To"
                       data-cy="currentSupervisorId"
                       component={PersonSelectInput}
                       placeholder='Last name or username'
                />
            </Col>
        </>
    )
}

export const selector = formValueSelector(Forms.ARRANGEMENTS_LOOKUP_FORM);

const stateToProps = (state) => {
    const isAdmin = state.app.user.admin
    const filteredArrangements = state.admin.arrangements.filter(({ status }) => !STATUS_EXCLUDED.includes(status))
    const processedArrangements = filteredArrangements.map(arrangement => {
        const processedStatus = processStatus(arrangement)
        return {
            bulkSelect: processedStatus === PROCESSED_STATUS.ACTIVE && isAdmin,
            processedStatus,
            ...arrangement
        }
    })
    const formValues = getFormValues(Forms.ARRANGEMENTS_LOOKUP_FORM)(state) || {}
    return {
        isAdmin,
        charts: state.admin.charts,
        organizations: state.admin.organizations,
        arrangementsLoading: state.admin.arrangementsLoading,
        arrangements: processedArrangements,
        riceUrl: state.app.env.riceUrl,
        chartSelected: selector(state, 'chart.value'),
        rcSelected: selector(state, 'rc.value'),
        message: state.admin.message,
        searchParameters: processSearchParameters(formValues)
    }
}

const dispatchToProps = (dispatch) => {
    return {
        fetchCharts: () => dispatch(adminActions.fetchCharts()),
        fetchOrganizations: () => dispatch(adminActions.fetchOrganizations()),
        search: (form) => {
            const searchParameters = processSearchParameters(form)
            dispatch(adminActions.searchArrangements(searchParameters))
        },
        resetForm: () => {
            dispatch(reset(Forms.ARRANGEMENTS_LOOKUP_FORM))
            dispatch(adminActions.reset())
        },
        openBulkInactivation: (arrangements, searchParameters) => {
            dispatch(bulkInactivationDialog.openDialog({ arrangements, searchParameters }))
        },
        resetLookup: () => {
            dispatch(reset(Forms.ARRANGEMENTS_LOOKUP_FORM))
        },
        clearMessage: () => dispatch(adminActions.clearMessage()),
    }
}

function processSearchParameters (form) {
    return {
        ...form,
        chartCode: form.chart ? form.chart.value : null,
        orgCode: form.org ? form.org.map(org => org.code)  : null,
        rcCode: form.rc ? form.rc.responsibilityCenter : null,
        searchResultLimit: 500,
        employeeId: form.employeeId ? form.employeeId.networkId : null,
        supervisorId: form.supervisorId ? form.supervisorId.networkId : null,
        currentSupervisorId: form.currentSupervisorId ? form.currentSupervisorId.networkId : null,
    }
}

function processStatus(arrangement) {
    const { remoteWorkEndDate, remoteWorkStartDate, status } = arrangement
    if (status === STATUS.ENROUTE) {
        return PROCESSED_STATUS.PENDING
    }
    if (status === STATUS.APPROVED && !isBefore(new Date(), parseDate(remoteWorkStartDate))
        && (!remoteWorkEndDate || isAfter(parseDate(remoteWorkEndDate), new Date()))) {
        return PROCESSED_STATUS.ACTIVE

    }
    return PROCESSED_STATUS.INACTIVE

    return DISPLAY_STATUS_MAP[status]
}

export default connect(stateToProps, dispatchToProps)(reduxForm({
    form: Forms.ARRANGEMENTS_LOOKUP_FORM,
    touchOnChange: true,
    enableReinitialize: true
})(loader(ArrangementsLookup)))
