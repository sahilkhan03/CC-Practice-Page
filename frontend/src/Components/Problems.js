import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Jumbotron, Button, Container, ListGroup, Row } from 'react-bootstrap';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

class Problems extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "problems": [],
            "fetched": false
        }
        this.addCustomTag = this.addCustomTag.bind(this)
    }
    componentDidMount() {
        if (this.props.selectedTags.length !== 0) {
            let list = ""
            this.props.selectedTags.map(tag => {
                tag = JSON.parse(tag)
                return list += tag.tag_name + ","
            })
            list = list.slice(0, -1);
            const jwt = localStorage.getItem('token')
            let options = {}
            if (jwt) options.headers = { Authorization: `Bearer ${jwt}` }
            fetch('/api/tags/problems?' + new URLSearchParams({
                filter: list
            }), options)
                .then(data => data.json())
                .then((res) => {
                    console.log(res);
                    this.setState({ "problems": res, fetched: true })
                })
        }
    }

    componentWillUnmount() {
        this.props.removeAll()
    }

    async addCustomTag(customTag, problemCode) {
        let formData = new FormData()
        formData.append('customTag', customTag)
        formData.append('problemCode', problemCode)
        const jwt = localStorage.getItem('token')
        let options = {
            method: 'post',
            body: formData
        }
        if (jwt) options.headers = { Authorization: `Bearer ${jwt}` }
        await fetch('/api/problem/tag', options)
            .then(res => res.json())
            .then(res => {
                console.log(res)
                if (res.code !== 9001)
                    throw new Error(res.message)
                return res;
            })
            .catch(error => {
                Swal.showValidationMessage(
                    `Request failed: ${error}`
                )
            })
    }

    render() {
        if (this.props.selectedTags.length === 0)
            return <Redirect to="/" ></Redirect>

        const MySwal = withReactContent(Swal)
        const Spinner = (!this.state.fetched ? (
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>) : null
        )
        if (this.state.problems.length === 0 && this.state.fetched) {
            return (
                <Container fluid="md">
                    <Jumbotron>
                        <h1>No Problems Found!</h1>
                        <p> Try selecting different tags! </p>
                        <p>
                            <Link to="/" >
                                <Button variant="primary">Go back to Search</Button>
                            </Link>
                        </p>
                    </Jumbotron>
                </Container>
            )
        }
        return (
            <Container fluid="md" >
                <Row>
                    <h5 style={{ fontSize: "18px", paddingTop: "15px" }}><strong> Selected Tags: </strong></h5>
                </Row>
                <Row>
                    <ListGroup horizontal={"xl"}>
                        {
                            Array.from(this.props.selectedTags).map((item, index) => {
                                item = JSON.parse(item)
                                return (
                                    <ListGroup.Item key={index}>
                                        {item.tag_name}
                                    </ListGroup.Item>
                                )
                            }
                            )
                        }
                    </ListGroup>
                </Row>
                <br />
                <Row>
                    <h5 style={{ fontSize: "18px", paddingTop: "15px" }}><strong> Problems: </strong></h5> <br />
                </Row>
                <br />
                <Row>
                    {Spinner}
                    <ListGroup style={{ "cursor": "pointer" }} >
                        {
                            this.state.problems.map((item, idx) => (
                                <ListGroup.Item key={idx} onClick={e => {
                                    let display = `
                                        <strong>Problem Code: </strong> ${item.problemCode} <br/>
                                        <strong>Author: </strong> ${item.author}
                                        <br/>
                                        <strong>Successful Submissions: </strong> ${item.successfulSubmissions} 
                                        <br /> `
                                    MySwal.fire({
                                        title: item.problemName,
                                        html: display,
                                        footer: `<a href=${"https://www.codechef.com/problems/" + item.problemCode} target="_blank" rel="noopener noreferrer">Go to Problem
                                        </a>`,
                                        showCloseButton: true,
                                        showConfirmButton: (this.props.username !== undefined),
                                        confirmButtonText: 'Add Tag',
                                    }).then(result => {
                                        if (result.value) {
                                            MySwal.fire({
                                                title: "Enter Tag Name",
                                                input: 'text',
                                                inputAttributes: {
                                                    autocapitalize: 'off'
                                                },
                                                showCancelButton: true,
                                                confirmButtonText: 'Add',
                                                showLoaderOnConfirm: true,
                                                preConfirm: (customTag) => this.addCustomTag(customTag, item.problemCode),
                                                allowOutsideClick: () => !MySwal.isLoading()
                                            }).then((result) => {
                                                if (result.value) {
                                                    MySwal.fire(
                                                        'Added!',
                                                        'Tag added to the problem',
                                                        'success'
                                                    )
                                                }
                                            })
                                        }
                                    })
                                }} >
                                    {item.problemName}
                                </ListGroup.Item>
                            ))
                        }
                    </ListGroup>
                </Row>
            </Container>
        )
    }
}
export default Problems;