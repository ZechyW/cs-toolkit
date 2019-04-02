import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { hierarchy } from "d3-hierarchy";
import PropTypes from "prop-types";
import RcSlider from "rc-slider";
import "rc-slider/assets/index.css";
import React, { useRef, useState, useEffect } from "react";
import Tree from "react-d3-tree";
import "../styles/DerivationTimelineTree.scss";
import Config from "../../config";

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
  if (props.chain === null) return null;
  const thisFrame = props.chain[props.selectedFrame];

  /** @type React.RefObject */
  const sliderRef = useRef(null);

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Tree view
  let { root_so } = thisFrame;
  if (!root_so) {
    // The root SyntacticObject will be null at the very first step of the
    // chain -- Set a placeholder instead.
    root_so = {
      placeholder: true,
      name: "No syntactic object built yet."
    };
  }

  // Use the `d3-hierarchy` package as a utility library for dealing with
  // the SyntacticObject data
  const treeData = hierarchy(root_so);

  // Calculate a reasonable size for the tree view container
  const treeContainerHeight =
    Config.derivationTreeNodeSize.y * treeData.height +
    Config.derivationTreeLabelSize.height * 2;

  // For centering the tree view
  const [treeWidth, setTreeWidth] = useState(0);
  /** @type React.RefObject */
  const treeContainer = useRef(null);
  useEffect(() => {
    if (treeContainer.current) {
      setTreeWidth(treeContainer.current.offsetWidth);
    }
  });

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

    const labelStyle = {
      fontSize: "0.8rem",
      backgroundColor: "white",
      position: "absolute",
      width: "100%"
    };
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
      const { text, current_language, feature_string } = nodeData.value;
      labelContents = (
        <>
          <span className="has-text-weight-bold	">{text} </span>(
          <span className="is-italic">{current_language}</span>)
          <br />
          <span>{feature_string}</span>
        </>
      );
    }

    return (
      <div className="has-text-centered" style={labelStyle}>
        {labelContents}
      </div>
    );
  }

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Details view
  const { status, lexical_array_tail } = thisFrame;
  const detailsView = (
    <>
      <div>
        <span className="has-text-weight-bold">Step status:</span> {status}
      </div>
      <div>
        <span className="has-text-weight-bold">Lexical array tail:</span>{" "}
        {lexical_array_tail.map((lexicalItem, index) => (
          <span key={lexicalItem.id}>
            {index ? ", " : ""}
            <span className="is-italic">{lexicalItem.text}</span> (
            {lexicalItem.language}) {lexicalItem.features}
          </span>
        ))}
      </div>
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
              width: "70%",
              height: `${treeContainerHeight}px`,
              border: "1px solid #aaa"
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
                x: treeWidth / 2,
                y: Config.derivationTreeLabelSize.height
              }}
              pathFunc="straight"
              collapsible={false}
              scaleExtent={{ min: 0.5, max: 1.25 }}
              nodeSize={Config.derivationTreeNodeSize}
              allowForeignObjects
            />
          </div>

          <div
            className="has-margin-left-20"
            style={{ flexGrow: "1", flexShrink: "1" }}
          >
            {detailsView}
            <pre style={{ fontSize: "0.7rem" }}>
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
  selectFrame: PropTypes.func.isRequired
};

DerivationTimelineTree.defaultProps = {
  chain: null
};

export default DerivationTimelineTree;
