import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { getGen } from "./Api";


const CounterGraph = () => {
  const [ids, setIds] = useState([] as any[]);
  const [network, setNetwork] = useState({} as any);
  const [nodes, setNodes] = useState([] as any[]);
  const [edges, setEdges] = useState([] as any[]);
  const [hasDrawn, setDrawn] = useState(false);

  const [nodesDataset] = useState(new Map());
  const [edgesDataset] = useState(new Map());

  useEffect(() => {
    getGen('gen8ubers').then(res => {
      setIds(res.map((x: any) => x[0]).sort());
      res.forEach((x: any) => {
        nodesDataset.set(x[0], {id: x[0], label: x[0]});
      });
      res.forEach((x: any) => {
        edgesDataset.set(x[0], x[1].map((y: any) => {
          return { from: y, to: x[0], hidden: true }
        }));
      })
      setNodes(Array.from(nodesDataset.values()));
      setEdges(Array.from(edgesDataset.values()).flat());
    });
  }, [nodesDataset, edgesDataset]);

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
      size: 20,
      shape: 'hexagon',
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
    for (const nodeId of nodeIds) {
      nodesDataset.set(nodeId, {
        id: nodeId,
        label: nodeId,
        color: hexCode,
      });
    }
    setNodes(Array.from(nodesDataset.values()));
  }

  const hideEdges = (edgeIds: string[], show: boolean = true) => {
    for (const edgeId of edgeIds) {
      network.updateEdge(edgeId, { hidden: show })
    }
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
        const connectedEdges = network.getConnectedEdges(node);
        hideEdges(connectedEdges, false);
      }
    },
    deselectNode: (event: any) => {
      const node = event.previousSelection.nodes[0].id;
      const allConnected = network.getConnectedNodes(node);
      recolorNodesTo([node, ...allConnected], '#97C2FC');
      const connectedEdges = network.getConnectedEdges(node);
      hideEdges(connectedEdges);
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