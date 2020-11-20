import React, { Component } from 'react';
import { Link } from 'react-router-dom';
class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchResult: [],
            search: ""
        }
        this.handleChange = this.handleChange.bind(this)
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

    render() {
        return (
            <div>
                {
                    Array.from(this.props.selectedTags).map((item, index) => (
                        <li key={item.id}>{item.tag_name} <span onClick={(e) => this.props.removeTag(item)}> x </span></li>
                    ))
                }
                <br></br>
                <div>
                    <input style={{ border: "none" }} type="text" className="form-control" value={this.state.search} onChange={(e) => this.handleChange(e)} placeholder="Search" />
                    <button disabled = {this.props.selectedTags.length === 0}> <Link to="/tags/problems/" > Search </Link> </button>
                    <button> <Link to="/tags/" > Show All tags </Link> </button>
                </div>
                <div>
                    {
                        this.state.searchResult.map(tag => (
                            <p key={tag.id} onClick={(e) => this.props.addTag(tag)}> {tag.tag_name} </p>
                        ))
                    }
                </div>
            </div>
        )
    }
}
export default Search;