import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { hierarchy } from "d3-hierarchy";
import { cloneDeep, isEmpty } from "lodash-es";
import PropTypes from "prop-types";
import RcSlider from "rc-slider";
import "rc-slider/assets/index.css";
import React, { useLayoutEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import Config from "../../config";
import "../styles/DerivationTimelineTree.scss";

library.add(faAngleLeft, faAngleRight);

const createSliderWithTooltip = RcSlider.createSliderWithTooltip;
const Slider = createSliderWithTooltip(RcSlider);

/**
 * Component for rendering tree views of individual Derivation chains, with
 * built-in timeline exploration functionality.
 * @param props
 * @returns {null|*}
 * @constructor
 */
function DerivationTimelineTree(props) {
  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // React Hooks

  // Ref for the slider UI element
  /** @type React.RefObject */
  const sliderRef = useRef(null);

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
  }, [props.chain, props.selectedFrame]);

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Sanity checks on render
  if (props.chain === null || props.selectedFrame === null) return null;
  if (props.selectedFrame >= props.chain.length || props.selectedFrame === -1)
    return null;

  const thisFrame = props.chain[props.selectedFrame];

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
    let child;
    for (child of node.children) {
      findAndFlip(child);
    }
  }
  if (!root_so.placeholder) {
    findAndFlip(root_so);
  }

  // Calculate a reasonable size for the tree view container
  const treeContainerHeight =
    Config.derivationTreeNodeSize.y * treeData.height +
    Config.derivationTreeLabelSize.height * 2;

  /**
   * Sub-component for rendering node labels
   * - Above the node position for non-terminal nodes.
   * - Below the node position for terminal nodes.
   * - (More-or-less) centred at the node position for trees with only one node.
   * @param props
   * @returns {*}
   * @constructor
   */
  function NodeLabel(props) {
    const { nodeData } = props;
    const isLeaf = !nodeData.children;
    const isPlaceholder = nodeData.placeholder;

    const labelStyle = {};
    // Figure out where to position the label
    if (isLeaf) {
      // Two possibilities: A non-terminal, or the only node in the tree.
      if (treeData.height) {
        // Non-terminal
        labelStyle.top = `${Config.derivationTreeLabelSize.height}px`;
      } else {
        // Only node
        labelStyle.top = `${Config.derivationTreeLabelSize.height / 2}px`;
      }
    } else {
      labelStyle.bottom = `0`;
    }

    let labelContents;
    if (isPlaceholder) {
      // Placeholder text is in obligatory `.name` property
      labelContents = nodeData.name;
    } else {
      // Pull raw data from node
      const {
        text,
        current_language,
        is_copy,
        feature_string,
        deleted_feature_string
      } = nodeData;
      labelContents = (
        <div
          style={{
            opacity: is_copy ? "0.5" : "1"
          }}
        >
          <span className="has-text-weight-bold	">{text} </span>(
          <span className="is-italic">{current_language}</span>)
          {feature_string ? (
            <>
              <br /> <span>{feature_string}</span>
            </>
          ) : (
            ""
          )}
          {deleted_feature_string ? (
            <>
              <br />
              <span
                style={{ textDecoration: "line-through" }}
                className="has-text-grey-light"
              >
                {deleted_feature_string}
              </span>
            </>
          ) : (
            ""
          )}
        </div>
      );
    }

    return (
      <div className="has-text-centered node-label" style={labelStyle}>
        {labelContents}
      </div>
    );
  }

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Details view
  const {
    status,
    lexical_array_tail,
    crash_reason,
    rule_errors,
    generator_metadata
  } = thisFrame;

  // Lexical array tail
  let lexical_array_repr;
  if (lexical_array_tail.length > 0) {
    lexical_array_repr = lexical_array_tail.map((lexicalItem, index) => (
      <span key={lexicalItem.id}>
        {index ? ", " : ""}
        <span className="is-italic">{lexicalItem.text}</span> (
        {lexicalItem.language}) {lexicalItem.features}
      </span>
    ));
  } else {
    lexical_array_repr = <span className="is-italic">None</span>;
  }

  const detailsView = (
    <>
      <div>
        <span className="has-text-weight-bold">Step status:</span> {status}
      </div>

      <div>
        <span className="has-text-weight-bold">Lexical array tail:</span>{" "}
        {lexical_array_repr}
      </div>

      {crash_reason ? (
        <div>
          <span className="has-text-weight-bold">Crash reason:</span>{" "}
          {crash_reason}
        </div>
      ) : (
        ""
      )}

      {rule_errors.length > 0 ? (
        <div>
          <span className="has-text-weight-bold">Rule messages:</span>{" "}
          <ul style={{ listStyle: "disc outside", marginLeft: "2em" }}>
            {rule_errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      ) : (
        ""
      )}

      {!isEmpty(generator_metadata) ? (
        <div>
          <span className="has-text-weight-bold">Generator Metadata:</span>{" "}
          <ul style={{ listStyle: "disc outside", marginLeft: "2em" }}>
            {Object.entries(generator_metadata).map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        ""
      )}
    </>
  );

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Event handlers
  /**
   * The timeline slider value changed.
   * @param value
   */
  function handleChange(value) {
    props.selectFrame(value);
  }

  /**
   * When a node in the tree is clicked
   * @param nodeData
   * @param event
   */
  function nodeClick(nodeData, event) {
    props.flipChildren(nodeData);
  }

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Main Render
  return (
    <>
      <div className="has-margin-top-10">
        <p>{props.title}</p>

        <div
          className="field is-grouped justify-space-between align-items-center"
          ref={sliderRef}
        >
          <Slider
            min={0}
            max={props.chain.length - 1}
            value={props.selectedFrame}
            onChange={handleChange}
          />

          <div className="field has-addons has-margin-left-20">
            <div className="control">
              <button
                className="button"
                disabled={props.selectedFrame === 0}
                onClick={() => {
                  props.selectFrame(props.selectedFrame - 1);
                  sliderRef.current.querySelector(".rc-slider-handle").focus();
                }}
              >
                <span className="icon">
                  <i className="fas fa-angle-left" />
                </span>
              </button>
            </div>
            <div className="control">
              <button
                className="button"
                disabled={props.selectedFrame === props.chain.length - 1}
                onClick={() => {
                  props.selectFrame(props.selectedFrame + 1);
                  sliderRef.current.querySelector(".rc-slider-handle").focus();
                }}
              >
                <span className="icon">
                  <i className="fas fa-angle-right" />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-row">
          <div
            id="treeWrapper"
            style={{
              height: `${treeContainerHeight}px`,
              border: "1px solid #aaa",
              flexGrow: "1"
            }}
            ref={treeContainer}
          >
            <Tree
              data={root_so}
              nodeSvgShape={{ shape: "none" }}
              nodeLabelComponent={{
                render: <NodeLabel className="myLabelComponentInSvg" />,
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
                y: Config.derivationTreeLabelSize.height
              }}
              pathFunc="straight"
              collapsible={false}
              scaleExtent={{ min: 0.5, max: 1.25 }}
              nodeSize={Config.derivationTreeNodeSize}
              transitionDuration={0}
              allowForeignObjects
              onClick={nodeClick}
            />
          </div>

          <div
            className="has-margin-left-20"
            style={{ width: "30%", flexShrink: "1" }}
          >
            {detailsView}
            <pre style={{ fontSize: "0.7rem", display: "none" }}>
              <code>
                {JSON.stringify(props.chain[props.selectedFrame], null, 2)}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}

DerivationTimelineTree.propTypes = {
  title: PropTypes.string.isRequired,
  chain: PropTypes.array,
  selectedFrame: PropTypes.number.isRequired,
  flippedChildren: PropTypes.object.isRequired,

  selectFrame: PropTypes.func.isRequired,
  flipChildren: PropTypes.func.isRequired
};

DerivationTimelineTree.defaultProps = {
  chain: null
};

export default DerivationTimelineTree;
