import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { WithContext as ReactTags } from "react-tag-input";
import createSelector from "selectorator";
import "../styles/LexicalArray.scss";

/**
 * Component for the lexical array builder.
 * Uses the `react-tag-input` library to display lexical items as tag-like
 * pills.
 */
export class LexicalArray extends React.Component {
  static propTypes = {
    // Autocomplete suggestions for the tag input
    suggestions: PropTypes.array,

    // Currently built-up lexical array
    currentInput: PropTypes.array
  };

  static defaultProps = {
    suggestions: [],
    currentInput: []
  };

  render = () => (
    <>
      <p>
        Build a <strong>bottom-up</strong> Lexical Array in the box below, then
        hit the <strong>Derive!</strong> button to attempt to generate a
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
      <form
      // onSubmit={this.submitLexicalArray}
      >
        <div className="field">
          <div className="control is-expanded">
            <ReactTags
              tags={this.props.currentInput}
              suggestions={this.props.suggestions}
              placeholder="Add a new lexical item"
              labelField="label"
              handleAddition={this.handleAddition}
              handleDelete={this.handleDelete}
              // handleDrag={this.handleDrag}
              // handleInputChange={this.handleInputChange}
              minQueryLength={1}
              autocomplete={true}
              inline={false}
              allowUnique={false}
              classNames={{
                tagInputField: "ReactTags__tagInputField input"
              }}
            />
            {/*{this.renderErrorText()}*/}
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button className="button is-primary">Derive!</button>
          </div>
        </div>
      </form>

      <p className="has-text-grey-light has-margin-top-10">
        {JSON.stringify(this.props.currentInput)}
      </p>
    </>
  );
}

/**
 * React-redux binding
 */
export default connect(
  createSelector({
    suggestions: "lexicalArray.suggestions",
    currentInput: "lexicalArray.currentInput"
  })
)(LexicalArray);
