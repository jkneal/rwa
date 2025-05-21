import React from 'react'

class Loader extends React.Component {

    static defaultProps = {
        onLoad: () => {}
    };

    componentDidMount() {
        this.props.onLoad()
    }

    render() {
        return this.props.children
    }

}

export default (Component) => ({ onLoad,...props}) => (
    <Loader onLoad={onLoad}>
        <Component {...props} />
    </Loader>
)
