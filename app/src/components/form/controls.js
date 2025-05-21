import React from 'react'
import _ from 'lodash'
import {
    Checkbox as RivetCheckbox,
    InlineAlert,
    Input as RivetInput,
    Select as RivetSelect,
    Textarea as RivetTextarea,
} from 'rivet-react'
import CheckboxGroupImport from './CheckboxGroup'
import RadioGroupImport from './RadioGroup'
import DateInputImport from './DateInput'
import ReactSelect from './ReactSelect'

const fieldControl = (props, Control) => {
    const {input, meta={}, options, required, readOnly} = props

    const hasError = !!(meta.touched && meta.error)
    const hasWarning = !!(meta.touched && meta.warning)

    const variant = hasError ? 'danger' : (hasWarning ? 'warning' : props.variant)
    const note = hasError ? meta.error : (hasWarning ? meta.warning : props.note)

    let label = props.label
    if (label && required) {
        label += ' *'
    }

    const filteredProps = _.omit(props, ['input', 'meta', 'children', 'label', 'fieldLabel', 'options'])

    return (
        <Control {...filteredProps} {...input} label={label} variant={variant} note={note}>
            {options}
        </Control>
    )
}

export const Input = (props) => fieldControl({type: "text", ...props}, RivetInput)

export const NumberInput = (props) => fieldControl({type: "number", ...props}, RivetInput)

export const Textarea = (props) => fieldControl(props, RivetTextarea)

export const Checkbox = (props) => {
    const {input, meta={}, options, required} = props

    const hasError = !!(meta.touched && meta.error)
    const hasWarning = !!(meta.touched && meta.warning)

    const variant = hasError ? 'danger' : (hasWarning ? 'warning' : props.variant)
    const note = hasError ? meta.error : (hasWarning ? meta.warning : props.note)

    let fieldLabel = props.fieldLabel
    if (fieldLabel && required) {
        fieldLabel += ' *'
    }

    const id = props.id || props.input.name

    return (
        <div id={id + '-input'}>
            {fieldLabel && <label>{fieldLabel}</label>}
            <div>
                {fieldControl({checked: input.value, ...props}, RivetCheckbox)}
            </div>
            {note && <InlineAlert variant={variant}>{note}</InlineAlert>}
        </div>
    )
}

export const Select = (props) => {
    const {options} = props

    let selectOptions = []
    selectOptions.push(<option key="_blank"></option>)
    if (_.isArray(options)) {
        _.forEach(options, ({label, value, isDisabled}, i) => {
            selectOptions.push(<option key={i} value={value} disabled={Boolean(isDisabled)}>{label}</option>)
        })
    } else {
        _.forEach(options, (label, value) => {
            selectOptions.push(<option key={value} value={value}>{label}</option>)
        })
    }

    return fieldControl({type: "text", ...props, options:selectOptions}, RivetSelect)
}

export const CheckboxGroup = CheckboxGroupImport

export const RadioGroup = RadioGroupImport

export const DateInput = DateInputImport

export const ReactSelectInput = ReactSelect

export const TimeInput = (props) => (
    <DateInput
        placeholderText="HH:MM AM or PM"
        {...props}
        showTimeSelect={true}
        showTimeSelectOnly={true}
        timeIntervals={!!props.timeIntervals || 15}
        timeCaption={!!props.timeCaption || "Time"}
        dateFormat={!!props.dateFormat || "h:mm aa"}
    />
)

export const PersonSelectInput = (props) => (
    <ReactSelect {...props} placeholder={props.placeholder || "Start typing the last name or username of a user"}
                       getOptionValue={option => option ? option.networkId : null}
                       getOptionLabel={option => option ? option.name + " (" + option.networkId + ")" : null}
                       minSearchLength={2} searchUrlPrefix="/api/person/"/>
)

export const ValueDisplay = props => {
    return (
        <div>
            <b>{props.label}:</b> {props.input.value}
        </div>
    )
}
