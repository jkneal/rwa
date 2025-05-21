import React from 'react'
import {Alert} from 'rivet-react'

const Unauthorized = () => {
    return (
        <Alert variant="danger" title="Error">
            You’ve reached this page because you currently do not have access to this system, a document
            within, or a function of this application. If you believe you should have or
            need to request access, please contact Human Resources at askHR
            (<a href="https://hr.iu.edu/welcome/contact.htm">https://hr.iu.edu/welcome/contact.htm</a>).
        </Alert>
    )
}

export default Unauthorized
