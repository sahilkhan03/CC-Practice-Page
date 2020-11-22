import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            'username' : '',
            'password' : '',
            'message': ''
        }
        this.change = this.change.bind(this)
        this.submit = this.submit.bind(this)
    }

    componentDidMount() {
        let jwt = localStorage.getItem('token')
        if(jwt) this.props.history.push('/') //Already logged in
    }

    change(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    async submit(e) {
        e.preventDefault();
        let formData = new FormData()
        formData.append('username', this.state.username)
        formData.append('password', this.state.password)
        await fetch('api/login', {
            method: 'post',
            body: formData
        })
        .then(res => res.json())
        .then(res => {
            console.log(res)
            this.setState({
                'message': res.message,
                'username': "",
                "password": ""
            })
            if(res.code === 9001) {
                this.props.login(res);
                this.props.history.push('/')
            }
        })
    }

    render() {
        return (
            <div>
                {this.state.message}
                <form onSubmit= {(e) => this.submit(e)}>
                    <label>username</label> <input required type="text" name="username" value={this.state.username} onChange = {(e) => this.change(e)} />
                    <label>password</label> <input required type="text" name="password" value={this.state.password} onChange={(e) => this.change(e)} />
                    <button type = "submit"> Submit </button>
                </form>
            </div>
        )
    }
}

export default withRouter(Login)