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
