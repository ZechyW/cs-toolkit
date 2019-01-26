/**
 * Renders the given data as an HTML table
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import key from "weak-key";

class Table extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    tableClass: PropTypes.string,
    containerStyle: PropTypes.object
  };

  static defaultProps = {
    tableClass: ""
  };

  render() {
    const { data } = this.props;

    let content;

    if (!data.length) {
      content = <h2 className="subtitle">Table has no data.</h2>;
    } else {
      content = (
        <div style={this.props.containerStyle}>
          <h2 className="subtitle">
            Showing <strong>{data.length} items</strong>
          </h2>
          <table className={"table is-striped " + this.props.tableClass}>
            <thead>
              <tr>
                {Object.entries(data[0]).map((el) => (
                  <th key={key(el)}>{el[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((el) => (
                <tr key={"tr-" + key(el)}>
                  {Object.entries(el).map((el) => (
                    <td key={key(el)}>{el[1]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <div className="column">{content}</div>;
  }
}

export default Table;
