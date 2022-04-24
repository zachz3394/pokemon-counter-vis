import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { getCounterDataForGen } from "./readCounters";
import { Button, Switch, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { DEFAULT, COUNTERED, COUNTERS, BORDER, SELECTED } from './colors';


const usageJsons = [
  'gen8anythinggoes.json',
  'gen8lc.json',
  'gen8nationaldex.json',
  'gen8nfe.json',
  'gen8ou.json',
  'gen8pu.json',
  'gen8ru.json',
  'gen8ubers.json',
  'gen8uu.json',
  'gen8zu.json',
];

const CounterGraph = () => {
  const [ids, setIds] = useState([] as any[]);
  const [network, setNetwork] = useState({} as any);
  const [nodes, setNodes] = useState([] as any[]);
  const [edges, setEdges] = useState([] as any[]);
  const [gen, setGen] = useState('gen8ou.json');
  const [hidden, setHidden] = useState(true);
  const [drawn, setDrawn] = useState(0);
  const [prevNodeId, setPrevNodeId] = useState(undefined as any);
  const [loading, setLoading] = useState(false);

  const [nodesDataset] = useState(new Map());
  const [edgesDataset] = useState(new Map());

  useEffect(() => {
    const counterData = getCounterDataForGen(gen);

    nodesDataset.clear()
    edgesDataset.clear()

    counterData.forEach((counteredBy: string[], name: string) => {
      nodesDataset.set(name, {id: name, label: name});
      edgesDataset.set(name, counteredBy.map((counter: any) => {
        return { from: counter, to: name, hidden: hidden }
      }));
    });

    setIds(Array.from(counterData.keys()).sort());
    setNodes(Array.from(nodesDataset.values()));
    setEdges(Array.from(edgesDataset.values()).flat());
  }, [nodesDataset, edgesDataset, gen, hidden]);

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
    setLoading(false);
    if (drawn < 5) {
      rearrangeToCircle();
      setDrawn((prev: number) => prev + 1);
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
      network.updateEdge(edgeId, { hidden: show });
    }
  }

  const deselectNode = (nodeId: string) => {
    if (nodesDataset.has(nodeId)) {
      const allConnected = network.getConnectedNodes(nodeId);
      recolorNodesTo([nodeId, ...allConnected], DEFAULT);
      const connectedEdges = network.getConnectedEdges(nodeId);
      hideEdges(connectedEdges, hidden);
    }
  }

  const selectNode = (nodeId: string) => {
    recolorNodesTo([nodeId], SELECTED);
    const allConnected = network.getConnectedNodes(nodeId);
    recolorNodesTo(allConnected, COUNTERED);
    const pointsTo = network.getConnectedNodes(nodeId, 'to');
    recolorNodesTo(pointsTo, COUNTERS);
    const connectedEdges = network.getConnectedEdges(nodeId);
    hideEdges(connectedEdges, false);
  }

  const events = {
    afterDrawing: resizeOnce,
    click: (event: any) => {
      if (event.nodes.length > 0) {
        const node: string = event.nodes[0];
        selectNode(node);
        setPrevNodeId(node);
      }
    },
    deselectNode: (event: any) => {
      const node = event.previousSelection.nodes[0].id;
      deselectNode(node);
      setPrevNodeId(undefined);
    },
    dragStart: (event: any) => {
      if (event.nodes.length > 0) {
        const node: string = event.nodes[0];
        if (node !== prevNodeId) {
          deselectNode(prevNodeId);
        }
      }
    }
  };

  const handleChangeUsage = (event: SelectChangeEvent) => {
    setLoading(true);
    setGen(event.target.value);
    setDrawn(0);
  }
  
  const handleChangeHidden = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setHidden(!event.target.checked);
  }

  return (
    <div style={{height: '100%', width: '100%'}}>
      <div
        style={{
          zIndex: 2,
          position: 'absolute',
          height: '100%',
          width: '100%',
          backgroundColor: 'black',
          opacity: '30%',
          color: 'white',
          textAlign: 'center',
        }}
        hidden={!loading}
      >
        Loading...
      </div>
      <div
        style={{
          position: 'absolute',
          left: '64px',
          top: '64px',
          height: '192px',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          backgroundColor: DEFAULT,
          padding: '8px 16px 0px',
          borderRadius: '5px',
          color: BORDER,
          borderStyle: 'solid',
          borderWidth: '2px',
          borderColor: BORDER,
        }}
      >
        <Select 
          autoWidth
          onChange={handleChangeUsage}
          value={gen}
          style={{
            backgroundColor: 'white',
          }}
        >
          {
            usageJsons.map((usage: string) =>
              <MenuItem value={usage} key={usage}>
                {usage.substring(0, usage.indexOf('.'))}
              </MenuItem>
            )
          }
        </Select>
        <Button 
          onClick={rearrangeToCircle}
          variant='contained'
        >
          Reset Node Positions
        </Button>
        <div>
          Show Edges:
          <Switch
            color='default'
            disabled={loading}
            checked={!hidden}
            onChange={handleChangeHidden}
          />
        </div>
      </div>
      <Graph
        graph={{nodes, edges}}
        options={options}
        events={events}
        getNetwork={(network: any) => {
          setNetwork(network)
        }}
      />
    </div>
  );
}

export default CounterGraph