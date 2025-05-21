export const REMOTE_WORK_TYPE_OPTIONS = {
    'HYBRID': 'Hybrid',
    'FULLY_REMOTE': 'Fully remote'
}

export const WORK_ADDRESS_HOME_OPTIONS = {
    'YES': 'Yes',
    'NO': 'No'
}

export const DISTANCE_IU_CAMPUS_OPTIONS = {
    'YES': 'Yes',
    'NO': 'No'
}

export const STUDENT_FACING_PERCENTAGE_OPTIONS = [
    { value: 0, label: '0%' },
    { value: 20, label: '20%' },
    { value: 40, label: '40%' },
    { value: 60, label: '60%' },
    { value: 80, label: '80%' },
    { value: 100, label: '100%' }
]

export const WORK_DAYS_TYPE_OPTIONS = {
    'FIXED': 'Fixed',
    'FLOATING': 'Floating'
}

export const STATUS = {
    APPROVED: 'C',
    DISAPPROVED: 'A',
    ENROUTE: 'R',
    ERROR: 'S',
    PREROUTE: 'P'
}

export const STATUS_EXCLUDED = [
    STATUS.DISAPPROVED,
    STATUS.ERROR
]

export const DISPLAY_STATUS_MAP = {
    'A': 'DISAPPROVED',
    'C': 'APPROVED',
    'R': 'ENROUTE',
    'S': 'ERROR',
    'P': 'PREROUTE'
}

export const PROCESSED_STATUS = {
    ACTIVE: 'A',
    INACTIVE: 'I',
    PENDING: 'P'
}

export const DISPLAY_PROCESSED_STATUS_MAP = (status) => {
    switch(status) {
        case PROCESSED_STATUS.ACTIVE:
            return 'Active'
        case PROCESSED_STATUS.INACTIVE:
            return 'Inactive'
        case PROCESSED_STATUS.PENDING:
            return 'Pending'
        default:
            return status
    }
}

export const ARRANGEMENT_FIELDS = {
    WORK_DAYS_TYPE: "arrangementWorkDays.workDaysType",
    REMOTE_DAY_SELECTIONS: "arrangementWorkDays.remoteDaySelections",
    CORE_HOURS_START_TIME: "arrangementWorkDays.coreHoursStartTime",
    CORE_HOURS_END_TIME: "arrangementWorkDays.coreHoursEndTime",
    FLOATING_NUMBER_OF_DAYS: "arrangementWorkDays.floatingNumberOfDays",
    FIXED_MONDAY: "arrangementWorkDays.fixedMonday",
    FIXED_TUESDAY: "arrangementWorkDays.fixedTuesday",
    FIXED_WEDNESDAY: "arrangementWorkDays.fixedWednesday",
    FIXED_THURSDAY: "arrangementWorkDays.fixedThursday",
    FIXED_FRIDAY: "arrangementWorkDays.fixedFriday",
    FIXED_SATURDAY: "arrangementWorkDays.fixedSaturday",
    FIXED_SUNDAY: "arrangementWorkDays.fixedSunday",
    WORK_ADDRESS_LINE_1: "workAddressLine1",
    WORK_ADDRESS_LINE_2: "workAddressLine2",
    WORK_ADDRESS_CITY: "workAddressCity",
    WORK_ADDRESS_STATE: "workAddressState",
    WORK_ADDRESS_COUNTRY: "workAddressCountry",
    WORK_ADDRESS_ZIP: "workAddressZip",
    REMOTE_WORK_START_DATE: "remoteWorkStartDate",
    REMOTE_WORK_END_DATE: "remoteWorkEndDate",
    WORK_ADDRESS_HOME: "workAddressHome",
    DISTANCE_IU_CAMPUS: "distanceIuCampus",
    REMOTE_WORK_TYPE: "remoteWorkType",
    REASON: "reason",
    STUDENT_FACING_PERCENTAGE: "studentFacingPercentage",
    SUPERVISOR_REVIEWER_ID: "supervisorReviewerId",
    ATTESTATION_ACKNOWLEDGED: "attestationAcknowledged"
}

export const REMOTE_DAYS_OPTIONS = [
    {
        name: ARRANGEMENT_FIELDS.FIXED_MONDAY,
        label: 'Monday'
    }, {
        name: ARRANGEMENT_FIELDS.FIXED_TUESDAY,
        label: 'Tuesday'
    }, {
        name: ARRANGEMENT_FIELDS.FIXED_WEDNESDAY,
        label: 'Wednesday'
    }, {
        name: ARRANGEMENT_FIELDS.FIXED_THURSDAY,
        label: 'Thursday'
    }, {
        name: ARRANGEMENT_FIELDS.FIXED_FRIDAY,
        label: 'Friday'
    }, {
        name: ARRANGEMENT_FIELDS.FIXED_SATURDAY,
        label: 'Saturday'
    }, {
        name: ARRANGEMENT_FIELDS.FIXED_SUNDAY,
        label: 'Sunday'
    }
]

export const DISAPPROVAL_REASON_OPTIONS = [{
    value: "Needs to edit and resubmit",
    label: "Needs to edit and resubmit"
}, {
    value: "Does not meet the essential functions",
    label: "Does not meet the essential functions",
}, {
    value: "Due to operational needs",
    label: "Due to operational needs",
}, {
    value: "Lack of budget",
    label: "Lack of budget",
}, {
    value: "Cannot supply the necessary equipment",
    label: "Cannot supply the necessary equipment",
}, {
    value: "Out of state",
    label: "Out of state",
}, {
    value: "Out of country",
    label: "Out of country",
}]

export const Forms = {
    ARRANGEMENT_FORM: 'arrangementForm',
    ARRANGEMENTS_LOOKUP_FORM: 'arrangementLookupForm',
    REVIEW_ARRANGEMENT_FORM: 'reviewArrangementForm',
    HOME_FORM: 'homeForm',
    EDIT_ATTESTATION_FORM: 'editAttestationForm'
}

export const ARRANGEMENT_LOOKUPS = {
    CHARTORG: 'chart_org',
    RC: 'responsibilitycenter',
    EMPLOYEE: 'employee',
    SUPERVISOR: 'supervisor'
}

export const ARRANGEMENT_LOOKUP_OPTIONS = [
    {
        label: 'Chart/Org',
        value: ARRANGEMENT_LOOKUPS.CHARTORG
    },
    {
        label: 'Responsibility Center',
        value: ARRANGEMENT_LOOKUPS.RC
    },
    {
        label:  'Employee',
        value: ARRANGEMENT_LOOKUPS.EMPLOYEE
    },
    {
        label: 'Supervisor',
        value:ARRANGEMENT_LOOKUPS.SUPERVISOR
    }
]

export const TaxDisclaimer = <span>
    If another country besides the USA is entered, prior approval from the Office of the Vice President & General Counsel is required.  Employees working abroad will have unique tax withholding situations and should contact the University Controller Tax office for information.
    <br/><br/>
    If a new state location is entered for remote work, your department will be required to initiate an eDoc to update your primary work location in HRMS for accurate tax withholding.  Contact your HR representative. More information on how taxes are affected by remote work can be found at <a href="https://controller.iu.edu/services/employees/taxes/state-taxes" target="_blank">https://controller.iu.edu/services/employees/taxes/state-taxes</a>.
</span>

export const IMS_JOB_FULL_TIME_INDICATOR = "F"
