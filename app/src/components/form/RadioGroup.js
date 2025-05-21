import React from 'react'
import {Disclosure, InlineAlert, List, RadioButton} from 'rivet-react'
import _ from "lodash";

const RadioGroup = (props) => {
    const {input, meta={}, options, helpTextTitle, helpText, subLabel, required, trueFalseOptions} = props

    const hasError = !!(meta.touched && meta.error)
    const hasWarning = !!(meta.touched && meta.warning)

    const variant = hasError ? 'danger' : (hasWarning ? 'warning' : props.variant)
    const note = hasError ? meta.error : (hasWarning ? meta.warning : props.note)

    let fieldLabel = props.fieldLabel
    if (fieldLabel && required) {
        fieldLabel += ' *'
    }

    const filteredProps = _.omit(props, ['input', 'meta', 'children', 'fieldLabel', 'helpTextTitle', 'helpText', 'subLabel'])

    let radioOptions = []
    if (trueFalseOptions) {
        radioOptions.push(<RadioButton key="true" {...filteredProps} {...input} value={true} label="Yes"
                                       checked={input.value}/>)
        radioOptions.push(<RadioButton key="false" {...filteredProps} {...input} value={false} label="No"
                                       checked={!input.value}/>)
    } else if (_.isArray(options)) {
        _.forEach(options, ({label, value}, i) => {
            radioOptions.push(<RadioButton key={i} {...filteredProps} {...input} value={value} label={label}
                                           checked={value === input.value}/>)
        })
    } else {
        _.forEach(options, (label, value) => {
            radioOptions.push(<RadioButton key={value} {...filteredProps} {...input} value={value} label={label}
                                           checked={value === input.value}/>)
        })
    }

    return (
        <fieldset>
            {fieldLabel && <legend>{fieldLabel}</legend>}
            {subLabel && <div className="rvt-ts-14">{subLabel}</div>}
            {helpText &&
                <Disclosure className="help-collapse" title={helpTextTitle}>
                    {helpText}
                </Disclosure>}
            <List inline>
                {radioOptions}
            </List>
            {note && <InlineAlert variant={variant}>{note}</InlineAlert>}
        </fieldset>
    )
}

export default RadioGroup
