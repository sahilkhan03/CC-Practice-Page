import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Jumbotron, Button, Container, ListGroup, Row } from 'react-bootstrap';
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
        if (this.state.problems.length === 0)
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
        return (
            <Container fluid="md">
                <Row>
                    <h5 style={{ fontSize: "18px", paddingTop: "15px" }}><strong> Selected Tags: </strong></h5>
                </Row>
                <Row>
                    <ListGroup horizontal={"xl"}>
                        {
                            Array.from(this.props.selectedTags).map((item, index) => {
                                item = JSON.parse(item)
                                return (
                                    <ListGroup.Item key = {index}>
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
                <Row>
                    <ListGroup>
                        {
                            this.state.problems.map((item, idx) => (
                                <ListGroup.Item key = {idx}>
                                    <a href={"https://www.codechef.com/problems/" + item.problemCode} target="_blank" rel="noopener noreferrer"> {item.problemName} </a>
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