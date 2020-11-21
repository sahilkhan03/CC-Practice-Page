import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
class Problems extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "problems": []
        }
    }
    componentDidMount() {
        if (this.props.selectedTags.length !== 0) {
            let list = ""
            this.props.selectedTags.map(tag => {
                tag = JSON.parse(tag)
                return list += tag.id + ","
            })
            list = list.slice(0, -1);
            console.log(list)
            fetch('/api/tags/' + list)
                .then(data => data.json())
                .then((res) => {
                    console.log(res);
                    this.setState({ "problems": res })
                })
        }
    }

    componentWillUnmount() {
        this.props.removeAll()
    }

    render() {
        if (this.props.selectedTags.length === 0)
            return <Redirect to="/" ></Redirect>
        return (
            <div>
                {
                    this.state.problems.map(item => (
                        <a href={"https://www.codechef.com/problems/" + item.problemCode} target="_blank" rel="noopener noreferrer"> {item.problemName} </a>
                    ))
                }
            </div>
        )
    }
}
export default Problems;