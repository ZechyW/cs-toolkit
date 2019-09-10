import PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import { WithContext as ReactTags } from "react-tag-input";
import createSelector from "selectorator";

import { GridItemWrapper } from "../../grid";
import {
  addItem,
  changeItemIndex,
  deleteItemAtIndex,
  postDerivationRequest
} from "../actions";
import { getSuggestions } from "../selectors";
import "../styles/DerivationInput.scss";
import Config from "../../config";

/**
 * Component for the derivation input builder.
 * Uses the `react-tag-input` library to display lexical items as tag-like
 * pills.
 */
function DerivationInput(props) {
  // Display any error text
  const [errorText, setErrorText] = useState("");

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Helpers

  /**
   * Count how many unclosed brackets there are in the current input
   */
  function countUnclosed() {
    return props.currentInput.reduce((total, next) => {
      if (next.text === "[" && next.language === Config.sysLanguage) {
        return total + 1;
      }
      if (next.text === "]" && next.language === Config.sysLanguage) {
        return total - 1;
      }
      return total;
    }, 0);
  }

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Event handlers

  /**
   * Adds the given item to the current lexical array, if it is valid.
   * @param item
   */
  function handleAddition(item) {
    if (item.isValid) {
      props.addItem({ item });
    } else {
      setErrorText(
        "Only currently defined lexical items can be added to the lexical" +
          " array."
      );
    }
  }

  /**
   * Posts the current lexical array to the backend for derivation.
   * - Prevents the default submit action from refreshing the page
   */
  function submitDerivationInput(event) {
    event.preventDefault();

    // Only post if there are no unclosed brackets
    if (countUnclosed() !== 0) {
      return;
    }
    props.postDerivationRequest(props.currentInput);
  }

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
      <form onSubmit={submitDerivationInput}>
        <div className="field">
          <div className="control is-expanded">
            <ReactTags
              tags={props.currentInput}
              suggestions={props.suggestions}
              placeholder="Add a new lexical item"
              labelField="label"
              handleAddition={handleAddition}
              handleDelete={(index) => {
                if (index > -1) return props.deleteItemAtIndex({ index });
              }}
              handleDrag={(item, oldIndex, newIndex) =>
                props.changeItemIndex({ item, oldIndex, newIndex })
              }
              autofocus={false}
              handleInputChange={() => setErrorText("")}
              minQueryLength={1}
              autocomplete={true}
              inline={false}
              allowUnique={false}
              classNames={{
                tagInputField: "ReactTags__tagInputField input"
              }}
            />
            {errorText ? <p className="help is-danger">{errorText}</p> : ""}
            {Math.abs(countUnclosed()) > 0 ? (
              <p className="help is-danger">
                The Lexical Array contains {Math.abs(countUnclosed())} unclosed
                brackets.
              </p>
            ) : (
              ""
            )}
          </div>
        </div>

        <p
          className="has-text-grey-light has-margin-bottom-10"
          style={{ display: "none" }}
        >
          {JSON.stringify(props.currentInput)}
        </p>

        <div className="field">
          <div className="control">
            <button className="button is-primary">Derive!</button>
          </div>
        </div>
      </form>
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
  changeItemIndex: PropTypes.func.isRequired,

  // Submit to the backend
  postDerivationRequest: PropTypes.func.isRequired
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
  changeItemIndex,

  postDerivationRequest
};

Wrapped = connect(
  createSelector({
    currentInput: "derivationInput.currentInput",
    suggestions: getSuggestions,

    csrfToken: "core.csrfToken"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
