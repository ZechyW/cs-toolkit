import React, { Component } from "react";
import PropTypes from "prop-types";

class GenerateDerivation extends Component {
  static propTypes = {
    // Function for registering a listener with the WS provider
    subscribe: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      // Form data
      inputStream: ""
    };
  }

  render() {
    return (
      <div className="generate-derivation">
        <p className="title is-4">Generate Derivations</p>
        <p>
          Build a (bottom-up) Lexical Array in the box below, then hit the{" "}
          <strong>Derive!</strong> button to attempt to generate a corresponding
          derivation.
        </p>
        <form
          className="field is-grouped has-padding-top-10"
          onSubmit={this.submitInputStream}
        >
          <div className="control is-expanded">
            <input
              name="inputStream"
              className="input"
              type="text"
              value={this.state.inputStream}
              onChange={this.handleInputChange}
              ref={this.inputRef}
            />
            {this.renderErrorText()}
          </div>
          <div className="control">
            <button className="button is-primary">Derive!</button>
          </div>
        </form>
      </div>
    );
  }

  /**
   * For controlled form components
   * @param event
   */
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
      errorText: ""
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
    if (this.state.inputStream.trim() === "") {
      this.setState({
        errorText: "The Lexical Array cannot be empty."
      });
    }
    console.log("Generate:", this.state.inputStream);
  };
}

export default GenerateDerivation;
