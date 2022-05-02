import React from 'react';
import './App.css';
import CounterGraph from './Graph';
import { createTheme, ThemeProvider, Theme } from '@mui/material';


declare module '@mui/material/styles' {
  interface Theme {
    nodes: {
      default: string;
      countered: string;
      counters: string;
    }
  }
  interface ThemeOptions {
    nodes?: {
      default?: string;
      countered?: string;
      counters?: string;
    }
  }
}

const theme: Theme = createTheme({
  palette: {
    primary: {
      main: '#fa5151',
      dark: '#002884',
      light: '#fed8c3',
    },
    secondary: {
      main: '#ff3d00',
    },
  },
  nodes: {
    default: '#fa5151',
    counters: '#B4CFB0',
    countered: '#9ADCFF',
  },
});

function App() {
  return (
    <div className="App" style={{height: '100vh', width: '100vw'}}>
      <ThemeProvider theme={theme}>
        <CounterGraph />
      </ThemeProvider>
    </div>
  );
}

export default App;
