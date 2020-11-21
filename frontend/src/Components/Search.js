import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Button, Badge, InputGroup, FormControl } from 'react-bootstrap';
class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchResult: [],
            search: ""
        }
        this.handleChange = this.handleChange.bind(this)
        this.addTag = this.addTag.bind(this)
    }

    async handleChange(e) {
        let val = e.target.value;
        this.setState({ "search": val });
        if (val.length === 0)
            this.setState({ "searchResult": [] });
        else {
            await fetch('api/tags/search/' + val)
                .then(data => data.json())
                .then((res) => this.setState({ "searchResult": res }))
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
        return (
            <Container fluid="md">
                <Row>
                    <Col sm={3}><h5 style={{ fontSize: "18px", paddingTop: "9px" }}><strong> Selected Tags: </strong></h5></Col>
                    <Col style={{ paddingTop: "3px" }}>
                        {
                            Array.from(this.props.selectedTags).map((item, index) => {
                                item = JSON.parse(item)
                                return (
                                    <Button variant="primary">
                                        {item.tag_name} <Badge variant="light" onClick={(e) => this.props.removeTag(item)}>x</Badge>
                                        <span className="sr-only">remove tag</span>
                                    </Button>
                                )
                            }
                            )
                        }
                    </Col>
                </Row>
                <br></br>
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
                                <Link style={{ "text-decoration": "none" }} to="/tags/problems/" >
                                    <Button variant="primary"> Search </Button>
                                </Link>
                                <Link style={{ "text-decoration": "none" }} to="/tags/" >
                                    <Button variant="primary"> All tags </Button>
                                </Link>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ListGroup>
                            {
                                this.state.searchResult.map(tag => (
                                    <ListGroup.Item key={tag.id} onClick={(e) => this.addTag(tag)}>{tag.tag_name}</ListGroup.Item>
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