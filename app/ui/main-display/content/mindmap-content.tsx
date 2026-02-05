'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  Node,
  Edge,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

interface MindmapNode {
  title: string;
  children?: MindmapNode[];
}

interface MindmapContentProps {
  data: {
    title: string;
    root: MindmapNode;
  };
}

let nodeCounter = 0;

const flattenTree = (
  node: MindmapNode,
  parentId: string | null,
  nodes: Node[],
  edges: Edge[],
  depth: number = 0
) => {
  const id = `node-${nodeCounter++}`;

  // Color based on depth
  const colors = [
    { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' }, // blue - root
    { bg: '#6366f1', text: '#ffffff', border: '#4f46e5' }, // indigo
    { bg: '#8b5cf6', text: '#ffffff', border: '#7c3aed' }, // violet
    { bg: '#a855f7', text: '#ffffff', border: '#9333ea' }, // purple
    { bg: '#d946ef', text: '#ffffff', border: '#c026d3' }, // fuchsia
  ];
  const color = colors[Math.min(depth, colors.length - 1)];

  nodes.push({
    id,
    data: { label: node.title },
    position: { x: 0, y: 0 },
    style: {
      background: color.bg,
      color: color.text,
      border: `2px solid ${color.border}`,
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: depth === 0 ? '14px' : '12px',
      fontWeight: depth === 0 ? '700' : '500',
      minWidth: '120px',
      textAlign: 'center' as const,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
  });

  if (parentId) {
    edges.push({
      id: `${parentId}-${id}`,
      source: parentId,
      target: id,
      type: 'smoothstep',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      animated: false,
    });
  }

  node.children?.forEach((child) =>
    flattenTree(child, id, nodes, edges, depth + 1)
  );
};

const nodeWidth = 180;
const nodeHeight = 44;

function applyDagreLayout(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80 });

  nodes.forEach((n) =>
    g.setNode(n.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((e) =>
    g.setEdge(e.source, e.target)
  );

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
    };
  });
}

export default function MindmapContent({ data }: MindmapContentProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  if (!data || !data.root?.title) {
    return (
      <div className="w-full p-8 text-center text-gray-400">
        No mindmap data available
      </div>
    );
  }

  useEffect(() => {
    nodeCounter = 0;
    const n: Node[] = [];
    const e: Edge[] = [];
    flattenTree(data.root, null, n, e);
    setNodes(applyDagreLayout(n, e));
    setEdges(e);
  }, [data]);

  return (
    <div className="w-full h-[75vh]">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll
          panOnScroll
          fitView
          fitViewOptions={{ padding: 0.3 }}
        >
          <Background color="#475569" gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
