import React, {Component} from "react";
import DataProvider from "./DataProvider";
import Table from "./Table";

class App extends Component {
  render() {
    return (
      <div>
        <p className="title is-4">Lexical Items</p>
        <DataProvider endpoint="api/lexicon/"
                      render={data => <Table data={data}/>}/>
      </div>
    );
  }
}

export default App;
