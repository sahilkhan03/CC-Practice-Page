import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Problems from './Problems';
import Search from './Search';
import Tags from './Tags';
import Auth from './Auth';
import Navigbar from './Navigbar';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTags: new Set(),
            username: undefined
        }
        this.addTag = this.addTag.bind(this)
        this.removeTag = this.removeTag.bind(this)
        this.removeAll = this.removeAll.bind(this)
        this.logout = this.logout.bind(this);
        this.login = this.login.bind(this);
    }

    componentDidMount() {
        const jwt = localStorage.getItem('token')
        if (jwt && this.state.username === undefined) {
            fetch('api/getUser', {
                headers: { Authorization: `Bearer ${jwt}` }
            })
                .then(res => res.json())
                .then(res => {
                    if (res.code === 9001) {
                        this.setState({ 'username': res.username });
                    }
                })
        }
    }

    addTag(tag) {
        let newSelectedTags = this.state.selectedTags;
        newSelectedTags.add(JSON.stringify(tag));
        this.setState({
            "selectedTags": newSelectedTags
        });
    }

    removeTag(tag) {
        let newSelectedTags = this.state.selectedTags;
        newSelectedTags.delete(JSON.stringify(tag));
        this.setState({
            "selectedTags": newSelectedTags
        });
    }

    removeAll() {
        let newSelectedTags = new Set()
        this.setState({
            "selectedTags": newSelectedTags
        })
    }

    login({ username, token }) {
        localStorage.setItem('token', token);
        this.setState({
            'username': username
        })
    }

    logout() {
        localStorage.removeItem("token");
        this.setState({
            'username': undefined
        })
    }

    render() {
        return (
            <div className="App">
                <Navigbar username={this.state.username} />
                <Switch >
                    <Route path="/" exact render={props => <Search selectedTags={this.state.selectedTags} addTag={this.addTag} removeTag={this.removeTag} />} />
                    <Route path="/tags/problems" exact render={props => <Problems username={this.state.username} removeAll={this.removeAll} selectedTags={Array.from(this.state.selectedTags)} />} />
                    <Route path="/tags" exact render={props => <Tags removeAll={this.removeAll} username = {this.state.username} addTag={this.addTag} />} />
                    <Route path="/login" exact render={props => <Auth login={this.login} reqType="login" />} />
                    <Route path="/logout" exact render={props => <Auth logout={this.logout} reqType="logout" />} />
                    <Route path="/signup" exact render={props => <Auth login={this.login} reqType="signup" />} />
                </Switch>
            </div>
        )
    }
}

export default App;
