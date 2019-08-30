/**
 * Utility functions for the derivation input component
 */

/**
 * Turns a raw lexical item into a suggestion that can be used in the
 * derivation input array.
 *
 * Note that the backend only cares about `text` and `language`;
 * `id`, `label` and `isValid` are used for display/validation by the
 * DerivationInput component.
 * @param lexicalItem
 */
export function lexicalItemToSuggestion(lexicalItem) {
  return {
    text: `${lexicalItem.text}`,
    language: lexicalItem.language,

    id: `${lexicalItem.text}`,
    label: `${lexicalItem.text} (${lexicalItem.language})`,
    isValid: true
  };
}
