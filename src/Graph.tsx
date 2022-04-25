/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { getCounterDataForGen } from "./readCounters";
import { IconButton,
  Button,
  Drawer,
  Switch,
  Link,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DEFAULT, COUNTERED, COUNTERS, BORDER, SELECTED } from './colors';
import { genAliasMap, metaAliasMap, pokemonAliasMap } from "./aliases";
import { useTheme } from '@mui/material/styles';

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
  const [modal, setModal] = useState(true);
  const theme = useTheme();
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('md'));

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
      shape: 'dot',
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

  const handleOpenModal = () => setModal(true);

  const handleCloseModal = () => setModal(false);

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
      console.log('toggled')
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

  const modalContents = () => {
    return (
      <div>
        <Typography variant='h6'>
          Overview
        </Typography>
        <Typography variant='body2' gutterBottom>
          This is a rough draft of a website created to visualize checks and counters between the Pokemon in each competitive metagame, as judged by Smogon analyses.
        </Typography>

        <Typography variant='h6'>
          How to Use
        </Typography>
        <Typography variant='body2' gutterBottom>
          Click on a Pokemon to display its counters, along with the Pokemon that it counters. Pokemon that are countered by the currently selected Pokemon are colored in green, and Pokemon that counter the currently selected Pokemon are colored in red. Please read the disclaimer below regarding potentially erroneous/confusing interactions between pairs of Pokemon that appear to counter each other.

          Clicking on a Pokemon also opens a sidebar, which displays the counter information for that Pokemon. This sidebar also contains a link to the Smogon analysis page for that Pokemon, which is the source from which the Checks and Counters data were generated.
        </Typography>

        <Typography variant='h6'>
          Methods
        </Typography>
        <Typography variant='body2'>
          The data was extracted from the Checks and Counters section from Smogon's analyses, located at {<Link target='_blank' href='https://github.com/pkmn/smogon'>https://github.com/pkmn/smogon</Link>}. While the analyses in this repository are updated regularly, the current iteration of this website uses static analysis files.

          A Pokemon is considered to be countered by any Pokemon that appear in the Checks and Counters section of its analysis.

          *DISCLAIMER* Do note that the checks and counters data is extracted without any cleaning or post-processing, and so they may contain confusing information such as two Pokemon mutually countering each other. I do not take any responsibility for the information displayed in this graph; if any interactions appear to be incorrect, verify them from the Smogon analysis page for each Pokemon, which is linked to from the sidebar that appears when a Pokemon is selected.
        </Typography>
      </div>
    )
  }

  return (
    <div style={{height: '100%', width: '100%'}}>
      <div style={{
        position: 'absolute',
        left: '16px',
        bottom: '16px',
      }}>
        Copyright © 2022 Zachary Zhu
      </div>
      <Dialog
        fullScreen={fullScreenDialog}
        open={modal}
        onClose={handleCloseModal}
      >
        <DialogTitle>
          <Typography variant='h5'>
            Smogon Checks and Counters Visualization
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {modalContents()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
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
          zIndex: 1,
        }}
      >
        <div
          style={{
            height: '192px',
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
        <Link sx={{position: 'absolute', top: '216px', left: '76px'}} onClick={handleOpenModal}>What is this?</Link>
      </div>
      <Drawer
        anchor='right'
        variant='temporary'
        sx={{
          display: { xs: 'block', md: 'none' }
        }}
        open={drawer}
        ModalProps={{
          keepMounted: true,
        }}
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