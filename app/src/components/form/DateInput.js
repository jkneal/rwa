import React from 'react'
import DatePicker from 'react-datepicker'
import {InlineAlert} from 'rivet-react'

import 'react-datepicker/dist/react-datepicker.css'

export const DateInput = (props) => {
    const {input, meta = {}, required} = props

    const hasError = !!(meta.touched && meta.error)
    const hasWarning = !!(meta.touched && meta.warning)

    const variant = hasError ? 'danger' : (hasWarning ? 'warning' : props.variant)
    const note = hasError ? meta.error : (hasWarning ? meta.warning : props.note)

    let label = props.label
    if (label && required) {
        label += ' *'
    }

    const filteredProps = _.omit(props, ['input', 'meta', 'children', 'label'])

    let className = 'rvt-input'
    if (hasError) {
        className += ' rvt-validation-danger'
    } else if (hasWarning) {
        className += ' rvt-validation-warning'
    }
    if (props.className) {
        className += ' ' + props.className
    }

    const id = props.id || input.name

    const onBlur = () => {
        input.onBlur(input.value)
    }

    const onChange = (e) => {
        onBlur()
        input.onChange(e)
    }

    return (
        <div>
            {label && <label htmlFor={id} className='rvt-label'>{label}</label>}
            <div>
                <DatePicker placeholderText="MM/DD/YYYY" {...filteredProps} {...input} id={id} selected={input.value} onBlur={onBlur}
                            className={className} autoComplete="off" onChange={onChange}/>
            </div>
            {note && <InlineAlert id={id + '-alert'} variant={variant}>{note}</InlineAlert>}
        </div>
    )
}

export default DateInput
