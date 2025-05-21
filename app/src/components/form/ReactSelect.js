import React from 'react'
import Select from 'react-select'
import SelectCreatable from 'react-select/creatable'
import AsyncSelect from 'react-select/async'
import AsyncSelectCreatable from 'react-select/async-creatable'
import {getResource} from '../../util/RemoteOperations'
import {InlineAlert} from 'rivet-react'

import './ReactSelect.css'

/**
 * options = pass this to use the sync version
 * searchUrlPrefix = pass this to use the async version
 * defaultValue = the default value of the typeahead. Can be used to show a certain value when the page loads
 */
export const ReactSelectInput = (props) => {
    const {
        input,
        meta={},
        options,
        searchUrlPrefix,
        readOnly,
        title,
        placeholder,
        required,
        minSearchLength = 2,
        isClearable = true,
        isCreatable = false,
        escapeClearsValue = true,
        noOptionsMessage = 'No matches found',
        defaultValue,
        selectAllOption = false,
        getOptionValue=() => {},
        getOptionLabel=() => {},
        ...otherProps
    } = props

    const hasError = !!(meta.touched && meta.error)
    const hasWarning = !!(meta.touched && meta.warning)

    const variant = hasError ? 'danger' : (hasWarning ? 'warning' : props.variant)
    const note = hasError ? meta.error : (hasWarning ? meta.warning : props.note)

    let label = props.label
    if (label && required) {
        label += ' *'
    }

    let className = 'react-select-container'
    if (hasError) {
        className += ' rvt-validation-danger'
    } else if (hasWarning) {
        className += ' rvt-validation-warning'
    }

    // Choose between the 4 version of React-Select (sync/async, creatable/not-creatable)
    let SelectComponent
    if (searchUrlPrefix) {
        SelectComponent = isCreatable ? AsyncSelectCreatable : AsyncSelect
        otherProps.loadOptions = (inputValue) => {
            if (inputValue && minSearchLength && inputValue.length >= minSearchLength) {
                return getResource(searchUrlPrefix + inputValue)()
            }
            return []
        }
    } else {
        SelectComponent = isCreatable ? SelectCreatable : Select
        otherProps.options = [].concat(options)
    }

    let onBlur
    if (input.onBlur) {
        onBlur = () => setTimeout(() => input.onBlur(input.value), 200)
    }

    let optionsUnselected = []
    if (selectAllOption && otherProps.options) {
        optionsUnselected = _.differenceBy(otherProps.options, input.value || [], getOptionValue)
        if (optionsUnselected.length > 0) {
            otherProps.options.unshift({
                selectAllOption: true
            })
        }
    }

    const onChange = values => {
        const selectAllSelected = _.some(values, 'selectAllOption')
        if (selectAllSelected) {
            input.onChange(_.concat(input.value || [], optionsUnselected))
        } else {
            input.onChange(values)
        }
    }

    const id = props.id || props.input.name

    if (!defaultValue) {
        otherProps.value = input.value;
        otherProps.getOptionLabel = o => o.selectAllOption ? 'Select All' : getOptionLabel(o);
        otherProps.getOptionValue = o => o.selectAllOption ? '' : getOptionValue(o);
    }

    return (
        <div id={id + '-input'}>
            {label && <label htmlFor={id} className='rvt-label'>{label}</label>}
            <SelectComponent
                {...otherProps}
                inputId={id}
                name={input.name}
                className={className}
                defaultValue={defaultValue}
                classNamePrefix="react-select"
                type="text"
                aria-label={title}
                onChange={onChange}
                onBlur={onBlur}
                blurInputOnSelect={false}
                onFocus={input.onFocus}
                placeholder={readOnly ? "" : placeholder}
                isDisabled={readOnly}
                isMulti={props.isMulti || false}
                loadingMessage={() => 'Loading...'}
                isClearable={isClearable}
                escapeClearsValue={escapeClearsValue}
                noOptionsMessage={() => noOptionsMessage}/>
            {note && <InlineAlert variant={variant}>{note}</InlineAlert>}
        </div>
    )
}

export default ReactSelectInput
