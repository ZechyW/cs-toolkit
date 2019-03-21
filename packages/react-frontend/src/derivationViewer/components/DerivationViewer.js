import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";
import { GridItemWrapper } from "../../grid";

/**
 * Component for viewing individual Derivation chain trees.
 * The heavy lifting is done by the main Derivation tracker -- We just pull
 * the relevant information from its store and display visualisations for
 * the derivational chains.
 * @param props
 * @constructor
 */
function DerivationViewer(props) {
  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Helper functions

  /**
   * Render the list of chains for the currently selected Derivation, if any
   */
  function renderChains() {
    if (!props.selectedDerivation) {
      return "No Derivation selected.";
    }

    const converged_chains = props.derivationsById[props.selectedDerivation][
      "converged_chains"
    ].map((chain, id) => (
      <div className="has-margin-5" key={id}>
        <p>Chain {id} (converged)</p>
        <pre>
          <code>{JSON.stringify(chain, null, 2)}</code>
        </pre>
      </div>
    ));

    const crashed_chains = props.derivationsById[props.selectedDerivation][
      "crashed_chains"
    ].map((chain, id) => (
      <div className="has-margin-5" key={id}>
        <p>Chain {id} (converged)</p>
        <pre>
          <code>{JSON.stringify(chain, null, 2)}</code>
        </pre>
      </div>
    ));

    return (
      <div>
        {converged_chains}
        {crashed_chains}
      </div>
    );
  }

  return (
    <>
      <p className="has-margin-bottom-10">
        Select a derivation in the Derivation Status widget to show its chains
        here.
      </p>

      <p className="has-margin-bottom-10">
        Currently selected Derivation:{" "}
        {props.selectedDerivation || "No Derivation selected."}
      </p>

      <div className="has-margin-bottom-10">
        Derivational chains: {renderChains()}
      </div>
    </>
  );
}

DerivationViewer.propTypes = {
  selectedDerivation: PropTypes.string
};

DerivationViewer.defaultProps = {
  selectedDerivation: null
};

/**
 * HOCs and React-redux binding
 */

let Wrapped = DerivationViewer;

Wrapped = GridItemWrapper(Wrapped);

const actionCreators = {};

Wrapped = connect(
  createSelector({
    // Currently selected derivation
    selectedDerivation: "derivations.selectedDerivation",

    // All derivations
    derivationsById: "derivations.derivationsById"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
