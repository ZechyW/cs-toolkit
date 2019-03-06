import React from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";
import { actions as coreActions } from "../../core";
import { hide } from "../actions";

/**
 * Options modal for the UI
 * @param props
 * @return {*}
 * @constructor
 */
function Options(props) {
  // Show nothing when disabled.
  if (!props.showModal) {
    return null;
  }

  // Prepare ordered list of element visibility toggles.
  const elementToggles = [];
  elementToggles.push({
    id: "derivationInput",
    name: "Generate Derivations"
  });

  return (
    <div className="modal is-active">
      <div
        className="modal-background"
        onClick={() => {
          props.hide();
        }}
      />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Options</p>
          <button
            className="delete"
            aria-label="close"
            onClick={() => {
              props.hide();
            }}
          />
        </header>
        <section className="modal-card-body">
          <p className="has-text-weight-bold is-size-5">
            Show/Hide UI elements
          </p>
          {elementToggles.map((element) => {
            return (
              <div className="field">
                <div className="control">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={props.itemVisibility[element.id]}
                      onClick={() => {
                        if (props.itemVisibility[element.id]) {
                          props.hideItem(element.id);
                        } else {
                          props.showItem(element.id);
                        }
                      }}
                    />{" "}
                    {element.name}
                  </label>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

/**
 * HOCs and React-redux binding
 */
let Wrapped = Options;

const actionCreators = {
  hide,

  showItem: coreActions.showItem,
  hideItem: coreActions.hideItem
};

Wrapped = connect(
  createSelector({
    showModal: "options.showModal",

    itemVisibility: "core.itemVisibility"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
