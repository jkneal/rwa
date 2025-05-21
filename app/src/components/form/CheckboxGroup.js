import React from 'react'
import {List, InlineAlert} from 'rivet-react'
import {Field} from "redux-form";
import {Checkbox} from "./controls";

const CheckboxGroup = (props) => {
    const {id, input, meta={}, options, checkboxOnChange, required} = props

    const hasError = !!(meta.touched && meta.error)
    const hasWarning = !!(meta.touched && meta.warning)

    const variant = hasError ? 'danger' : (hasWarning ? 'warning' : props.variant)
    const note = hasError ? meta.error : (hasWarning ? meta.warning : props.note)

    let fieldLabel = props.fieldLabel
    if (fieldLabel && required) {
        fieldLabel += ' *'
    }

    let checkboxes = []
    _.forEach(options, (option, index) => {
        checkboxes.push(<Field
                            key={option.name + "-" + index}
                            name={option.name}
                            label={option.label}
                            component={Checkbox}
                            onChange={checkboxOnChange}
        />)
    })

    return (
        <fieldset>
            {fieldLabel && <legend>{fieldLabel}</legend>}
            <List inline>
                {checkboxes}
            </List>
            {note && <InlineAlert variant={variant}>{note}</InlineAlert>}
        </fieldset>
    )
}

export default CheckboxGroup
