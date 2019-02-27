import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { WithContext as ReactTags } from "react-tag-input";
import createSelector from "selectorator";
import { GridItemWrapper } from "../../grid";
import { addItem, changeItemIndex, deleteItemAtIndex } from "../actions";
import { getSuggestions } from "../selectors";
import "../styles/DerivationInput.scss";

/**
 * Component for the derivation input builder.
 * Uses the `react-tag-input` library to display lexical items as tag-like
 * pills.
 */
function DerivationInput(props) {
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
      // onSubmit={this.submitDerivationInput}
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

DerivationInput.propTypes = {
  // Autocomplete suggestions for the tag input
  suggestions: PropTypes.array,

  // Currently built-up derivation input array
  currentInput: PropTypes.array,

  // For manipulating the input
  addItem: PropTypes.func.isRequired,
  deleteItemAtIndex: PropTypes.func.isRequired,
  changeItemIndex: PropTypes.func.isRequired
};

DerivationInput.defaultProps = {
  suggestions: [],
  currentInput: []
};

/**
 * HOCs and React-redux binding
 */

let Wrapped = DerivationInput;

Wrapped = GridItemWrapper(Wrapped);

const actionCreators = {
  addItem,
  deleteItemAtIndex,
  changeItemIndex
};

Wrapped = connect(
  createSelector({
    currentInput: "derivationInput.currentInput",
    suggestions: getSuggestions
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
