/**
 * Main app component
 * - Contains the header/footer and main UI grid definitions
 */
import React from "react";
import { DerivationInput } from "../../derivationInput";
import { DerivationsTable } from "../../derivations";
import { Grid, GridItem } from "../../grid";
import { LexicalItems } from "../../lexicalItems";
import { Navbar } from "../../navbar/";

import "../styles/ag-grid.scss";
import "../styles/theme.scss";

// Define grid items.
// The main content component for each grid item should be wrapped in
// GridItemWrapper so that the Grid will be informed of child
// updates/re-renders.
// The GridItemWrapper should be at the same level as the rest of the
// component's main props (i.e., usually the first HOC for the component) so
// that it can fire its layout effect when any of the props change.
const gridItems = [];

gridItems.push({
  id: "derivationInput",
  title: "Generate Derivations",
  expand: true,
  contents: <DerivationInput />
});

gridItems.push({
  id: "lexicalItemList",
  title: "Lexical Item List",
  expand: false,
  contents: <LexicalItems />
});

gridItems.push({
  id: "derivationStatusList",
  title: "Derivation Status",
  expand: false,
  contents: <DerivationsTable />
});

// function TestElement() {
//   return <div>Test</div>;
// }
// gridItems.push({
//   id: "wsEcho",
//   title: "WS Echo Test",
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
              expandContents={gridItem.expand}
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
