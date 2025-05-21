import {isAfter, parse, startOfDay} from 'date-fns'
import _ from 'lodash'
import {ARRANGEMENT_FIELDS, REMOTE_DAYS_OPTIONS} from "../constants"

/**
 * Field Validation functions begin
 */
export const required = value => (value ? undefined : 'Required')

export const numberField = value => {
    let acceptableInputs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace', 'Delete', 'Meta']
    return !acceptableInputs.includes(value) ? "This field should be a number" : undefined
}

export const checkBoxRequired = (errorMessage = "You must select this") => (value) => !!value ? undefined : errorMessage

export const attestationCheckBoxRequired = checkBoxRequired("Please agree to the below to continue")

export const checkBoxGroupRequired = (options) => (value, allValues) => {
    let someOptionsChecked
    _.forEach(options, option => {
        if (_.get(allValues, option.name)) {
            someOptionsChecked = true
            return false
        }
    })
    return someOptionsChecked ? undefined : "At least one option must be selected for this field"
}

export const remoteDaySelectionsCheckBoxGroupRequired = checkBoxGroupRequired(REMOTE_DAYS_OPTIONS)

export const startDateLessThanEndDate = (endDateField) => (value, allValues) => {
    if (!allValues[endDateField]) {
        return undefined
    } else {
        return value > allValues[endDateField] ? "Start Date must be before End Date" : undefined
    }
}

export const startTimeLessThanEndTime = (endTimeField) => (value, allValues) => {
    if (!allValues[endTimeField]) {
        return undefined
    } else {
        return value > allValues[endTimeField] ? "Start Time must be before End Time" : undefined
    }
}

export const remoteWorkStartDateLessThanEndDate = startDateLessThanEndDate(ARRANGEMENT_FIELDS.REMOTE_WORK_END_DATE)

export const maxLength = max => value => value && value.length > max ? "Must be " + max + " characters or less" : undefined

export const maxLengthStreetAddressLines = maxLength(100)
export const maxLengthCity = maxLength(55)
export const maxLengthZipCode = maxLength(12)
export const maxLengthRemoteWorkReason = maxLength(4000)
export const maxLengthApproverComments = maxLength(300)
export const maxLengthAttestationText = maxLength(4000)

/**
 * Field Validation functions end
 */

export const createShortName = (userinfo) => {
    var ret = ''
    if (userinfo && userinfo.firstName && userinfo.firstName.length > 0) {
        ret += userinfo.firstName.substring(0,1)
    }
    if (userinfo && userinfo.lastName && userinfo.lastName.length > 0) {
        ret += userinfo.lastName.substring(0,1)
    }
    return ret
}

export const formatTimestamp = (value) => {
    return value ? new Date(value).toLocaleDateString() : null
}

export const formatDate = (date) => {
    return (date.getMonth() + 1).toString().padStart(2, "0") + "/" + date.getDate().toString().padStart(2, "0") + "/" + date.getFullYear()
}

export const formatTime = (date) => {
    return date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + ":" + date.getSeconds().toString().padStart(2, "0")
}

export const parseDate = (dateString, format="MM/dd/yyyy") => {
    return dateString ? parse(dateString, format, new Date()) : null
}

export const parseTime = (timeString, format="HH:mm:ss") => {
    return timeString ? parse(timeString, format, new Date()) : null
}

export const dateAfterToday = (date) => {
    const dt = startOfDay(date)
    const today = startOfDay(new Date())
    return !isAfter(dt, today) ? 'Must be after today' : ''
}

export const Loading = () => <div className="rvt-loader" aria-label="Content loading"></div>
