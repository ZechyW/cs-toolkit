/**
 * Selectors for the derivation tracking component
 */
import { format } from "date-fns";
import { forOwn } from "lodash-es";
import createSelector from "selectorator";
import Config from "../config";

/**
 * Pools data for DerivationRequests and their Derivations to present in
 * table form.
 */
export const getDerivationsAsList = createSelector(
  ["derivations.requestsById", "derivations.derivationsById"],
  (requestsById, derivationsById) => {
    // Each DerivationRequest is represented, even if the Derivation ids are
    // the same -- Other metadata like creation time will be different.
    const derivationList = [];

    forOwn(requestsById, (request) => {
      for (const derivationId of request.derivations) {
        const derivation = derivationsById[derivationId];

        if (derivation) {
          const derivationListItem = {
            id: `${request.id}:${derivation.id}`,
            lexicalArray: derivation.first_step,
            status: derivation.status,
            creationTime: format(
              new Date(request.creation_time),
              Config.timestampFormat
            )
          };

          derivationList.push(derivationListItem);
        }
      }
    });

    return derivationList;
  }
);
