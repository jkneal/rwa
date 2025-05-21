import React from 'react'
import {Col, Container, Row} from "rivet-react";
import {Field} from "redux-form";
import {Select} from "../components/form/controls";
import {required} from "../util/common";
import {DISAPPROVAL_REASON_OPTIONS} from "../constants";

class DisapproveDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
        // reset value and untouch, so these fields appear pristine when the Dialog is closed and then opened again
        this.props.setFormValue("disapproveReason", null)
        this.props.untouch("disapproveReason", null)
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        <Field
                            id="disapproveReason"
                            name={"disapproveReason"}
                            component={Select}
                            label={"Disapproval Reason"}
                            note={"Select the closest option"}
                            options={DISAPPROVAL_REASON_OPTIONS}
                            required={true}
                            validate={[required]}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default DisapproveDialog
