/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { getCounterDataForGen } from "./readCounters";
import { Button, Drawer, Switch, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { DEFAULT, COUNTERED, COUNTERS, BORDER, SELECTED } from './colors';
import { genAliasMap, metaAliasMap, pokemonAliasMap } from "./aliases";

import '../node_modules/vis-network/dist/dist/vis-network.css';


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
  const [format, setFormat] = useState('gen8ou.json');
  const [hidden, setHidden] = useState(true);
  const [drawn, setDrawn] = useState(0);
  const [prevNodeId, setPrevNodeId] = useState(undefined as any);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const [nodesDataset] = useState(new Map());
  const [edgesDataset] = useState(new Map());
  const [reverseAliasMap] = useState(new Map());

  useEffect(() => {
    for (const [name, alias] of pokemonAliasMap.entries()) {
      reverseAliasMap.set(alias, name);
    }
  }, []);

  useEffect(() => {
    const counterData = getCounterDataForGen(format);

    nodesDataset.clear()
    edgesDataset.clear()

    counterData.forEach((counteredBy: string[], name: string) => {
      nodesDataset.set(name, {id: name, label: name });
      edgesDataset.set(name, counteredBy.map((counter: any) => {
        return { from: counter, to: name, hidden: hidden };
      }));
    });

    setIds(Array.from(counterData.keys()).sort());
    setNodes(Array.from(nodesDataset.values()));
    setEdges(Array.from(edgesDataset.values()).flat());
  }, [nodesDataset, edgesDataset, format, hidden]);

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

  const getOriginalName = (nodeId: string) => {
    return (reverseAliasMap.get(nodeId) || nodeId).replaceAll(' ', '-').toLowerCase();
  }

  const reconstructSmogonLink = (nodeId: string) => {
    const baseUrl = 'https://www.smogon.com/dex';
    const formatGen = format.substring(0, 4);
    const formatMeta = format.substring(4, format.indexOf('.'))
    const genCode = genAliasMap.get(formatGen);
    const metaCode = metaAliasMap.get(formatMeta);
    const pokemonCode = getOriginalName(nodeId);
    return `${baseUrl}/${genCode}/pokemon/${pokemonCode}/${metaCode}`;
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

  const updateEdges = (edgeIds: string[], show: boolean = true) => {
    for (const edgeId of edgeIds) {
      network.updateEdge(edgeId, { hidden: show, });
    }
  }

  const deselectNode = (nodeId: string) => {
    if (nodesDataset.has(nodeId)) {
      const allConnected = network.getConnectedNodes(nodeId);
      recolorNodesTo([nodeId, ...allConnected], DEFAULT);
      const connectedEdges = network.getConnectedEdges(nodeId);
      updateEdges(connectedEdges, hidden);
    }
  }

  const selectNode = (nodeId: string) => {
    recolorNodesTo([nodeId], SELECTED);
    const connectedFrom = network.getConnectedNodes(nodeId, 'from');
    recolorNodesTo(connectedFrom, COUNTERED);
    const pointsTo = network.getConnectedNodes(nodeId, 'to');
    recolorNodesTo(pointsTo, COUNTERS);
    const connectedEdges = network.getConnectedEdges(nodeId);
    updateEdges(connectedEdges, false);
  }

  const events = {
    afterDrawing: resizeOnce,
    click: (event: any) => {
      if (event.nodes.length > 0) {
        const node: string = event.nodes[0];
        selectNode(node);
        setDrawer(true);
        setPrevNodeId(node);
      }
    },
    deselectNode: (event: any) => {
      const node = event.previousSelection.nodes[0].id;
      deselectNode(node);
      setPrevNodeId(undefined);
      setDrawer(false);
    },
    dragStart: (event: any) => {
      if (event.nodes.length > 0) {
        const node: string = event.nodes[0];
        if (node !== prevNodeId) {
          deselectNode(prevNodeId);
          setDrawer(false);
        }
      }
    }
  };

  const handleChangeFormat = (event: SelectChangeEvent) => {
    setLoading(true);
    setFormat(event.target.value);
    setDrawn(0);
  }
  
  const handleChangeHidden = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setHidden(!event.target.checked);
  }

  const toggleDrawer =
    (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setDrawer(open);
    };
  
  const drawerContents = () => {
    if (prevNodeId) {
      const originalName = getOriginalName(prevNodeId);
      const connectedFrom = network.getConnectedNodes(prevNodeId, 'from');
      const connectedTo = network.getConnectedNodes(prevNodeId, 'to');
      const goodVs = connectedTo.sort().map((nodeId: string) => {
        return (<Typography>{nodeId}</Typography>);
      });
      const badVs = connectedFrom.sort().map((nodeId: string) => {
        return (<Typography>{nodeId}</Typography>);
      });
      return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '320px',
          padding: '32px 16px',
          gap: '24px',
        }}
      >
        <Typography variant='h4'>
          {prevNodeId}
        </Typography>
        <img alt={`${prevNodeId}.gif`} src={`https://www.smogon.com/dex/media/sprites/xy/${originalName}.gif`} />
        <Button variant='outlined' target='_blank' href={reconstructSmogonLink(prevNodeId)}>
          Smogon Analysis
        </Button>
        <div style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-around',
        }}>
          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
          }}>
            <Typography variant='h6'>
              Good vs:
            </Typography>
            {goodVs.length > 0 ? goodVs : <Typography variant='caption'>Missing Data</Typography>}
          </div>
          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
          }}>
            <Typography variant='h6'>
              Bad vs:
            </Typography>
            {badVs.length > 0 ? badVs : <Typography variant='caption'>Missing Data</Typography>}
          </div>
        </div>
      </div>
      )
    }
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
          onChange={handleChangeFormat}
          value={format}
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
      <Drawer
        anchor='right'
        variant='temporary'
        sx={{
          display: { xs: 'block', md: 'none' }
        }}
        open={drawer}
        onClose={toggleDrawer(false)}
      >
        {drawerContents()}
      </Drawer>
      <Drawer
        anchor='right'
        variant='persistent'
        sx={{
          display: { xs: 'none', md: 'block' },
        }}
        open={drawer}
        onClose={toggleDrawer(false)}
      >
        {drawerContents()}
      </Drawer>
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