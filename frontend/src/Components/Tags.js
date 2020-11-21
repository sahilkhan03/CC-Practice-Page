import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Tabs, Tab, Container, ListGroup } from 'react-bootstrap';


class Tags extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "tags": [],
            "activeType": "all", 
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
                <Container fluid="md">
                    <h2 className="d-flex justify-content-center">Tags</h2>
                    <Tabs
                        activeKey={this.state.activeType}
                        onSelect={(k) => this.setState({ activeType: k })}
                    >
                        <Tab eventKey="all" title="All" />
                        <Tab eventKey="author" title="Author" />
                        <Tab eventKey="actual_tag" title="Concepts" />
                    </Tabs>
                    <ListGroup>
                    {
                        this.state.tags.map(item => {
                            let curType = this.state.activeType
                            if (curType === "all" || curType === item.type)
                                return (
                                    <ListGroup.Item key={item.id} style={{ "cursor": "pointer" }} onClick={e =>
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
                                    }> {item.tag_name} 
                                    </ListGroup.Item>
                                )
                            return null
                        })
                    }
                    </ListGroup>
                </Container>
            </div>
        )
    }
}
export default Tags;