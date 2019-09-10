import React from "react";
import Config from "../../config";

/**
 * Sub-component for rendering node labels
 * - Above the node position for non-terminal nodes.
 * - Below the node position for terminal nodes.
 * - (More-or-less) centred at the node position for trees with only one node.
 * @param props
 * @returns {*}
 * @constructor
 */
function DerivationTreeNodeLabel(props) {
  const { nodeData } = props;
  const isLeaf = !nodeData.children;
  const isPlaceholder = nodeData.placeholder;

  const labelStyle = {};
  // Figure out where to position the label
  if (isLeaf) {
    // Two possibilities: A non-terminal, or the only node in the tree.
    if (props["onlyNode"]) {
      // Only node
      labelStyle.top = `${Config.derivationTreeLabelSize.height / 2}px`;
    } else {
      // Non-terminal
      labelStyle.top = `${Config.derivationTreeLabelSize.height / 2}px`;
    }

    // Override: Manually position the label for now
    labelStyle.top = "-20px";
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

export default DerivationTreeNodeLabel;
