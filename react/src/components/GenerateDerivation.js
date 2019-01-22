import React, { Component } from "react";
import PropTypes from "prop-types";
import { WithContext as ReactTags } from "react-tag-input";

class GenerateDerivation extends Component {
  static propTypes = {
    // Function for registering a listener with the WS provider
    subscribe: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      // Form data
      lexicalItem: "",
      lexicalArray: [
        { id: "Test", text: "Test" },
        { id: "the", text: "the" },
        { id: "input", text: "input" }
      ]
    };
  }

  render() {
    return (
      <div className="generate-derivation">
        <p className="title is-4">Generate Derivations</p>
        <p className="has-margin-bottom-10">
          Build a (bottom-up) Lexical Array in the box below, then hit the{" "}
          <strong>Derive!</strong> button to attempt to generate a corresponding
          derivation.
        </p>
        <form className="field is-grouped" onSubmit={this.submitInputStream}>
          <div className="control is-expanded">
            {/*<input*/}
            {/*name="inputStream"*/}
            {/*className="input"*/}
            {/*type="text"*/}
            {/*value={this.state.inputStream}*/}
            {/*onChange={this.handleInputChange}*/}
            {/*ref={this.inputRef}*/}
            {/*/>*/}

            <ReactTags
              tags={this.state.lexicalArray}
              placeholder="Add a new lexical item"
              handleAddition={this.handleAddition}
              handleDelete={this.handleDelete}
              handleDrag={this.handleDrag}
              handleInputChange={this.handleInputChange}
              name="lexicalItem"
              allowUnique={false}
              classNames={{
                tagInputField: "ReactTags__tagInputField input"
              }}
            />
            {this.renderErrorText()}
          </div>
          <div className="control">
            <button className="button is-primary">Derive!</button>
          </div>
        </form>

        <span>{JSON.stringify(this.state.lexicalArray)}</span>
      </div>
    );
  }

  /**
   * The text in the lexical item input field changed
   * @param text
   */
  handleInputChange = (text) => {
    this.setState({
      lexicalItem: text,
      errorText: ""
    });
  };

  /**
   * Add an item to the lexical array
   * @param item
   */
  handleAddition = (item) => {
    this.setState((state) => {
      return { lexicalArray: [...state.lexicalArray, item] };
    });
  };

  /**
   * Delete the item with the given index from the lexical array
   * @param i
   */
  handleDelete = (i) => {
    this.setState((state) => {
      return {
        lexicalArray: state.lexicalArray.filter((item, index) => index !== i)
      };
    });
  };

  /**
   * Move the given item to a new position
   * @param item
   * @param currPos
   * @param newPos
   */
  handleDrag = (item, currPos, newPos) => {
    this.setState((state) => {
      const newArray = state.lexicalArray.slice();
      newArray.splice(currPos, 1);
      newArray.splice(newPos, 0, item);

      return {
        lexicalArray: newArray
      };
    });
  };

  /**
   * Renders any current errorText
   */
  renderErrorText = () => {
    if (this.state.errorText) {
      return <p className="help is-danger">{this.state.errorText}</p>;
    }
  };

  /**
   * Submits the contents of the input stream to the server to attempt a derivation.
   * @param event
   */
  submitInputStream = (event) => {
    event.preventDefault();
    if (this.state.lexicalArray.length === 0) {
      this.setState({
        errorText: "The Lexical Array cannot be empty."
      });
    } else {
      this.setState({
        errorText: "In progress."
      });
    }
    console.log("Generate:", this.state.inputStream);
  };
}

export default GenerateDerivation;
