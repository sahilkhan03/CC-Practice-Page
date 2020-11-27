import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Button, Badge, InputGroup, FormControl } from 'react-bootstrap';
class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchResult: [],
            search: "",
            ongoingReq: false
        }
        this.handleChange = this.handleChange.bind(this)
        this.addTag = this.addTag.bind(this)
    }

    async handleChange(e) {
        if (this.state.ongoingReq) {
            this.setState({ "ongoingReq": false })
            this.state.controller.abort()
        }
        let val = e.target.value;
        this.setState({ "search": val });
        if (val.length === 0)
            this.setState({ "searchResult": [] });
        else {
            await this.setState({ "ongoingReq": true, "controller": new AbortController() });
            const jwt = localStorage.getItem('token')
            const { signal } = this.state.controller
            console.log(signal)
            let options = {
                method: 'get',
                signal
            }
            if (jwt) options.headers = { Authorization: `Bearer ${jwt}` }
            try {
                await fetch('https://ccproject-backend.herokuapp.com/api/tags/search/' + val, options)
                    .then(data => data.json())
                    .then((res) => this.setState({ "searchResult": res, "ongoingReq": false }))
            }
            catch (err) {
                console.log(err)
            }
        }
    }

    addTag(tag) {
        this.props.addTag(tag);
        this.setState({
            searchResult: [],
            search: ""
        })
    }

    render() {
        const Spinner = (this.state.ongoingReq ? (
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>) : null
        )
        return (
            <Container fluid="md">
                <Row>
                    <Col sm={3}><h5 style={{ fontSize: "18px", paddingTop: "9px" }}><strong> Selected Tags: </strong></h5></Col>
                    <Col style={{ paddingTop: "3px" }}>
                        {
                            Array.from(this.props.selectedTags).map((item, index) => {
                                item = JSON.parse(item)
                                return (
                                    <Button key={index} variant="primary">
                                        {item.tag_name} <Badge variant="light" onClick={(e) => this.props.removeTag(item)}>x</Badge>
                                        <span className="sr-only">remove tag</span>
                                    </Button>
                                )
                            }
                            )
                        }
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <InputGroup className="mb-3">
                            <FormControl
                                placeholder="Search Tags"
                                aria-label="Search Tags"
                                aria-describedby="basic-addon2"
                                style={{ border: "none" }}
                                value={this.state.search}
                                onChange={(e) => this.handleChange(e)}

                            />
                            <InputGroup.Append>
                                <Link to="/tags/problems" >
                                    <Button variant="primary"> Search </Button>
                                </Link>
                                <Link to="/tags" >
                                    <Button variant="primary"> All tags </Button>
                                </Link>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {Spinner}
                        <ListGroup>
                            {
                                this.state.searchResult.map((tag, idx) => (
                                    <ListGroup.Item key={idx} style={{ "cursor": "pointer" }} onClick={(e) => this.addTag(tag)}>{tag.tag_name}</ListGroup.Item>
                                ))
                            }
                        </ListGroup>
                    </Col>
                </Row>
            </Container>
        )
    }
}
export default Search;