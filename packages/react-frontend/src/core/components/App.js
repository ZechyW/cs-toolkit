/**
 * Main app component
 * - Contains the header/footer and main UI grid definitions
 */
import React from "react";
import { Grid, GridItem } from "../../grid";
import { Navbar } from "../../navbar/";
import { LexicalArray } from "../../lexicalArray";

// Define grid items
const gridItems = [];

// Lexical array
gridItems.push({
  id: "lexicalArray",
  title: "Generate Derivations",
  contents: <LexicalArray />
});

/**
 * Main app React component
 * @returns {*}
 * @constructor
 */
function App() {
  return (
    <>
      <Navbar />
      <Grid>
        {gridItems.map((gridItem) => {
          return (
            <GridItem
              key={gridItem.id}
              id={gridItem.id}
              title={gridItem.title}
              expandContents={true}
            >
              {gridItem.contents}
            </GridItem>
          );
        })}
      </Grid>
    </>
  );
}

export default App;
