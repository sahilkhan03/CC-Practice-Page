import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


class Tags extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "tags": [],
            "activeType": 0, //1 for "author", 2 for "actual_tag", 0 for all
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
        const MySwal = withReactContent(Swal)
        return (
            <div>
                {this.renderRedirect()}
                <div>
                    <h3>Categories: </h3>
                    <button onClick = {(e) => this.setState({
                        "activeType" : 1
                    })}> Author</button> <br></br>
                    <button onClick={(e) => this.setState({
                        "activeType": 2
                    })}>Concepts</button>
                    <button onClick={(e) => this.setState({
                        "activeType": 0
                    })}>Show All</button>

                    {
                        this.state.tags.map(item => {
                            let curType = this.state.activeType
                            if(curType === 0 || (curType === 1 && item.type === "author") || (curType === 2 && item.type === "actual_tag"))
                            return (
                            <li id={item.id} onClick={e =>
                                MySwal.fire({
                                    title: item.tag_name,
                                    text: "Type: " + item.type + "  |  Count: " + item.count,
                                    showCancelButton: true,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'See Problems'
                                }).then((result) => {
                                    if (result.value) {
                                        this.setRedirect(item)
                                    }
                                })
                            }> {item.tag_name} </li>
                            )
                            return null
                    })
                    }
                </div>
            </div>
        )
    }
}
export default Tags;