/**
 * Selectors for the detailed Derivation view
 */

import createSelector from "selectorator";

/**
 * Returns the actual selected Derivation object, or `null` if one isn't
 * selected.
 */
export const derivationDetails = createSelector(
  ["derivations.derivationsById", "derivations.selectedDerivation"],
  (derivationsById, selectedDerivation) => {
    const derivationDetails = derivationsById[selectedDerivation];
    if (!derivationDetails) {
      return null;
    } else {
      return derivationDetails;
    }
  }
);

/**
 * Returns all the chains in the selected derivation
 */
export const allChains = createSelector(
  [derivationDetails],
  (derivationDetails) => {
    if (!derivationDetails) return [];

    const allChains = [];
    let currentIndex = 0;

    // Converged chains
    // eslint-disable-next-line no-unused-vars
    for (const chain of derivationDetails["converged_chains"]) {
      allChains[currentIndex] = chain;
      currentIndex += 1;
    }

    // eslint-disable-next-line no-unused-vars
    for (const chain of derivationDetails["crashed_chains"]) {
      allChains[currentIndex] = chain;
      currentIndex += 1;
    }

    return allChains;
  }
);
