import { replaceSuggestions } from "./actions";
import reducer from "./reducer";

describe("The lexicalArrayInput reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual({
      suggestions: [],
      lexicalArray: []
    });
  });

  it("should deduplicate suggestions", () => {
    expect(
      reducer(
        { suggestions: [] },
        replaceSuggestions([
          { text: "word", language: "en" },
          { text: "word", language: "en_SG" },
          { text: "word", language: "en" }
        ])
      )
    ).toEqual({
      suggestions: [
        { id: "word", label: "word (en)", language: "en", text: "word" },
        { id: "word", label: "word (en_SG)", language: "en_SG", text: "word" }
      ]
    });
  });
});
