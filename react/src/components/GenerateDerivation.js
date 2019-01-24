import React, { Component } from "react";
import PropTypes from "prop-types";
import { WithContext as ReactTags } from "react-tag-input";

class GenerateDerivation extends Component {
  static propTypes = {
    // Function for registering a listener with the WS provider
    subscribe: PropTypes.func.isRequired,

    innerRef: PropTypes.func
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
      <div
        className="generate-derivation flex-column grid-child"
        ref={this.props.innerRef}
      >
        <p className="grid-title">
          Generate Derivations
        </p>
        <p style={{ flexGrow: 1, flexShrink: 1 }}>
          Build a (bottom-up) Lexical Array in the box below, then hit the{" "}
          <strong>Derive!</strong> button to attempt to generate a corresponding
          derivation.
        </p>
        <p className="has-margin-10" style={{ flexGrow: 1, flexShrink: 1 }}>
          <strong>Add</strong> lexical items by typing and selecting from the
          pop-up list.
          <br/>
          <strong>Delete</strong> items by pressing backspace, or by clicking on
          the × icon in the item.
          <br/>
          <strong>Move</strong> items by dragging them around with the mouse.
        </p>
        <form onSubmit={this.submitInputStream}>
          <div className="field">
            <div className="control is-expanded">
              <ReactTags
                tags={this.state.lexicalArray}
                placeholder="Add a new lexical item"
                handleAddition={this.handleAddition}
                handleDelete={this.handleDelete}
                handleDrag={this.handleDrag}
                handleInputChange={this.handleInputChange}
                minQueryLength={1}
                name="lexicalItem"
                inline={false}
                allowUnique={false}
                classNames={{
                  tagInputField: "ReactTags__tagInputField input"
                }}
              />
              {this.renderErrorText()}
            </div>
          </div>

          <div className="field">
            <div className="control">
              <button className="button is-primary">Derive!</button>
            </div>
          </div>
        </form>

        <p className="has-text-grey-light has-margin-top-10">
          {JSON.stringify(this.state.lexicalArray)}
        </p>
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
   * Submits the contents of the input stream to the server to attempt a
   * derivation.
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

const GenerateDerivationWithRef = React.forwardRef((props, ref) => (
  <GenerateDerivation {...props} innerRef={ref}/>
));
GenerateDerivationWithRef.displayName = "GenerateDerivationWithRef";
export default GenerateDerivationWithRef;
