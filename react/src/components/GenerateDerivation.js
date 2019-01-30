import React, { Component } from "react";
import PropTypes from "prop-types";
import { WithContext as ReactTags } from "react-tag-input";

import _ from "lodash";

class GenerateDerivation extends Component {
  static propTypes = {
    // Function for registering a listener with the WS provider
    subscribe: PropTypes.func.isRequired,

    // Optionally passed by the parent
    onUpdate: PropTypes.func,

    // For React.forwardRef
    innerRef: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      // Currently built-up lexical array
      lexicalArray: [],

      // Autocomplete suggestions for the lexical array input
      suggestions: []
    };

    // Subscribe to the API-related topics
    this.apiPublish = this.props.subscribe("api", this.handleWSMessage);
    this.notifyPublish = this.props.subscribe("notify", this.handleWSMessage);

    // The API requests that will be used by this component (for matching
    // server responses against).
    this.apiRequests = {
      autocompleteList: {
        method: "get",
        url: "/api/lexicon/",
        payload: {
          fields: "text,language"
        }
      }
    };

    // Request an initial load of the autocomplete list
    this.apiPublish(this.apiRequests.autocompleteList);
  }

  render() {
    return (
      <div
        className="generate-derivation flex-column grid-child"
        ref={this.props.innerRef}
      >
        <p className="grid-title">Generate Derivations</p>
        <p style={{ flexGrow: 1, flexShrink: 1 }}>
          Build a <strong>bottom-up</strong> Lexical Array in the box below,
          then hit the <strong>Derive!</strong> button to attempt to generate a
          corresponding derivation.
        </p>
        <p className="has-margin-10" style={{ flexGrow: 1, flexShrink: 1 }}>
          <strong>Add</strong> lexical items by typing and selecting from the
          pop-up list.
          <br />
          <strong>Delete</strong> items by pressing backspace, or by clicking on
          the × icon in the item.
          <br />
          <strong>Move</strong> items by dragging them around with the mouse.
        </p>
        <form onSubmit={this.submitLexicalArray}>
          <div className="field">
            <div className="control is-expanded">
              <ReactTags
                tags={this.state.lexicalArray}
                suggestions={this.state.suggestions}
                placeholder="Add a new lexical item"
                handleAddition={this.handleAddition}
                handleDelete={this.handleDelete}
                handleDrag={this.handleDrag}
                handleInputChange={this.handleInputChange}
                minQueryLength={1}
                autocomplete={true}
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
   * Let the parent know when we re-render
   */
  componentDidUpdate() {
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }

  /**
   * Called when the server publishes a new message on one of the topics we
   * are subscribed to.
   * @param data
   */
  handleWSMessage = (data) => {
    if (data.topic === "api" && data.type === "response") {
      // Try and match it against one of our known API requests
      /**
       * @prop data.status_code
       * @prop data.content
       */
      if (_.isMatch(data, this.apiRequests.autocompleteList)) {
        if (data.status_code === 200) {
          return this.setAutocompleteList(data.content);
        }
      }
    }
    console.warn("Unmatched WS message:", data);
  };

  /**
   * The text in the lexical item input field changed
   * @param text
   */
  handleInputChange = (text) => {
    // Reset the error text
    this.setState({
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
   * Submits the contents of the lexical array to the server to attempt a
   * derivation.
   * @param event
   */
  submitLexicalArray = (event) => {
    event.preventDefault();
    if (this.state.lexicalArray.length === 0) {
      return this.setState({
        errorText: "The Lexical Array cannot be empty."
      });
    }

    console.log("Generate derivation:", this.state.lexicalArray);
  };

  /**
   * Sets the autocomplete suggestions for the lexical array input based on
   * the given list of lexical items.
   * @param {Object[]} lexicalItems
   */
  setAutocompleteList = (lexicalItems) => {
    const suggestions = [];
    for (const lexicalItem of lexicalItems) {
      // Suggestions need to have an `id` field and `text` field, and we
      // also track the `language` field of lexical items.
      suggestions.push({
        id: lexicalItem.text,
        text: lexicalItem.text,
        language: lexicalItem.language
      });
    }
    this.setState({ suggestions });
  };
}

const GenerateDerivationWithRef = React.forwardRef((props, ref) => (
  <GenerateDerivation {...props} innerRef={ref} />
));
GenerateDerivationWithRef.displayName = "GenerateDerivationWithRef";
export default GenerateDerivationWithRef;
