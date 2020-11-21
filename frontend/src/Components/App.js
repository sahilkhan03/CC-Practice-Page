import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Problems from './Problems';
import Search from './Search';
import Tags from './Tags';
import './App.css';
import { Navbar, Nav } from 'react-bootstrap'
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTags: new Set()
        }
        this.addTag = this.addTag.bind(this)
        this.removeTag = this.removeTag.bind(this)
        this.removeAll = this.removeAll.bind(this)
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

    render() {
        return (
            <div className="App">
                <Navbar bg="light" expand="lg">
                    <Navbar.Brand href="/">Codechef Practice Page</Navbar.Brand>
                    <Nav.Link href="/"> Search </Nav.Link>
                    <Nav.Link href="/tags"> Tags </Nav.Link>
                </Navbar>
                <br/>
                <Switch >
                    <Route path="/" exact render={props => <Search selectedTags={this.state.selectedTags} addTag={this.addTag} removeTag={this.removeTag} />} />
                    <Route path="/tags/problems/" exact render={props => <Problems removeAll={this.removeAll} selectedTags={Array.from(this.state.selectedTags)} />} />
                    <Route path="/tags/" exact render={props => <Tags removeAll={this.removeAll} addTag={this.addTag} />} />
                </Switch>
            </div>
        )
    }
}

export default App;
