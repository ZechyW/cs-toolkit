/**
 * Main app component
 */
import React from "react";
import { Grid, GridItem } from "../../grid";
import { Navbar } from "../../navbar/";
import { LexicalArray } from "../../lexicalArray";

export const App = () => (
  <>
    <Navbar />
    <Grid>
      <GridItem
        title="Test"
        key="lexicalArray"
        data-grid={{ x: 0, y: 0, w: 12, h: 2 }}
      >
        <LexicalArray />
      </GridItem>
    </Grid>
  </>
);

export default App;
