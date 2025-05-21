import React, {Component} from 'react'
import {Alert} from 'rivet-react'
import {connect} from "react-redux"

const stateToProps = (state) => {
    return {
        message: state.error.message
    }
}

const dispatchToProps = () => {
    return {
    }
}

class ErrorPage extends Component {

    render() {
        return (
            <Alert variant="danger" title="Error">
                A system error has occurred. If this persists, please contact a system administrator with the following
                technical details: <small>{this.props.message}</small>
            </Alert>
        )
    }

}

export default connect(stateToProps, dispatchToProps)(ErrorPage)
