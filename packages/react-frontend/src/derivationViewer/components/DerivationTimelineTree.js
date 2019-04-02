import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import RcSlider from "rc-slider";
import "rc-slider/assets/index.css";
import React, { useRef } from "react";
import Tree from "react-d3-tree";
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
  if (props.chain === null) return null;

  /** @type React.RefObject */
  const sliderRef = useRef(null);

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Tree view
  let { root_so } = props.chain[props.selectedFrame];
  if (!root_so) {
    // The root SyntacticObject will be null at the very first step of the
    // chain -- Set a placeholder instead.
    root_so = {
      placeholder: true,
      name: "No syntactic object built yet."
    };
  }

  /**
   * Sub-component for rendering node labels
   * - Above the node position for non-terminal nodes.
   * - Below the node position for terminal nodes.
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
      labelStyle.top = "58px";
    } else {
      labelStyle.bottom = "58px";
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

          <div className="field has-addons has-margin-left-10">
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

        <div
          id="treeWrapper"
          style={{ width: "300px", height: "300px", border: "1px solid #aaa" }}
        >
          <Tree
            data={root_so}
            collapsible={false}
            orientation="vertical"
            pathFunc="straight"
            allowForeignObjects
            nodeLabelComponent={{
              render: <NodeLabel className="myLabelComponentInSvg" />,
              foreignObjectWrapper: {
                x: -58,
                y: -58
              }
            }}
            nodeSvgShape={{ shape: "none" }}
            translate={{ x: 150, y: 75 }}
          />
        </div>

        {/*<pre>*/}
        {/*  <code>*/}
        {/*    {JSON.stringify(props.chain[props.selectedFrame], null, 2)}*/}
        {/*  </code>*/}
        {/*</pre>*/}
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
