import React from 'react'
import {Button} from 'rivet-react'
import AsyncSelect from "react-select/async";
import {getResource} from "../util/RemoteOperations";

import './Backdoor.css'

const IconChevronRight = () => <svg role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 16 16"><g fill="currentColor"><path fill="currentColor" d="M5.5,15a1,1,0,0,1-.77-1.64L9.2,8,4.73,2.64A1,1,0,0,1,6.27,1.36L11.13,7.2a1.25,1.25,0,0,1,0,1.61L6.27,14.64A1,1,0,0,1,5.5,15ZM9.6,8.48h0Zm0-1h0Z"/></g></svg>

const onBackdoor = () => {
    const networkId = document.getElementsByName("backdoorId")[0].value
    fetch('/api/user/backdoor/' + networkId, {credentials: 'same-origin'})
        .then(response => {
            if (response.status === 200) {
                const url = new URL(window.location);
                url.search = new URLSearchParams({backdoorId: networkId}).toString();
                window.location = url;
            }
        })
}

const endBackdoor = (e) => {
    e.preventDefault()
    fetch(`/logout/impersonate`, {credentials: 'same-origin'})
        .then(response => {
            if (response.status === 200) {
                window.location = new URL(window.location)
            }
        })
}

const Backdoor = (props) => {
    const { userInfo:{ backdoorAllowed, impersonating } } = props
    if (!backdoorAllowed) {
        return null
    }

    return (
        <React.Fragment>
            <div className="backdoorLoginContainer rvt-input-group" role="menuitem">
                <BackdoorSelect />
                <div className="rvt-input-group__append">
                    <Button id="submit-backdoor" onClick={onBackdoor}>
                        <span className="rvt-sr-only">Submit Backdoor</span>
                        <span className="rvt-icon-chevron-right">
                            <IconChevronRight/>
                        </span>
                    </Button>
                </div>
            </div>
            {impersonating &&
                <div className="backdoorLoginContainer rvt-input-group" role="menuitem">
                    <Button id="end-backdoor" onClick={endBackdoor}>End Backdoor</Button>
                </div>}
        </React.Fragment>
    )
}

function BackdoorSelect (props) {
    const getOptionValue = option => option ? option.networkId : null
    const getOptionLabel = option => option ? option.name + " (" + option.networkId + ")" : null
    const loadOptions = (inputValue) => {
        if (inputValue && 2 && inputValue.length >= 2) {
            return getResource("/api/person/" + inputValue)().then(options => {
                return options.map(option => ({value: getOptionValue(option), label: getOptionLabel(option)}))
            })
        }
        return []
    }
    return (
        <div data-cy='Backdoor-input'>
            <AsyncSelect
                inputId="backdoorId"
                name="backdoorId"
                className='react-select-container Backdoor-input'
                classNamePrefix="react-select"
                type="text"
                aria-label="Backdoor ID"
                blurInputOnSelect={false}
                placeholder='Backdoor ID'
                loadingMessage={() => 'Loading...'}
                loadOptions={loadOptions}
                isClearable
                escapeClearsValue
                noOptionsMessage={() => 'No matches found'}
            />
        </div>

    )
}

export default Backdoor
