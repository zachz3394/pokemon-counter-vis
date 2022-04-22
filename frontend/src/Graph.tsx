import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { getGen } from "./Api";


const CounterGraph = () => {
  const [ids, setIds] = useState([] as any[]);
  const [network, setNetwork] = useState({} as any);
  const [nodes, setNodes] = useState([] as any[]);
  const [edges, setEdges] = useState([] as any[]);
  const [hasDrawn, setDrawn] = useState(false);

  useEffect(() => {
    getGen('gen8ubers').then(res => {
      setIds(res.map((x: any) => x[0]).sort());
      const nodes = res.map((x: any) => {
        return {id: x[0], label: x[0]}
      });
      setNodes(nodes);
      const edges = res.flatMap((x: any) => {
        return x[1].map((y: any) => {
          return { from: y, to: x[0] }
        });
      });
      setEdges(edges);
    });
  }, []);

  const options = {
    autoResize: true,
    layout: {
      improvedLayout: true,
      hierarchical: false,
    },
    edges: {
      color: '#000000',
    },
    height: '100%',
    width: '100%',
    physics: {
      enabled: false,
    },
    nodes: {
      shape: 'hexagon'
    }
  };

  const rearrangeToCircle = () => {
    const radius = 800;
    const d = 2 * Math.PI / ids.length
    ids.forEach(function(id, i) {
      var x = radius * Math.cos(d * i - 0.5 * Math.PI)
      var y = radius * Math.sin(d * i - 0.5 * Math.PI)
      network!.moveNode(id, x, y)
    });
    network.fit();
  }

  const resizeOnce = () => { 
    if(!hasDrawn) {
      rearrangeToCircle();
      network.off('afterDrawing', resizeOnce);
    }
  }

  const recolorNodesTo = (nodeIds: string[], hexCode: string) => {
    const set = new Set(nodeIds);
    setNodes((prevNodes: any) => 
      prevNodes.map((x: any) => {
        if (set.has(x.id)) {
          return {
            id: x.id,
            label: x.id,
            color: hexCode,
          }
        }
        return x;
      }),
    );
  }

  const events = {
    doubleClick: () => {
      rearrangeToCircle();
    },
    afterDrawing: resizeOnce,
    click: (event: any) => {
      setDrawn(true);
      if (event.nodes.length > 0) {
        const node = event.nodes[0];
        recolorNodesTo([node], '#f0fa51');

        const allConnected = network.getConnectedNodes(node);
        recolorNodesTo(allConnected, '#fa5151');

        const pointsTo = network.getConnectedNodes(node, 'to');
        recolorNodesTo(pointsTo, '#51fa8e');
      }
    },
    deselectNode: (event: any) => {
      const node = event.previousSelection.nodes[0].id;
      const allConnected = network.getConnectedNodes(node);
      recolorNodesTo([node, ...allConnected], '#97C2FC');
    },
  };
  return (
    <Graph
      graph={{nodes, edges}}
      options={options}
      events={events}
      getNetwork={(network: any) => {
        setNetwork(network)
      }}
    />
  );
}

export default CounterGraph