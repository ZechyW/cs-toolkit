import React from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";
import { actions as coreActions } from "../../core";
import { actions as navbarActions } from "../../navbar";
import { hide } from "../actions";
import "../styles/Options.scss";

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
  const elementToggles = [
    {
      id: "derivationInput",
      name: "Generate Derivations"
    },
    {
      id: "lexicalItemList",
      name: "Lexical Item List"
    },
    {
      id: "derivationStatusList",
      name: "Derivation Status"
    }
  ];

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
        <section className="modal-card-body options-body">
          <p className="has-text-weight-bold is-size-5 has-margin-bottom-10">
            Show/Hide UI elements
          </p>
          <p className="has-margin-bottom-10">
            You can also reposition individual elements by dragging their titles
            and/or resize them using the handle in their bottom-right corners.
          </p>
          <div className="has-margin-bottom-10">
            {elementToggles.map((element) => {
              return (
                <div className="pretty p-switch p-fill" key={element.id}>
                  <input
                    type="checkbox"
                    defaultChecked={props.itemVisibility[element.id]}
                    onClick={() => {
                      if (props.itemVisibility[element.id]) {
                        props.hideItem(element.id);
                      } else {
                        props.showItem(element.id);
                      }
                    }}
                  />
                  <div className="state p-primary">
                    <label>{element.name}</label>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="has-margin-bottom-10">
            Alternatively, reset the layout to its default state:
          </p>
          <p>
            <button
              className="button is-primary"
              onClick={() => {
                if (!props.navbarExpanded) props.expandNavbar();
                props.resetGrid();
              }}
            >
              <strong>Reset Layout</strong>
            </button>
          </p>
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
  // Show/hide the options modal itself
  hide,

  // For item visibility toggles
  showItem: coreActions.showItem,
  hideItem: coreActions.hideItem,

  // For layout reset
  expandNavbar: navbarActions.expandNavbar,
  resetGrid: coreActions.resetGrid
};

Wrapped = connect(
  createSelector({
    // Show/hide the options modal itself
    showModal: "options.showModal",

    // For item visibility toggles
    itemVisibility: "core.itemVisibility",

    // For layout reset
    navbarExpanded: "navbar.navbarExpanded"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
