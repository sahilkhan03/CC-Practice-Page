import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Alert, Container, Form, Button, Spinner } from 'react-bootstrap'
class Auth extends Component {
    constructor(props) {
        super(props)
        this.state = {
            'username': '',
            'password': '',
            'message': '',
            'loaded' : true,
            'reqType': this.props.reqType //login/signup/logout
        }
        this.change = this.change.bind(this)
        this.submit = this.submit.bind(this)
    }

    componentDidMount() {
        if (this.state.reqType === "logout") {
            this.props.logout()
            this.props.history.push('/')
        }
        else if (this.state.reqType === "login" || this.state.reqType === "signup") {
            let jwt = localStorage.getItem('token')
            if (jwt) this.props.history.push('/') //Already logged in
        }
        else this.props.history.push('/') // invalid reqType
    }

    componentWillReceiveProps(nextProps) {
        this.setState({reqType : nextProps.reqType});
    }

    change(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    async submit(e) {
        e.preventDefault();
        this.setState({loaded: false})
        let formData = new FormData()
        formData.append('username', this.state.username)
        formData.append('password', this.state.password)
        await fetch('https://ccproject-backend.herokuapp.com/api/' + this.state.reqType, {
            method: 'post',
            body: formData
        })
            .then(res => res.json())
            .then(res => {
                console.log(res)
                this.setState({
                    'message': res.message,
                    'username': "",
                    "password": "",
                    'loaded': true
                })
                if (res.code === 9001) {
                    this.props.login(res);
                    this.props.history.push('/')
                }
            })
    }

    render() {
        const spinButton = (!this.state.loaded ? 
            (<Button variant="primary">
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />
                <span className="sr-only">Loading...</span>
            </Button>) : (
                <Button variant="primary" type="submit">
                    {this.state.reqType[0].toUpperCase() + this.state.reqType.slice(1)}
                </Button>
            )
        )
        return (
            <Container fluid="sm" className="w-50 p-3" style={{maxWidth: '500px'}}>
                {
                    (this.state.message.length !== 0 ? 
                        (<Alert variant="info">
                            {this.state.message}
                        </Alert>) : null
                    )
                }
                <Form onSubmit={(e) => this.submit(e)}>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Username</Form.Label>
                        <Form.Control required type="text" name="username" value={this.state.username} onChange={(e) => this.change(e)}  placeholder="Enter username" />
                    </Form.Group>
                    <Form.Group controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" required name="password" value={this.state.password} onChange={(e) => this.change(e)}  placeholder="Password" />
                    </Form.Group>
                    { spinButton }
                </Form>
            </Container>
        )
    }
}

export default withRouter(Auth)