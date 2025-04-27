'use client';
import React, { useState, useEffect, useRef } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

const InteractiveDijkstraVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'A', x: 50, y: 100 },
    { id: 'B', x: 200, y: 50 },
    { id: 'C', x: 200, y: 150 },
    { id: 'D', x: 350, y: 100 },
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'C', to: 'D', weight: 1 },
    { from: 'B', to: 'C', weight: 1 },
  ]);
  const [startNode, setStartNode] = useState<string>('A');
  const [distances, setDistances] = useState<{ [key: string]: number }>({});
  const [path, setPath] = useState<{ [key: string]: string | null }>({});
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [newEdgeStartNode, setNewEdgeStartNode] = useState<string | null>(null);
  const [newEdgeEndNode, setNewEdgeEndNode] = useState<string | null>(null);
  const [newEdgeWeight, setNewEdgeWeight] = useState<number | ''>('');

  useEffect(() => {
    drawGraph();
    runDijkstra();
  }, [nodes, edges, startNode]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw weight
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        ctx.fillStyle = '#555';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(edge.weight), midX, midY - 5);
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = node.id === startNode ? 'lightblue' : selectedNode === node.id ? 'yellow' : '#eee';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      // Draw node id
      ctx.fillStyle = '#000';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.id, node.x, node.y + 5);
    });

    // Highlight shortest paths
    for (const targetNodeId in path) {
      let current = targetNodeId;
      while (path[current]) {
        const prev = path[current]!;
        const fromNode = nodes.find((n) => n.id === prev);
        const toNode = nodes.find((n) => n.id === current);
        if (fromNode && toNode) {
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
        current = prev;
      }
    }

    // Drawing new edge in progress
    if (newEdgeStartNode) {
      const start = nodes.find(n => n.id === newEdgeStartNode);
      const endX = newEdgeEndNode ? nodes.find(n => n.id === newEdgeEndNode)?.x : mousePosition.current.x;
      const endY = newEdgeEndNode ? nodes.find(n => n.id === newEdgeEndNode)?.y : mousePosition.current.y;
      if (start) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  };

  const runDijkstra = () => {
    const unvisited = new Set(nodes.map((node) => node.id));
    const currentDistances: { [key: string]: number } = {};
    const currentPath: { [key: string]: string | null } = {};

    nodes.forEach((node) => {
      currentDistances[node.id] = Infinity;
      currentPath[node.id] = null;
    });

    currentDistances[startNode] = 0;

    while (unvisited.size > 0) {
      let minDistance = Infinity;
      let currentNodeId: string | null = null;

      unvisited.forEach((nodeId) => {
        if (currentDistances[nodeId] < minDistance) {
          minDistance = currentDistances[nodeId];
          currentNodeId = nodeId;
        }
      });

      if (currentNodeId === null) {
        break;
      }

      unvisited.delete(currentNodeId);

      const neighbors = edges
        .filter((edge) => edge.from === currentNodeId)
        .map((edge) => ({ to: edge.to, weight: edge.weight }))
        .concat(edges
          .filter((edge) => edge.to === currentNodeId)
          .map((edge) => ({ to: edge.from, weight: edge.weight }))); // Assuming undirected edges

      neighbors.forEach((neighbor) => {
        const distance = currentDistances[currentNodeId!] + neighbor.weight;
        if (distance < currentDistances[neighbor.to]) {
          currentDistances[neighbor.to] = distance;
          currentPath[neighbor.to] = currentNodeId;
        }
      });
    }

    setDistances(currentDistances);
    setPath(currentPath);
  };

  const handleStartNodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStartNode(event.target.value);
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvasX = event.clientX - canvasRef.current!.getBoundingClientRect().left;
    const canvasY = event.clientY - canvasRef.current!.getBoundingClientRect().top;

    nodes.forEach((node) => {
      const distance = Math.sqrt((canvasX - node.x) ** 2 + (canvasY - node.y) ** 2);
      if (distance < 15) {
        setSelectedNode(node.id);
        setIsDragging(true);
        setDragOffset({ x: canvasX - node.x, y: canvasY - node.y });
      }
    });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedNode || !dragOffset) return;
    const canvasX = event.clientX - canvasRef.current!.getBoundingClientRect().left;
    const canvasY = event.clientY - canvasRef.current!.getBoundingClientRect().top;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNode ? { ...node, x: canvasX - dragOffset.x, y: canvasY - dragOffset.y } : node
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setSelectedNode(null);
  };

  const handleAddNode = () => {
    const newNodeId = String.fromCharCode(65 + nodes.length);
    setNodes([...nodes, { id: newNodeId, x: Math.random() * 350 + 25, y: Math.random() * 150 + 25 }]);
  };

  const handleStartAddEdge = (nodeId: string) => {
    setNewEdgeStartNode(nodeId);
  };

  const handleEndAddEdge = (nodeId: string) => {
    if (newEdgeStartNode && newEdgeStartNode !== nodeId) {
      setNewEdgeEndNode(nodeId);
    }
  };

  const handleNewEdgeWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewEdgeWeight(Number(event.target.value));
  };

  const handleConfirmNewEdge = () => {
    if (newEdgeStartNode && newEdgeEndNode && typeof newEdgeWeight === 'number') {
      setEdges([...edges, { from: newEdgeStartNode, to: newEdgeEndNode, weight: newEdgeWeight }]);
      setNewEdgeStartNode(null);
      setNewEdgeEndNode(null);
      setNewEdgeWeight('');
    }
  };

  const mousePosition = useRef({ x: 0, y: 0 });
  const handleCanvasMouseLeave = () => {
    if (newEdgeStartNode && !newEdgeEndNode) {
      setNewEdgeStartNode(null);
    }
  };

  const handleCanvasMoveForEdge = (event: React.MouseEvent<HTMLCanvasElement>) => {
    mousePosition.current = {
      x: event.clientX - canvasRef.current!.getBoundingClientRect().left,
      y: event.clientY - canvasRef.current!.getBoundingClientRect().top,
    };
    drawGraph(); // Redraw to show the edge being dragged
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Interactive Dijkstra's Algorithm</h2>

      <div style={styles.controls}>
        <label htmlFor="startNode">Start Node:</label>
        <select id="startNode" value={startNode} onChange={handleStartNodeChange}>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>{node.id}</option>
          ))}
        </select>
        <button onClick={handleAddNode}>Add Node</button>
        {newEdgeStartNode && !newEdgeEndNode && <span>Drawing edge from {newEdgeStartNode}</span>}
        {newEdgeStartNode && newEdgeEndNode && (
          <span>
            Weight: <input type="number" value={newEdgeWeight} onChange={handleNewEdgeWeightChange} style={{ width: '50px' }} />
            <button onClick={handleConfirmNewEdge}>Confirm Edge</button>
          </span>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={styles.canvas}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={isDragging ? handleCanvasMouseMove : newEdgeStartNode && !newEdgeEndNode ? handleCanvasMoveForEdge : () => {}}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
        onClick={(event) => {
          const canvasX = event.clientX - canvasRef.current!.getBoundingClientRect().left;
          const canvasY = event.clientY - canvasRef.current!.getBoundingClientRect().top;
          nodes.forEach(node => {
            const distance = Math.sqrt((canvasX - node.x) ** 2 + (canvasY - node.y) ** 2);
            if (distance < 15) {
              if (newEdgeStartNode && newEdgeStartNode !== node.id && !newEdgeEndNode) {
                handleEndAddEdge(node.id);
              } else if (!newEdgeStartNode) {
                handleStartAddEdge(node.id);
              }
            }
          });
        }}
      />

      <div style={styles.distances}>
        <h3>Shortest Distances from Node {startNode}:</h3>
        <ul>
          {Object.entries(distances).map(([nodeId, dist]) => (
            <li key={nodeId}>
              {nodeId}: {dist === Infinity ? 'Infinity' : dist}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'sans-serif',
    textAlign: 'center',
  },
  heading: {
    color: '#333',
    marginBottom: '20px',
  },
  controls: {
    marginBottom: '20px',
  },
  canvas: {
    border: '1px solid #ccc',
    marginBottom: '20px',
    cursor: 'grab',
  },
  distances: {
    textAlign: 'left',
    margin: '20px auto',
    maxWidth: '300px',
  },
};

export default InteractiveDijkstraVisualizer;
