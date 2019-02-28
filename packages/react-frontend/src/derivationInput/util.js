/**
 * Utility functions for the derivation input component
 */

/**
 * Turns a raw lexical item into a suggestion that can be used in the
 * derivation input array.
 * @param lexicalItem
 */
export function lexicalItemToSuggestion(lexicalItem) {
  return {
    id: `${lexicalItem.text}`,
    text: `${lexicalItem.text}`,
    label: `${lexicalItem.text} (${lexicalItem.language})`,
    language: lexicalItem.language,
    isValid: true
  };
}
