import React, { Component } from 'react';
import Swal from 'sweetalert2'
import { withRouter } from 'react-router-dom'
import withReactContent from 'sweetalert2-react-content'
import { Tabs, Tab, Container, ListGroup } from 'react-bootstrap';

class Tags extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "tags": [],
            "activeType": "all",
            "fetched": false
        }
        this.setRedirect = this.setRedirect.bind(this)
    }
    componentDidMount() {
        this.props.removeAll()
        const jwt = localStorage.getItem('token')
        let options = {}
        if (jwt) options.headers = { Authorization: `Bearer ${jwt}` }
        fetch('https://ccproject-backend.herokuapp.com/api/tags', options)
            .then(data => data.json())
            .then((res) => {
                console.log(res);
                this.setState({ "tags": res, fetched: true })
            })
    }

    setRedirect(item) {
        this.props.addTag(item);
        this.props.history.push('/tags/problems')
    }

    render() {
        const MySwal = withReactContent(Swal)
        const Spinner = (!this.state.fetched ? (
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>) : null
        )
        return (
            <div>
                <Container fluid="md">
                    <h2 className="d-flex justify-content-center">Tags</h2>
                    <Tabs
                        activeKey={this.state.activeType}
                        onSelect={(k) => this.setState({ activeType: k })}
                    >
                        <Tab eventKey="all" title="All" />
                        <Tab eventKey="author" title="Author" />
                        <Tab eventKey="actual_tag" title="Concepts" />
                        {(
                            this.props.username ? 
                                (<Tab eventKey="private" title="Private" />):
                                null                            
                        )}
                    </Tabs>
                    <br />
                    { Spinner }
                    <ListGroup>
                    {
                        this.state.tags.map((item, index) => {
                            let curType = this.state.activeType
                            if (curType === "all" || curType === item.type)
                                return (
                                    <ListGroup.Item key={index} style={{ "cursor": "pointer" }} onClick={e =>
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
export default withRouter(Tags);