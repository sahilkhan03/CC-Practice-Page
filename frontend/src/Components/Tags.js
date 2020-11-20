import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
class Tags extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "tags": [],
            "redirect": false
        }
        this.setRedirect = this.setRedirect.bind(this)
        this.renderRedirect = this.renderRedirect.bind(this)
    }
    componentDidMount() {
        this.props.removeAll()
        fetch('/api/tags/')
            .then(data => data.json())
            .then((res) => {
                console.log(res);
                this.setState({ "tags": res })
            })

    }

    setRedirect(item) {
        this.props.addTag(item);
        this.setState({
            redirect: true
        })
    }

    renderRedirect() {
        if (this.state.redirect) {
            return <Redirect to='/tags/problems/' />
        }
    }

    render() {
        return (
            <div>
                {this.renderRedirect()}
                {
                    this.state.tags.map(item => (
                        <li id={item.id} onClick={e => { this.setRedirect(item) }}> {item.tag_name} </li>
                    ))
                }
            </div>
        )
    }
}
export default Tags;