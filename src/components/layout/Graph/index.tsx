import CytoscapeComponent from 'react-cytoscapejs';


export default function GraphComponent() {
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