import PropTypes from "prop-types";
import React, { useLayoutEffect } from "react";
import { connect } from "react-redux";
import Select from "react-select";
import createSelector from "selectorator";

import { GridItemWrapper } from "../../grid";
import { flipChildren, selectChain, selectFrame, showModal } from "../actions";
import { derivationDetails } from "../selectors";
import DerivationTimelineTree from "./DerivationTimelineTree";

/**
 * Component for viewing individual Derivation chain trees.
 * The heavy lifting is done by the main Derivation tracker -- We just pull
 * the relevant information from its store and display visualisations for
 * the derivational chains (the selector and timeline view).
 * @param props
 * @constructor
 */
function DerivationViewer(props) {
  useLayoutEffect(() => {
    if (!props.derivationDetails && props.selectedFrame !== -1) {
      // We don't have a Derivation currently selected.
      // Show the last frame the next time one is picked.
      props.selectFrame(-1);
    }
  });

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Data pre-processing

  // Prepare options list of chains available for viewing (converged ones
  // first, then crashed ones).
  // `allChains` holds the actual chain data; `allOptions` holds
  // suggestions for the select box.
  const allChains = [];
  let currentIndex = 0;
  const allOptions = [];
  let selectedOption = false;

  if (props.derivationDetails) {
    // Converged chains
    const convergedOptions = [];
    // eslint-disable-next-line no-unused-vars
    for (const chain of props.derivationDetails["converged_chains"]) {
      allChains[currentIndex] = chain;
      const option = {
        value: currentIndex,
        label: `Chain ${currentIndex + 1} (converged)`
      };

      // Was this the last selected option?
      convergedOptions.push(option);
      if (props.selectedChain === currentIndex) {
        selectedOption = option;
      }

      currentIndex += 1;
    }
    allOptions.push({
      label: "Converged chains",
      options: convergedOptions
    });

    // Crashed chains
    const crashedOptions = [];
    // eslint-disable-next-line no-unused-vars
    for (const chain of props.derivationDetails["crashed_chains"]) {
      allChains[currentIndex] = chain;
      const option = {
        value: currentIndex,
        label: `Chain ${currentIndex + 1} (crashed)`
      };

      // Was this the last selected option?
      crashedOptions.push(option);
      if (props.selectedChain === currentIndex) {
        selectedOption = option;
      }

      currentIndex += 1;
    }
    allOptions.push({
      label: "Crashed chains",
      options: crashedOptions
    });
  }

  // If we are trying to render from an invalid state, fix it for the next
  // render.
  useLayoutEffect(() => {
    // Selected frame is OOB for the selected chain.
    if (
      allChains[props.selectedChain] &&
      (props.selectedFrame >= allChains[props.selectedChain].length ||
        props.selectedFrame === -1)
    ) {
      props.selectFrame(allChains[props.selectedChain].length - 1);
    }
  });

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Select box event handlers

  /**
   * The user clicked in the chain selection box.
   * (The actual selected option may not have changed.)
   * @param option
   * @param action
   */
  function handleChange(option, action) {
    if (option.value === props.selectedChain) {
      // False alarm
      return;
    }

    props.selectChain(option.value);
    props.selectFrame(allChains[option.value].length - 1);
  }

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Render

  return (
    <>
      <p className="has-margin-bottom-10">
        Select a derivation in the Derivation Status widget to show its chains
        here.
      </p>

      <div className="has-margin-bottom-5">Derivational chains:</div>
      <div className="has-margin-bottom-5">
        <Select
          menuPortalTarget={document.body}
          onChange={handleChange}
          options={allOptions}
          placeholder="Select a chain to view..."
          value={selectedOption}
        />
      </div>
      <div>
        <DerivationTimelineTree
          title={
            props.selectedChain === null
              ? ""
              : `Chain ${props.selectedChain + 1}`
          }
          chain={allChains[props.selectedChain]}
          selectedFrame={props.selectedFrame}
          selectFrame={props.selectFrame}
          flippedChildren={props.flippedChildren}
          flipChildren={props.flipChildren}
          showModal={props.showModal}
        />
      </div>

      <p
        className="has-margin-top-10 has-text-grey-light"
        style={{ fontSize: "0.75rem" }}
      >
        {props.derivationDetails
          ? `Current Derivation: ${props.derivationDetails.id}`
          : "No Derivation selected."}
      </p>
    </>
  );
}

DerivationViewer.propTypes = {
  derivationDetails: PropTypes.object
};

DerivationViewer.defaultProps = {
  derivationDetails: null
};

/**
 * HOCs and React-redux binding
 */

let Wrapped = DerivationViewer;

Wrapped = GridItemWrapper(Wrapped);

const actionCreators = {
  selectChain,
  selectFrame,
  flipChildren,
  showModal
};

Wrapped = connect(
  createSelector({
    // Currently selected derivation
    derivationDetails,
    selectedChain: "derivationViewer.selectedChain",
    selectedFrame: "derivationViewer.selectedFrame",
    flippedChildren: "derivationViewer.flippedChildren"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
