import PropTypes from "prop-types";
import RcSlider from "rc-slider";
import "rc-slider/assets/index.css";
import React, { useRef } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

library.add(faAngleLeft, faAngleRight);

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

  const sliderRef = useRef(null);

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
      <div className="has-margin-bottom-10">
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

        <pre>
          <code>
            {JSON.stringify(props.chain[props.selectedFrame], null, 2)}
          </code>
        </pre>
      </div>
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
