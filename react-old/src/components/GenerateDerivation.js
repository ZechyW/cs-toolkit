import _ from "lodash";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { WithContext as ReactTags } from "react-tag-input";

import { getFromLS, saveToLS } from "../util";

/**
 * Component for the lexical array builder
 */
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
      lexicalArray: getFromLS("lexicalArray") || [],

      // Autocomplete suggestions for the lexical array input
      suggestions: []
    };

    // Currently loaded LexicalItems -- Doesn't need to be formally tracked
    // as part of component state.  Keyed by LexicalItem id.
    this.lexicalItemsById = {};

    // Subscribe to the API PubSub topic
    this.apiPublish = this.props.subscribe("api", this.handleWSMessage);

    // The API requests that will be used by this component (for matching
    // server responses against).
    this.apiRequests = {
      lexicalItemList: {
        method: "get",
        url: "/api/lexicon/",
        payload: {
          fields: "id,text,language"
        }
      }
    };

    // Request an initial get of all LexicalItems
    this.apiPublish(this.apiRequests.lexicalItemList);

    // Subscribe to change notifications for LexicalItems
    this.notifyPublish = this.props.subscribe("notify", this.handleWSMessage);
    this.notifyPublish({
      type: "subscribe",
      model: "LexicalItem"
    });
  }

  render() {
    return (
      <div
        className="generate-derivation flex-column grid-child"
        ref={this.props.innerRef}
      >
        <p className="grid-title">Generate Derivations</p>
        <p>
          Build a <strong>bottom-up</strong> Lexical Array in the box below,
          then hit the <strong>Derive!</strong> button to attempt to generate a
          corresponding derivation.
        </p>
        <p>
          The language for each item is displayed in brackets next to its text,
          with functional items showing <strong>func</strong> as their language.
        </p>
        <p className="has-margin-10">
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
                labelField="label"
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
   * Let the parent know when we re-render.
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
    // Try and match it against one of our known API requests
    if (data.topic === "api" && data.type === "response") {
      /**
       * @prop data.status_code
       * @prop data.content
       */
      if (_.isMatch(data, this.apiRequests.lexicalItemList)) {
        if (data.status_code === 200) {
          // This is a full list of LexicalItems.  Reset the local cache.
          this.lexicalItemsById = {};
          for (const lexicalItem of data.content) {
            this.lexicalItemsById[lexicalItem.id] = lexicalItem;
          }
          return this.updateAutocompleteList();
        }
      }
    }

    // See if it's an update to the LexicalItems model
    if (data.topic === "notify" && data.model === "LexicalItem") {
      if (data.type === "change") {
        // A LexicalItem was either added or updated.
        const lexicalItem = data.data;
        this.lexicalItemsById[lexicalItem.id] = lexicalItem;
        return this.updateAutocompleteList();
      }

      if (data.type === "delete") {
        // A LexicalItem was removed
        const lexicalItem = data.data;
        delete this.lexicalItemsById[lexicalItem.id];
        return this.updateAutocompleteList();
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
    this.setState(
      (state) => {
        return { lexicalArray: [...state.lexicalArray, item] };
      },
      () => {
        saveToLS("lexicalArray", this.state.lexicalArray);
      }
    );
  };

  /**
   * Delete the item with the given index from the lexical array
   * @param i
   */
  handleDelete = (i) => {
    this.setState(
      (state) => {
        return {
          lexicalArray: state.lexicalArray.filter((item, index) => index !== i)
        };
      },
      () => {
        saveToLS("lexicalArray", this.state.lexicalArray);
      }
    );
  };

  /**
   * Move the given item to a new position
   * @param item
   * @param currPos
   * @param newPos
   */
  handleDrag = (item, currPos, newPos) => {
    this.setState(
      (state) => {
        const newArray = state.lexicalArray.slice();
        newArray.splice(currPos, 1);
        newArray.splice(newPos, 0, item);

        return {
          lexicalArray: newArray
        };
      },
      () => {
        saveToLS("lexicalArray", this.state.lexicalArray);
      }
    );
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
   * the currently-loaded list of lexical items.
   *
   * The list of lexical items may contain duplicates (for items with the
   * same text/language but different features), so we need to de-duplicate
   * as we go.
   */
  updateAutocompleteList = () => {
    const suggestions = [];

    // De-duplicate by suggestion label
    const lexicalItems = _.uniqBy(
      Object.values(this.lexicalItemsById),
      (item) => `${item.text} (${item.language})`
    );

    for (const lexicalItem of lexicalItems) {
      // Suggestions need to have an `id` field and `label` field, and we
      // also track the `text` and `language` fields of lexical items directly.
      suggestions.push({
        id: `${lexicalItem.text}`,
        text: `${lexicalItem.text}`,
        label: `${lexicalItem.text} (${lexicalItem.language})`,
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
