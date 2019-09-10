/**
 * Utility functions for the derivation input component
 */
import Config from "../config";

/**
 * Turns a raw lexical item into a suggestion that can be used in the
 * derivation input array.
 *
 * Note that the backend only cares about `text` and `language`;
 * `id`, `label` and `isValid` are used for display/validation by the
 * DerivationInput component.
 *
 * Special system-use lexical items will not have their language displayed
 * in the label.
 * @param lexicalItem
 */
export function lexicalItemToSuggestion(lexicalItem) {
  let label;
  if (lexicalItem.language === Config.sysLanguage) {
    label = lexicalItem.text;
  } else {
    label = `${lexicalItem.text} (${lexicalItem.language})`;
  }

  return {
    text: `${lexicalItem.text}`,
    language: lexicalItem.language,

    id: `${lexicalItem.text}`,
    label,
    isValid: true
  };
}
