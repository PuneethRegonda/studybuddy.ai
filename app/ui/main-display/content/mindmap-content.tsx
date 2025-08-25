'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
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

//–– 1) Flatten your tree into nodes & edges ––
const flattenTree = (
  node: MindmapNode,
  parentId: string | null,
  nodes: Node[],
  edges: Edge[]
) => {
  // generate a unique ID
  const id = Math.random().toString(36).substr(2, 9);

  nodes.push({
    id,
    data: { label: node.title },
    position: { x: 0, y: 0 },
  });

  if (parentId) {
    edges.push({
      id: `${parentId}-${id}`,
      source: parentId,
      target: id,
      type: 'smoothstep',
    });
  }

  node.children?.forEach((child) =>
    flattenTree(child, id, nodes, edges)
  );
};

//–– 2) Run dagre to auto-position ––
const nodeWidth = 180;
const nodeHeight = 40;

// reuse one dagre graph instance
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

function applyDagreLayout(nodes: Node[], edges: Edge[]) {
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });

  nodes.forEach((n) =>
    dagreGraph.setNode(n.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((e) =>
    dagreGraph.setEdge(e.source, e.target)
  );

  dagre.layout(dagreGraph);

  return nodes.map((n) => {
    const { x, y } = dagreGraph.node(n.id)!;
    return {
      ...n,
      position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 },
    };
  });
}

export default function MindmapContent({
  data,
}: MindmapContentProps) {
  if (!data || !data.root?.title) {
    return (
      <div className="w-full p-8 text-center text-red-500">
        Invalid Mindmap Data
      </div>
    );
  }

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const n: Node[] = [];
    const e: Edge[] = [];
    flattenTree(data.root, null, n, e);
    setNodes(applyDagreLayout(n, e));
    setEdges(e);
  }, [data]);

  return (
    <div className="w-full h-[80vh]">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={false}
          panOnScroll
          fitView
        >
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}