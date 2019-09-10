import classNames from "classnames";
import { hierarchy } from "d3-hierarchy";
import { cloneDeep } from "lodash-es";
import React, { useLayoutEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import { connect } from "react-redux";
import createSelector from "selectorator";

import Config from "../../config";
import { flipChildren, hideModal } from "../actions";
import { allChains } from "../selectors";
import DerivationTreeNodeLabel from "./DerivationTreeNodeLabel";

/**
 * Modal view for the selected derivation's tree
 * TODO: DRY this out, big time
 * @param props
 * @return {null|*}
 * @constructor
 */
function DerivationTreeModal(props) {
  const chain = props.allChains[props.selectedChain];

  // Hooks
  // For centring the tree view
  const [translateX, setTranslateX] = useState(0);
  /** @type React.RefObject */
  const treeContainer = useRef(null);
  useLayoutEffect(() => {
    // N.B.: Dynamically reading the tree SVG's width may be inaccurate
    // because of the animations. Just snap the tree to the middle (-ish,
    // one-third of the width from the left) for now.
    if (treeContainer.current) {
      let offset = treeContainer.current.offsetWidth / 3;
      setTranslateX(offset);
    }

    // // We have a reference to the <div> containing the tree.
    // const containerWidth = treeContainer.current.offsetWidth;
    //
    // // Get the actual bounding box of the tree SVG and figure out where
    // // the centre should be.
    // const treeSvgBbox = treeContainer.current.querySelector("svg").getBBox();
    //
    // let offset = (containerWidth - treeSvgBbox.width) / 2;
    //
    // // If the offset is negative, the tree is wider than its container.
    // // Have at least the left edge of the tree visible.
    // offset = Math.max(offset, 0);
    //
    // // The centre of the root node starts at (0,0), so the tree will initially
    // // expand into the negative x direction.  Account for this and set the
    // // final offset.
    // offset +=
    //   (Config.derivationTreeNodeSize.x + Config.derivationTreeLabelSize.width) /
    //   2;
    // setTranslateX(offset);
  }, [chain, props.selectedFrame, treeContainer.current]);

  // Detect Esc key presses
  useLayoutEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        props.hideModal();
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [props]);

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Sanity checks on render
  if (chain === null || props.selectedFrame === null) return null;
  if (props.selectedFrame >= chain.length || props.selectedFrame === -1)
    return null;

  const thisFrame = chain[props.selectedFrame];

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Tree view pre-processing
  let root_so;
  if (!thisFrame["root_so"]) {
    // The root SyntacticObject will be null at the very first step of the
    // chain -- Set a placeholder instead.
    root_so = {
      placeholder: true,
      name: "No syntactic object built yet."
    };
  } else {
    // If it is available, clone the `root_so` so we can mutate it in
    // the display component.
    root_so = cloneDeep(thisFrame["root_so"]);
  }

  // Use the `d3-hierarchy` package as a utility library for dealing with
  // the SyntacticObject data
  const treeData = hierarchy(root_so);

  // Save the original SyntacticObject ID for each node; `react-d3-tree`
  // replaces it with a UUID.
  // Use a breadth-first search to determine which nodes should have their
  // children displayed in reverse order by referring to their
  // SyntacticObject IDs.
  function findAndFlip(node) {
    // Save original id
    node.cstk_id = node.id;

    // Check for flipping
    if (props.flippedChildren[node.id]) {
      node.children = node.children.reverse();
    }
    // eslint-disable-next-line no-unused-vars
    for (const child of node.children) {
      findAndFlip(child);
    }
  }
  if (!root_so.placeholder) {
    findAndFlip(root_so);
  }

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Event handlers

  /**
   * When a node in the tree is clicked
   * @param nodeData
   * @param event
   */
  function handleNodeClick(nodeData, event) {
    props.flipChildren(nodeData);
  }

  return (
    <div
      className={classNames("modal", {
        "is-active": props.treeModalActive
      })}
    >
      <div
        className="modal-background"
        onClick={() => {
          props.hideModal();
        }}
      />
      <div
        className="modal-content"
        style={{ width: "90vw", height: "90vh", overflow: "visible" }}
      >
        <div
          id="treeWrapper"
          style={{
            height: `100%`,
            backgroundColor: "white",
            flexGrow: "1"
          }}
          ref={treeContainer}
        >
          <Tree
            data={root_so}
            nodeSvgShape={{ shape: "none" }}
            nodeLabelComponent={{
              render: (
                <DerivationTreeNodeLabel
                  className="myLabelComponentInSvg"
                  onlyNode={!treeData.height}
                />
              ),
              foreignObjectWrapper: {
                x: -Config.derivationTreeLabelSize.width / 2,
                y: -Config.derivationTreeLabelSize.height,
                width: Config.derivationTreeLabelSize.width,
                height: Config.derivationTreeLabelSize.height,
                style: { overflow: "visible" }
              }
            }}
            orientation="vertical"
            translate={{
              x: translateX,
              // Set a sane default for now
              y: 200
            }}
            pathFunc="straight"
            collapsible={false}
            scaleExtent={{ min: 0.5, max: 2.5 }}
            zoom={1.25}
            nodeSize={Config.derivationTreeNodeSize}
            separation={{ siblings: 1, nonSiblings: 0.9 }}
            transitionDuration={0}
            allowForeignObjects
            onClick={handleNodeClick}
          />
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => {
          props.hideModal();
        }}
      />
    </div>
  );
}

/**
 * HOCs and React-redux binding
 */
let Wrapped = DerivationTreeModal;

const actionCreators = {
  // Show/hide the tree view modal itself
  hideModal,

  flipChildren
};

Wrapped = connect(
  createSelector({
    // Show/hide the options modal itself
    treeModalActive: "derivationViewer.treeModalActive",

    allChains,
    selectedChain: "derivationViewer.selectedChain",
    selectedFrame: "derivationViewer.selectedFrame",
    flippedChildren: "derivationViewer.flippedChildren"
  }),
  actionCreators
)(Wrapped);

export default Wrapped;
