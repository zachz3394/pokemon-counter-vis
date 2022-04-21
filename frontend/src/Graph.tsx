import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { getGen } from "./Api";


const CounterGraph = () => {
  const [pending, setPending] = useState(false);
  const [graph, setGraph] = useState({
    nodes: [
      { id: 1, label: "Node 1", title: "node 1 tootip text" },
      { id: 2, label: "Node 2", title: "node 2 tootip text" },
      { id: 3, label: "Node 3", title: "node 3 tootip text" },
      { id: 4, label: "Node 4", title: "node 4 tootip text" },
      { id: 5, label: "Node 5", title: "node 5 tootip text" }
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 }
    ]
  });

  useEffect(() => {
    setPending(true);
    getGen('gen8ubers').then(res => {
      console.log(res)
      const nodes = res.map((x: any) => {
        return {id: x[0], label: x[0]}
      });
      const edges = res.flatMap((x: any) => {
        return x[1].map((y: any) => {
          return { from: y, to: x[0]}
        });
      });
      setGraph({edges, nodes})

      setPending(false);
    });
  }, []);

  const options = {
    layout: {
      hierarchical: false
    },
    edges: {
      color: "#000000"
    },
    height: "500px"
  };

  const events = {
    select: function(event: any) {
      var { nodes, edges } = event;
    }
  };
  return (
    <Graph
      graph={graph}
      options={options}
      events={events}
    />
  );
}

export default CounterGraph