/**
 * Main app component
 * - Contains the header/footer and main UI grid definitions
 */
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import createSelector from "selectorator";
import { DerivationInput } from "../../derivationInput";
import { Derivations } from "../../derivations";
import { DerivationViewer } from "../../derivationViewer";
import { Grid, GridItem } from "../../grid";
import { LexicalItems } from "../../lexicalItems";
import { Navbar } from "../../navbar/";
import { Options } from "../../options";

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
  component: DerivationInput
});

gridItems.push({
  id: "lexicalItemList",
  title: "Lexical Item List",
  expand: false,
  component: LexicalItems
});

gridItems.push({
  id: "derivationStatusList",
  title: "Derivation Status",
  expand: false,
  component: Derivations
});

gridItems.push({
  id: "derivationViewer",
  title: "Derivation Viewer",
  expand: true,
  component: DerivationViewer
});

/**
 * Main app React component
 * @returns {*}
 * @constructor
 */
function App(props) {
  // Prepare to render visible grid items, removing disabled ones.
  const visibleGridItems = gridItems
    .filter((gridItem) => props.itemVisibility[gridItem.id])
    .map((gridItem) => {
      const ItemComponent = gridItem.component;

      return (
        <GridItem
          key={gridItem.id}
          id={gridItem.id}
          title={gridItem.title}
          expandContents={gridItem.expand}
        >
          <ItemComponent />
        </GridItem>
      );
    });

  // Invisible grid items should still be rendered, for their container side
  // effects, but should be invisible and outside the main Grid component.
  const invisibleGridItems = gridItems
    .filter((gridItem) => !props.itemVisibility[gridItem.id])
    .map((gridItem) => {
      const ItemComponent = gridItem.component;
      return (
        <div key={gridItem.id} style={{ display: "none" }}>
          <ItemComponent />
        </div>
      );
    });

  return (
    <>
      <Navbar />
      <Grid>{visibleGridItems}</Grid>
      {invisibleGridItems}
      <Options />
    </>
  );
}
App.propTypes = {
  itemVisibility: PropTypes.objectOf(PropTypes.bool).isRequired
};

/**
 * HOCs and React-redux binding
 */
let Wrapped = App;

Wrapped = connect(
  createSelector({
    itemVisibility: "core.itemVisibility"
  })
)(Wrapped);

export default Wrapped;
