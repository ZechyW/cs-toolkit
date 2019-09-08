import { getSuggestions } from "./selectors";

describe("The suggestion list selector", () => {
  it("deduplicates suggestions and adds sub-array square brackets", () => {
    expect(
      getSuggestions({
        lexicalItems: {
          lexicalItemsById: {
            0: { text: "word", language: "en" },
            1: { text: "word", language: "en_SG" },
            2: { text: "word", language: "en" }
          }
        }
      })
    ).toEqual([
      {
        id: "word",
        text: "word",
        label: "word (en)",
        language: "en",
        isValid: true
      },
      {
        id: "word",
        text: "word",
        label: "word (en_SG)",
        language: "en_SG",
        isValid: true
      },
      {
        id: "[",
        isValid: true,
        label: "[",
        language: "<SYS>",
        text: "["
      },
      {
        id: "]",
        isValid: true,
        label: "]",
        language: "<SYS>",
        text: "]"
      }
    ]);
  });
});
