import PropTypes from "prop-types";
import React, { useLayoutEffect } from "react";
import { connect } from "react-redux";
import { WithContext as ReactTags } from "react-tag-input";
import createSelector from "selectorator";
import { addItem, changeItemIndex, deleteItemAtIndex } from "../actions";
import "../styles/LexicalArray.scss";

/**
 * Component for the lexical array builder.
 * Uses the `react-tag-input` library to display lexical items as tag-like
 * pills.
 */
function LexicalArray(props) {
  // Before any re-render, enqueue a height check with our parent
  // (`useLayoutEffect` because the new height might affect the visible
  // height of the parent grid item)
  useLayoutEffect(() => {
    props.gridCheckMinHeight();
  });

  return (
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
      <div
      // onSubmit={this.submitLexicalArray}
      >
        <div className="field">
          <div className="control is-expanded">
            <ReactTags
              tags={props.currentInput}
              suggestions={props.suggestions}
              placeholder="Add a new lexical item"
              labelField="label"
              handleAddition={(item) => props.addItem({ item })}
              handleDelete={(index) => {
                if (index > -1) return props.deleteItemAtIndex({ index });
              }}
              handleDrag={(item, oldIndex, newIndex) =>
                props.changeItemIndex({ item, oldIndex, newIndex })
              }
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

        <p className="has-text-grey-light has-margin-bottom-10">
          {JSON.stringify(props.currentInput)}
        </p>

        <div className="field">
          <div className="control">
            <button className="button is-primary">Derive!</button>
          </div>
        </div>
      </div>
    </>
  );
}

LexicalArray.propTypes = {
  // Autocomplete suggestions for the tag input
  suggestions: PropTypes.array,

  // Currently built-up lexical array
  currentInput: PropTypes.array,

  // For notifying grid parent when our height may have changed
  gridCheckMinHeight: PropTypes.func.isRequired
};

LexicalArray.defaultProps = {
  suggestions: [],
  currentInput: []
};

/**
 * React-redux binding
 */
const actionCreators = {
  addItem,
  deleteItemAtIndex,
  changeItemIndex
};

export default connect(
  createSelector({
    suggestions: "lexicalArray.suggestions",
    currentInput: "lexicalArray.currentInput"
  }),
  actionCreators
)(LexicalArray);
