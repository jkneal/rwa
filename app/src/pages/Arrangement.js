import React, {Component} from 'react'
import {connect} from "react-redux"
import {change, Field, formValueSelector, getFormSyncErrors, reduxForm, touch, untouch} from 'redux-form'
import {Button, ButtonGroup, Col, Dialog, DialogBody, DialogControls, Row} from 'rivet-react'
import DocumentTitle from 'react-document-title'
import loader from '../util/loader'
import {
    attestationCheckBoxRequired,
    formatDate,
    formatTime,
    Loading,
    maxLengthCity,
    maxLengthRemoteWorkReason,
    maxLengthStreetAddressLines,
    maxLengthZipCode,
    parseDate,
    parseTime,
    remoteDaySelectionsCheckBoxGroupRequired,
    remoteWorkStartDateLessThanEndDate,
    required
} from '../util/common'
import {
    ARRANGEMENT_FIELDS,
    DISTANCE_IU_CAMPUS_OPTIONS,
    Forms,
    IMS_JOB_FULL_TIME_INDICATOR,
    REMOTE_DAYS_OPTIONS,
    REMOTE_WORK_TYPE_OPTIONS,
    STUDENT_FACING_PERCENTAGE_OPTIONS,
    TaxDisclaimer,
    WORK_ADDRESS_HOME_OPTIONS,
    WORK_DAYS_TYPE_OPTIONS
} from '../constants'
import {
    Checkbox,
    DateInput,
    Input,
    PersonSelectInput,
    RadioGroup,
    Select,
    Textarea,
    TimeInput,
} from '../components/form/controls'
import arrangementActions from '../reducers/arrangement'
import addressActions from '../reducers/address'
import CheckboxGroup from "../components/form/CheckboxGroup"
import {noop} from "lodash/util"
import {navigate} from '../App'
import {setHours, setMinutes} from 'date-fns'
import {AttestationTextList} from "../components/AttestationTextList";

const getRowId = fieldName => fieldName + "-container"

const AddressSection = ({stateSelectOptions, countrySelectOptions, countrySelected, setFormValue}) => {
    return <>
        <Row className={"rvt-m-top-lg"}>
            <Col><h3>Remote Work Address</h3></Col>
        </Row>
        <Row className={"rvt-m-top-xs"} id={getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_LINE_1)}>
            <Col columnWidth={5}>
                <Field
                    name={ARRANGEMENT_FIELDS.WORK_ADDRESS_LINE_1}
                    component={Input}
                    label={"Street Address Line 1"}
                    required={true}
                    validate={[required, maxLengthStreetAddressLines]}
                    maxLength={"100"}
                />
            </Col>
        </Row>
        <Row className={"rvt-m-top-xs"} id={getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_LINE_2)}>
            <Col columnWidth={5}>
                <Field
                    name={ARRANGEMENT_FIELDS.WORK_ADDRESS_LINE_2}
                    component={Input}
                    label={"Street Address Line 2"}
                    validate={[maxLengthStreetAddressLines]}
                    maxLength={"100"}
                />
            </Col>
        </Row>
        <Row className={"rvt-m-top-xs"} id={getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_CITY)}>
            <Col columnWidth={2}>
                <Field
                    name={ARRANGEMENT_FIELDS.WORK_ADDRESS_CITY}
                    component={Input}
                    label={"City"}
                    required={true}
                    validate={[required, maxLengthCity]}
                    maxLength={"55"}
                />
            </Col>
            <Col columnWidth={2}>
                <Field
                    name={ARRANGEMENT_FIELDS.WORK_ADDRESS_STATE}
                    component={Select}
                    label={"State"}
                    options={stateSelectOptions}
                    required={countrySelected === "US"}
                    validate={[countrySelected === "US" ? required : noop]}
                    disabled={countrySelected !== "US"}
                />
            </Col>
        </Row>
        <Row className={"rvt-m-top-xs rvt-m-bottom-xl"} id={getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_COUNTRY)}>
            <Col columnWidth={2}>
                <Field
                    name={ARRANGEMENT_FIELDS.WORK_ADDRESS_COUNTRY}
                    component={Select}
                    label={"Country"}
                    options={countrySelectOptions}
                    onChange={() => {
                        setFormValue(ARRANGEMENT_FIELDS.WORK_ADDRESS_STATE, null)
                    }}
                    required={true}
                    validate={[required]}
                />
            </Col>
            <Col columnWidth={2}>
                <Field
                    name={ARRANGEMENT_FIELDS.WORK_ADDRESS_ZIP}
                    component={Input}
                    label={"Zip Code"}
                    required={true}
                    validate={[required, maxLengthZipCode]}
                    maxLength={"12"}
                />
            </Col>
        </Row>
    </>
}

const HybridSection = ({workDaysType, setFormValue, touch}) => {
    return <>
        <Row className="rvt-m-top-lg" id={getRowId(ARRANGEMENT_FIELDS.WORK_DAYS_TYPE)}>
            <Col columnWidth={6}>
                <Field name={ARRANGEMENT_FIELDS.WORK_DAYS_TYPE}
                       fieldLabel="Will your remote days be fixed or floating?"
                       component={RadioGroup}
                       helpTextTitle="Definition of fixed and floating"
                       helpText={<span><b>Fixed:</b> The same remote workdays each week.<br/><b>Floating:</b> The remote workdays vary week to week.</span>}
                       onChange={(e, newValue) => {
                           if (newValue === "FLOATING") {
                               _.forEach(REMOTE_DAYS_OPTIONS, option => {
                                   setFormValue(option.name, false)
                               })
                           } else if (newValue === "FIXED") {
                               setFormValue(ARRANGEMENT_FIELDS.FLOATING_NUMBER_OF_DAYS, null)
                           }
                       }}
                       options={WORK_DAYS_TYPE_OPTIONS}
                       required={true}
                       validate={[required]}
                />
            </Col>
        </Row>

        {workDaysType === "FIXED" ?
            <Row className="rvt-m-top-lg" id={getRowId(ARRANGEMENT_FIELDS.REMOTE_DAY_SELECTIONS)}>
                <Col>
                    <Field
                        name={ARRANGEMENT_FIELDS.REMOTE_DAY_SELECTIONS}
                        component={CheckboxGroup}
                        fieldLabel={"Select the days you will be working remotely"}
                        checkboxOnChange={() => { touch(ARRANGEMENT_FIELDS.REMOTE_DAY_SELECTIONS) }}
                        required={true}
                        validate={[remoteDaySelectionsCheckBoxGroupRequired]}
                        options={REMOTE_DAYS_OPTIONS}
                    />
                </Col>
            </Row>
            :
            (workDaysType === "FLOATING") ?
                <Row className="rvt-m-top-lg" id={getRowId(ARRANGEMENT_FIELDS.FLOATING_NUMBER_OF_DAYS)}>
                    <Col columnWidth={3}>
                        <Field
                            name={ARRANGEMENT_FIELDS.FLOATING_NUMBER_OF_DAYS}
                            component={Select}
                            label={"Number of days working remotely"}
                            options={[1, 2, 3, 4, 5, 6, 7].map(e => ({ value: e, label: e }))}
                            required={true}
                            validate={[required]}
                        />
                    </Col>
                </Row>
                :
                <></>
        }
    </>
}

class Arrangement extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (!this.props.arrangementDoc) {
            this.props.navigateToPage('/')
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.scrollErrorsIntoView()
    }

    scrollErrorsIntoView() {
        if (this.props.submitClicked) {
            if (this.props.formSyncErrors.remoteWorkStartDate) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.REMOTE_WORK_START_DATE)))
            } else if (this.props.formSyncErrors.workAddressHome) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_HOME)))
            } else if (this.props.formSyncErrors.workAddressLine1) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_LINE_1)))
            } else if (this.props.formSyncErrors.workAddressCity || this.props.formSyncErrors.workAddressState) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_CITY)))
            } else if (this.props.formSyncErrors.workAddressCountry || this.props.formSyncErrors.workAddressZip) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_COUNTRY)))
            } else if (this.props.formSyncErrors.distanceIuCampus) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.DISTANCE_IU_CAMPUS)))
            } else if (this.props.formSyncErrors.remoteWorkType) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.REMOTE_WORK_TYPE)))
            } else if (this.props.formSyncErrors.arrangementWorkDays && this.props.formSyncErrors.arrangementWorkDays.workDaysType) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.WORK_DAYS_TYPE)))
            } else if (this.props.formSyncErrors.arrangementWorkDays && this.props.formSyncErrors.arrangementWorkDays.remoteDaySelections) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.REMOTE_DAY_SELECTIONS)))
            } else if (this.props.formSyncErrors.arrangementWorkDays && this.props.formSyncErrors.arrangementWorkDays.floatingNumberOfDays) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.FLOATING_NUMBER_OF_DAYS)))
            } else if (this.props.formSyncErrors.arrangementWorkDays &&
                (this.props.formSyncErrors.arrangementWorkDays.coreHoursStartTime || this.props.formSyncErrors.arrangementWorkDays.coreHoursEndTime)) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.CORE_HOURS_START_TIME)))
            } else if (this.props.formSyncErrors.supervisorReviewerId) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.SUPERVISOR_REVIEWER_ID)))
            } else if (this.props.formSyncErrors.attestationAcknowledged) {
                this.scrollToId((getRowId(ARRANGEMENT_FIELDS.ATTESTATION_ACKNOWLEDGED)))
            }
            this.props.unsetSubmitClicked() // submitClicked will be reset to true when user clicks Submit the next time
        }
    }

    scrollToId(id) {
        document.getElementById(id).scrollIntoView({behavior: "smooth"})
    }

    render() {
        const { arrangementDoc, handleSubmit, onSubmit, workDaysType, remoteWorkType, workAddressHome, states, countries, setFormValue, touch, untouch, countrySelected,
                attestationText, isSubmitting, navigateToPage, showCancelDialog, hideCancelDialog, shouldShowCancelDialog, rwaUrl, supervisor } = this.props

        const stateSelectOptions = _.map(states, ({postalStateCode, postalStateName}) => ({value: postalStateCode, label: `${postalStateName} (${postalStateCode})`}))
        const countrySelectOptions = _.map(countries, ({postalCountryCode, postalCountryName}) => ({value: postalCountryCode, label: `${postalCountryName} (${postalCountryCode})`}))

        if (!arrangementDoc || isSubmitting) {
            return <Loading />
        }

        const { jobFullPartTimeIndicator } = arrangementDoc.job
        return (
            <div>
                <DocumentTitle title="Remote Work Arrangement Form - Indiana University"/>

                <h1 className="rvt-m-bottom-xs">Remote Work Arrangement Form</h1>

                <Row>
                    <Col><h3 className="rvt-ts-14 rvt-m-bottom-sm">* indicates a required field</h3></Col>
                </Row>

                <h4 id="employee-header" className="rvt-m-bottom-md">{arrangementDoc.employee.firstName} {arrangementDoc.employee.lastName}, {arrangementDoc.job.jobTitle}</h4>

                <form onSubmit={e => e.preventDefault()}>
                    <Row className="rvt-m-bottom-sm" id={getRowId(ARRANGEMENT_FIELDS.REMOTE_WORK_START_DATE)}>
                        <Col columnWidth={2} className={"date-fixed-min-width"}>
                            <Field name={ARRANGEMENT_FIELDS.REMOTE_WORK_START_DATE}
                                   label="Remote Work Start Date"
                                   component={DateInput}
                                   required={true}
                                   validate={[required, remoteWorkStartDateLessThanEndDate]}
                            />
                        </Col>
                        <Col columnWidth={2} className={"date-fixed-min-width"}>
                            <Field name={ARRANGEMENT_FIELDS.REMOTE_WORK_END_DATE}
                                   label="Remote Work End Date"
                                   component={DateInput}
                                   required={false}
                            />
                        </Col>
                    </Row>

                    <Row className="rvt-m-top-lg" id={getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_HOME)}>
                        <Col columnWidth={6}>
                            <Field
                                name={ARRANGEMENT_FIELDS.WORK_ADDRESS_HOME}
                                fieldLabel={"Will you be working from your home?"}
                                subLabel="Completion of this form does not automatically change tax withholdings."
                                helpTextTitle="Additional details"
                                helpText={TaxDisclaimer}
                                component={RadioGroup}
                                onChange={(e, newVal) => {
                                    if (newVal === "YES") {
                                        setFormValue(ARRANGEMENT_FIELDS.WORK_ADDRESS_LINE_1, null)
                                        setFormValue(ARRANGEMENT_FIELDS.WORK_ADDRESS_LINE_2, null)
                                        setFormValue(ARRANGEMENT_FIELDS.WORK_ADDRESS_CITY, null)
                                        setFormValue(ARRANGEMENT_FIELDS.WORK_ADDRESS_ZIP, null)
                                    }
                                }}
                                options={WORK_ADDRESS_HOME_OPTIONS}
                            />
                        </Col>

                    </Row>

                    {
                        workAddressHome === "NO" &&
                        <AddressSection
                            stateSelectOptions={stateSelectOptions}
                            countrySelectOptions={countrySelectOptions}
                            countrySelected={countrySelected}
                            setFormValue={setFormValue}
                        />
                    }

                    {
                        workAddressHome === "YES" &&
                        <Row className={"rvt-m-top-sm rvt-m-bottom-xl"} id={getRowId(ARRANGEMENT_FIELDS.WORK_ADDRESS_COUNTRY)}>
                            <Col columnWidth={3} className={"country-fixed-min-width"}>
                                <Field
                                    name={ARRANGEMENT_FIELDS.WORK_ADDRESS_COUNTRY}
                                    component={Select}
                                    label={"Country You Are Working From"}
                                    options={countrySelectOptions}
                                    onChange={(e) => {
                                        setFormValue(ARRANGEMENT_FIELDS.WORK_ADDRESS_STATE, e.target.value === 'US' ? 'IN' : null)
                                    }}
                                    required={true}
                                    validate={[required]}
                                />
                            </Col>
                            <Col columnWidth={3} className={"state-fixed-min-width"} >
                                <Field
                                    name={ARRANGEMENT_FIELDS.WORK_ADDRESS_STATE}
                                    component={Select}
                                    label={"State You Are Working From"}
                                    options={stateSelectOptions}
                                    required={countrySelected === "US"}
                                    validate={[countrySelected === "US" ? required : noop]}
                                    disabled={countrySelected !== "US"}
                                />
                            </Col>
                        </Row>
                    }

                    <Row className="rvt-m-top-lg" id={getRowId(ARRANGEMENT_FIELDS.DISTANCE_IU_CAMPUS)}>
                        <Col columnWidth={6}>
                            <Field
                                name={ARRANGEMENT_FIELDS.DISTANCE_IU_CAMPUS}
                                fieldLabel={"Will you be working remotely from a place that is within 30 miles of an IU campus?"}
                                component={RadioGroup}
                                options={DISTANCE_IU_CAMPUS_OPTIONS}
                                required={true}
                                validate={[required]}
                            />
                        </Col>

                    </Row>

                    <Row className="rvt-m-top-lg" id={getRowId(ARRANGEMENT_FIELDS.REMOTE_WORK_TYPE)}>
                        <Col columnWidth={6}>
                            <Field name={ARRANGEMENT_FIELDS.REMOTE_WORK_TYPE}
                                   fieldLabel="Please select a work type"
                                   component={RadioGroup}
                                   helpTextTitle="Explanation of work types"
                                   helpText={<span><b>Hybrid:</b> Working a combination at a remote location (such as an employee’s home) and on-campus.<br/><b>Fully Remote:</b> Working in whole at a remote location (such as an employee’s home). Infrequent visits to campus may be required.</span>}
                                   onChange={(e, newVal) => {
                                       if (newVal === "FULLY_REMOTE") {
                                           setFormValue(ARRANGEMENT_FIELDS.WORK_DAYS_TYPE, null)
                                           setFormValue(ARRANGEMENT_FIELDS.FLOATING_NUMBER_OF_DAYS, null)
                                           _.forEach(REMOTE_DAYS_OPTIONS, option => {
                                               setFormValue(option.name, null)
                                           })
                                           untouch(ARRANGEMENT_FIELDS.REMOTE_DAY_SELECTIONS) // treat field as fresh when it re-appears next time
                                       }
                                   }}
                                   options={REMOTE_WORK_TYPE_OPTIONS}
                                   required={true}
                                   validate={[required]}/>
                        </Col>
                    </Row>

                    {
                        remoteWorkType === "HYBRID" &&
                        <HybridSection
                            workDaysType={workDaysType}
                            setFormValue={setFormValue}
                            touch={touch}
                        />
                    }

                    <br/>
                    <Row className="rvt-m-top-sm" id={getRowId(ARRANGEMENT_FIELDS.CORE_HOURS_START_TIME)}>
                        <Col>
                            <Row>
                                <Col><div className='rvt-label'>Expected Core Work Hours</div></Col>
                            </Row>
                            <Row>
                                <Col><span className={"rvt-ts-12"}>Core hours are on Eastern Standard Time</span></Col>
                            </Row>
                            <Row margin={{top: 'xxs'}} >
                                <Col columnWidth={2} className={"time-fixed-min-width"}>
                                    <Field name={ARRANGEMENT_FIELDS.CORE_HOURS_START_TIME}
                                           label="Start Time"
                                           openToDate={setMinutes(setHours(new Date, 8), 0)}
                                           component={TimeInput}
                                           required={true}
                                           validate={[required]}
                                    />
                                </Col>
                                <Col columnWidth={2} className={"time-fixed-min-width"}>
                                    <Field name={ARRANGEMENT_FIELDS.CORE_HOURS_END_TIME}
                                           label="End Time"
                                           openToDate={setMinutes(setHours(new Date, 17), 0)}
                                           component={TimeInput}
                                           required={true}
                                           validate={[required]}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row className="rvt-m-top-lg">
                        <Col>
                            <h3>Reason for Remote Work</h3>
                        </Col>
                    </Row>

                    <Row className="rvt-m-top-xs">
                        <Col columnWidth={5}>
                            <div className="rvt-ts-14">The primary objective is to ensure that the fundamental in-person character of Indiana University is maintained while seeking a balance of in-person, hybrid, and remote work arrangements. This balance must ensure that the needs of the university's constituents, especially students, are fully met and that the work of the university is performed orderly, effectively, and efficiently.</div>
                        </Col>
                    </Row>

                    <Row className="rvt-m-top-md">
                        <Col columnWidth={5}>
                            <Field
                                name={ARRANGEMENT_FIELDS.STUDENT_FACING_PERCENTAGE}
                                component={Select}
                                label={"What percentage of your work is student-facing or requires on-campus support of others?"}
                                options={STUDENT_FACING_PERCENTAGE_OPTIONS}
                                required={true}
                                validate={[required]}
                                note={"Provide in 20% increments"}
                            />
                        </Col>
                    </Row>

                    <Row className="rvt-m-top-md">
                        <Col columnWidth={5}>
                            <div className="rvt-ts-14">Based on your role, please provide a business justification for your required remote or hybrid and explain how you will continue to perform your role at the level of productivity, efficiency, and professionalism as if you were in person.</div>
                            <div className="rvt-ts-14 rvt-m-top-xs">Reason should not exceed 4000 characters</div>
                            <Field
                                id={ARRANGEMENT_FIELDS.REASON}
                                name={ARRANGEMENT_FIELDS.REASON}
                                label={ARRANGEMENT_FIELDS.REASON}
                                className={"no-label"}
                                component={Textarea}
                                validate={[maxLengthRemoteWorkReason]}
                                maxLength={"4000"}
                            />
                        </Col>
                    </Row>

                    <Row className="rvt-m-top-lg" id={getRowId(ARRANGEMENT_FIELDS.SUPERVISOR_REVIEWER_ID)}>
                        <Col columnWidth={4}>
                            <Field
                                name={ARRANGEMENT_FIELDS.SUPERVISOR_REVIEWER_ID}
                                label="Who is your direct supervisor?"
                                id="supervisor"
                                component={PersonSelectInput}
                                required={true}
                                validate={[required]}
                                defaultValue={
                                    supervisor ?
                                        {
                                            value: supervisor ? supervisor.networkId : null,
                                            label: supervisor ? supervisor.lastName + ", " + supervisor.firstName + " (" + supervisor.networkId + ")" : null
                                        }
                                        :
                                        undefined
                                }
                                readOnly={jobFullPartTimeIndicator === IMS_JOB_FULL_TIME_INDICATOR}
                            />
                        </Col>
                    </Row>

                    <Row className="rvt-m-top-xl">
                        <Col>
                            <Row id={getRowId(ARRANGEMENT_FIELDS.ATTESTATION_ACKNOWLEDGED)}>
                                <Col><h3>Acknowledgements</h3></Col>
                            </Row>
                            <Row className="rvt-m-top-xs">
                                <Col>
                                    <Field
                                        name={ARRANGEMENT_FIELDS.ATTESTATION_ACKNOWLEDGED}
                                        component={Checkbox}
                                        label={"Agreement"}
                                        required={true}
                                        validate={[attestationCheckBoxRequired]}
                                        onChange={() => {
                                            touch(ARRANGEMENT_FIELDS.ATTESTATION_ACKNOWLEDGED)
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className="rvt-m-top-xs">
                                <Col columnWidth={8}>
                                    <AttestationTextList text={attestationText}/>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row className="rvt-m-top-lg">
                        <Col>
                            <ButtonGroup>
                                <Button id="submit" onClick={handleSubmit(form => onSubmit(arrangementDoc, form))}>Submit</Button>
                                <Button id="cancel"
                                    onClick={e => {
                                        e.preventDefault()
                                        showCancelDialog()
                                    }}
                                    modifier="secondary">
                                    Cancel
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>

                    <Dialog
                        isOpen={shouldShowCancelDialog}
                        title={"Confirm"}
                        onDismiss={e => {
                            e.preventDefault()
                            hideCancelDialog()
                        }}>
                        <DialogBody>
                            <p>Are you sure to want to cancel this Arrangement request?</p>
                        </DialogBody>
                        <DialogControls>
                            <Button key="ok" onClick={e => {
                                e.preventDefault()
                                hideCancelDialog()
                                navigateToPage("/")
                            }}>OK</Button>
                            <Button key="close" onClick={e => {
                                e.preventDefault()
                                hideCancelDialog()
                            }}>Close</Button>
                        </DialogControls>
                    </Dialog>
                </form>
            </div>
        )
    }
}

const stateToProps = (state) => {
    const selector = formValueSelector(Forms.ARRANGEMENT_FORM)

    const formatValuesForForm = values => {
        if (!values) {
            return null
        }

        const formValues = _.cloneDeep(values)
        formValues.workAddressHome = formValues.formattedWorkAddressHome
        if (!(formValues.remoteWorkStartDate instanceof Date)) {
            formValues.remoteWorkStartDate = parseDate(formValues.remoteWorkStartDate)
        }
        if (!(formValues.remoteWorkEndDate instanceof Date)) {
            formValues.remoteWorkEndDate = parseDate(formValues.remoteWorkEndDate)
        }
        if (formValues.arrangementWorkDays) {
            if (!(formValues.arrangementWorkDays.coreHoursStartTime instanceof Date)) {
                formValues.arrangementWorkDays.coreHoursStartTime = parseTime(formValues.arrangementWorkDays.coreHoursStartTime)
            }
            if (!(formValues.arrangementWorkDays.coreHoursEndTime instanceof Date)) {
                formValues.arrangementWorkDays.coreHoursEndTime = parseTime(formValues.arrangementWorkDays.coreHoursEndTime)
            }
        }

        if (!formValues.workAddressCountry) {
            formValues.workAddressCountry = "US"
        }
        if (formValues.workAddressCountry === "US" && !formValues.workAddressState) {
            formValues.workAddressState = "IN"
        }

        return formValues
    }

    const arrangementDoc = state.arrangement.doc

    return {
        arrangementDoc,
        initialValues: formatValuesForForm(arrangementDoc),
        attestationText: arrangementDoc && arrangementDoc.attestationText ? arrangementDoc.attestationText.text : null,
        workDaysType: selector(state, ARRANGEMENT_FIELDS.WORK_DAYS_TYPE),
        workAddressHome: selector(state, ARRANGEMENT_FIELDS.WORK_ADDRESS_HOME),
        remoteWorkType: selector(state, ARRANGEMENT_FIELDS.REMOTE_WORK_TYPE),
        states: state.address.states,
        countries: state.address.countries,
        countrySelected: selector(state, ARRANGEMENT_FIELDS.WORK_ADDRESS_COUNTRY),
        isSubmitting: state.arrangement.isSubmitting,
        shouldShowCancelDialog: state.arrangement.shouldShowCancelDialog,
        formSyncErrors: getFormSyncErrors(Forms.ARRANGEMENT_FORM)(state),
        submitClicked: state.arrangement.submitClicked,
        rwaUrl: state.app.env.rwaUrl,
        supervisor: arrangementDoc ? arrangementDoc.supervisor : null
    }
}

const dispatchToProps = (dispatch, ownProps) => {
    return {
        onLoad: () => {
            dispatch(addressActions.fetchCountries())
            dispatch(addressActions.fetchStates())
        },
        onSubmit: (arrangementDoc, form) => {
            const values = _.cloneDeep(form)
            values.documentNumber = arrangementDoc.documentNumber
            values.job = arrangementDoc.job
            values.workAddressHome = values.workAddressHome === "YES"
            values.remoteWorkStartDate = formatDate(values.remoteWorkStartDate)
            if (!!values.remoteWorkEndDate) {
                values.remoteWorkEndDate = formatDate(values.remoteWorkEndDate)
            }
            values.distanceIuCampus = values.distanceIuCampus === "YES"
            values.arrangementWorkDays.documentNumber = arrangementDoc.documentNumber
            values.arrangementWorkDays.coreHoursStartTime = formatTime(values.arrangementWorkDays.coreHoursStartTime)
            values.arrangementWorkDays.coreHoursEndTime = formatTime(values.arrangementWorkDays.coreHoursEndTime)
            values.supervisorReviewerId = values.supervisor.networkId

            dispatch(arrangementActions.submitArrangement(values))
        },
        setFormValue: (field, value) => {
            dispatch(change(Forms.ARRANGEMENT_FORM, field, value))
        },
        touch: (field) => {
            dispatch(touch(Forms.ARRANGEMENT_FORM, field))
        },
        untouch: (field) => {
            dispatch(untouch(Forms.ARRANGEMENT_FORM, field))
        },
        navigateToPage: (path) => {
            navigate(path)
        },
        showCancelDialog: () => {
            dispatch(arrangementActions.showCancelDialog())
        },
        hideCancelDialog: () => {
            dispatch(arrangementActions.hideCancelDialog())
        },
        setSubmitClicked: () => {
            dispatch(arrangementActions.setSubmitClicked())
        },
        unsetSubmitClicked: () => {
            dispatch(arrangementActions.unsetSubmitClicked())
        }
    }
}

export default connect(stateToProps, dispatchToProps)(reduxForm({
    form: Forms.ARRANGEMENT_FORM,
    touchOnChange: true,
    enableReinitialize: true
})(loader(Arrangement)))
