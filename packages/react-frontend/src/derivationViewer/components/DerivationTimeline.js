import PropTypes from "prop-types";
import RcSlider from "rc-slider";
import "rc-slider/assets/index.css";
import React from "react";

const createSliderWithTooltip = RcSlider.createSliderWithTooltip;
const Slider = createSliderWithTooltip(RcSlider);

/**
 * Component for rendering tree views of individual Derivation chains, with
 * built-in timeline exploration functionality.
 * @param props
 * @returns {*}
 * @constructor
 */
function DerivationTimeline(props) {
  if (props.chain === null) return null;

  // -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,_
  // Event handlers
  /**
   * The timeline slider value changed.
   * @param value
   */
  function handleChange(value) {
    props.selectFrame(value);
  }

  return (
    <>
      <p>{props.title}</p>
      <pre>
        <code>{JSON.stringify(props.chain[props.selectedFrame], null, 2)}</code>
      </pre>
      <Slider
        min={0}
        max={props.chain.length - 1}
        value={props.selectedFrame}
        onChange={handleChange}
      />
      <p className="has-text-grey-light">
        {JSON.stringify(props.chain, null, 2)}
      </p>
    </>
  );
}

DerivationTimeline.propTypes = {
  title: PropTypes.string.isRequired,
  chain: PropTypes.array,
  selectedFrame: PropTypes.number.isRequired,
  selectFrame: PropTypes.func.isRequired
};

DerivationTimeline.defaultProps = {
  chain: null
};

export default DerivationTimeline;
