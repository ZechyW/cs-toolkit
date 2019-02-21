/**
 * Main app component
 * - Contains the header/footer and main UI grid definitions
 */
import React from "react";
import { Grid, GridItem } from "../../grid";
import { LexicalArray } from "../../lexicalArray";
import { Navbar } from "../../navbar/";

// Define grid items
const gridItems = [];
gridItems.push({
  id: "lexicalArray",
  title: "Generate Derivations",
  contents: <LexicalArray />
});

// function TestElement() {
//   return <div>Test</div>;
// }
// gridItems.push({
//   id: "wsEcho",
//   title: "WS Echo Test",
//   contents: <TestElement />
// });
// gridItems.push({
//   id: "lexicalItemList",
//   title: "Lexical Item List",
//   contents: <TestElement />
// });

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
