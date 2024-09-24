import React from "react";
import "./SearchBar.css";

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      term: "",
    };

    this.search = this.search.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
  }

  search(event) {
    event.preventDefault();
    this.props.onSearch(this.state.term);
  }

  handleTermChange(event) {
    this.setState({ term: event.target.value });
  }

  render() {
    return (
      <div className="SearchBar">
        <form onSubmit={this.search}>
          <input
            onChange={this.handleTermChange}
            placeholder="Enter A Song, Album, or Artist"
            value={this.state.term}
          />
          <button type="submit" className="SearchButton">
            SEARCH
          </button>
        </form>
      </div>
    );
  }
}

export default SearchBar;
