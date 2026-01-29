import CytoscapeComponent from 'react-cytoscapejs';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

import { Routes, Route } from 'react-router-dom';

const GraphComponent = () => {
  const elements = [
    { data: { id: 'one', label: 'Node 1', color: '#4A90E2' }, position: { x: 0, y: 0 } },
    { data: { id: 'two', label: 'Node 2', color: '#50E3C2' }, position: { x: 100, y: 0 } },
    { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
  ];

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': 'data(color)',
        'label': 'data(label)'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 1,
        'line-color': '#A0A0A0'
      }
    }
  ];

  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: '100%', height: '100%' }}
      stylesheet={stylesheet}
      layout={{ name: 'preset' }}
    />
  );
  
};

const OpenWindowButton = () => {
  const createNewWindow = async () => {
    const webview = new WebviewWindow('graph-window', {
      url: '/graph',
      title: 'Graph',
      width: 800,
      height: 600
    });
    webview.once('tauri://created', () => {
      console.log('Graph window created');
    });

    webview.once('tauri://error', (e) => {
      console.error("Erreur lors de la création de la fenêtre:", e);
    });
  };
  return (
    <button onClick={createNewWindow} className="p-2 bg-blue-500 text-white rounded">
      Open Graph Window
    </button>
  );
};

function GraphWindow() {
  return (
    <main className="h-screen w-full">
      <GraphComponent />
    </main>
  );
}

function Main(){
  return (
    <main className="h-screen w-full flex items-center justify-center">
      <OpenWindowButton />
    </main>
  );
}

function App() {
  
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/graph" element={<GraphWindow />} />
    </Routes>
  );
}

export default App;
