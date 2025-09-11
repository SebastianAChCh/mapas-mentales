import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useMindMap } from '../context/MindMapContext';
import { Node, Connection } from '../types';
import MindMapNode from './MindMapNode';
import ConnectionLine from './ConnectionLine';

const CanvasContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isConnecting'].includes(prop),
})<{ isConnecting: boolean }>`
  width: 100%;
  height: 100vh;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.isConnecting ? 'crosshair' : 'default'};
`;

const SVG = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const GridPattern = styled.pattern`
  width: 20;
  height: 20;
  patternUnits: userSpaceOnUse;
`;

const GridRect = styled.rect`
  width: 20;
  height: 20;
  fill: #2a2a2a;
  stroke: #333;
  stroke-width: 0.5;
`;

interface MindMapCanvasProps {
  onNodeClick?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node) => void;
  onCanvasClick?: (event: React.MouseEvent) => void;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  onNodeClick,
  onNodeDoubleClick,
  onCanvasClick
}) => {
  const { state, dispatch } = useMindMap();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [justFinishedDragging, setJustFinishedDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { nodes, connections, canvasState, isConnecting, selectedNode } = state;

  // Handle canvas click to add new nodes
  const handleCanvasClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingNode || justFinishedDragging) return;
    
    // If in connecting mode, cancel connection mode when clicking on empty space
    if (isConnecting) {
      setConnectingFrom(null);
      dispatch({ type: 'SET_CONNECTING', payload: false });
      return;
    }
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / canvasState.zoom - canvasState.panX;
    const y = (event.clientY - rect.top) / canvasState.zoom - canvasState.panY;

    // Check if clicking on empty space
    const clickedNode = nodes.find(node => {
      const nodeX = node.x * canvasState.zoom + canvasState.panX;
      const nodeY = node.y * canvasState.zoom + canvasState.panY;
      const distance = Math.sqrt(
        Math.pow(event.clientX - rect.left - nodeX, 2) + 
        Math.pow(event.clientY - rect.top - nodeY, 2)
      );
      return distance < 30; // Node radius
    });

    if (!clickedNode) {
      const newNode: Node = {
        id: `node_${Date.now()}`,
        text: 'New Node',
        x,
        y,
        color: '#4A90E2',
        nodeType: 'default',
        parentId: null,
        fontSize: 14,
        shape: 'circle',
        width: 100,
        height: 40
      };

      dispatch({ type: 'ADD_NODE', payload: newNode });
    }

    if (onCanvasClick) {
      onCanvasClick(event);
    }
  }, [isDraggingNode, justFinishedDragging, isConnecting, setConnectingFrom, dispatch, nodes, canvasState, onCanvasClick]);

  // Handle node click for connections
  const handleNodeClick = useCallback((node: Node) => {
    if (isConnecting) {
      if (connectingFrom && connectingFrom !== node.id) {
        // Check if connection already exists
        const connectionExists = connections.some(conn => 
          (conn.from === connectingFrom && conn.to === node.id) ||
          (conn.from === node.id && conn.to === connectingFrom)
        );
        
        if (!connectionExists) {
          // Create connection
          const newConnection: Connection = {
            from: connectingFrom,
            to: node.id,
            style: 'solid',
            color: '#666666',
            thickness: 2
          };
          dispatch({ type: 'ADD_CONNECTION', payload: newConnection });
        }
        
        setConnectingFrom(null);
        dispatch({ type: 'SET_CONNECTING', payload: false });
      } else {
        setConnectingFrom(node.id);
      }
    } else {
      dispatch({ type: 'SET_SELECTED_NODE', payload: node.id });
      if (onNodeClick) {
        onNodeClick(node);
      }
    }
  }, [isConnecting, connectingFrom, connections, dispatch, onNodeClick]);

  // Handle node double click for editing
  const handleNodeDoubleClick = useCallback((node: Node) => {
    dispatch({ type: 'SET_EDITING', payload: true });
    if (onNodeDoubleClick) {
      onNodeDoubleClick(node);
    }
  }, [dispatch, onNodeDoubleClick]);

  // Handle node movement
  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_NODE', payload: { id, x, y } });
  }, [dispatch]);

  // Handle node drag start/end
  const handleNodeDragStart = useCallback(() => {
    setIsDraggingNode(true);
    setJustFinishedDragging(false);
  }, []);

  const handleNodeDragEnd = useCallback(() => {
    setIsDraggingNode(false);
    setJustFinishedDragging(true);
    
    // Reset the flag after a short delay to allow normal clicks again
    setTimeout(() => {
      setJustFinishedDragging(false);
    }, 100);
  }, []);

  // Handle canvas drag for panning
  const handleMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (event.target === svgRef.current && !isDraggingNode) {
      setIsDragging(true);
      setDragStart({
        x: event.clientX - canvasState.panX,
        y: event.clientY - canvasState.panY
      });
    }
  }, [canvasState.panX, canvasState.panY, isDraggingNode]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    // Update mouse position for connection preview
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (event.clientX - rect.left) / canvasState.zoom - canvasState.panX;
      const y = (event.clientY - rect.top) / canvasState.zoom - canvasState.panY;
      setMousePosition({ x, y });
    }
    
    if (isDragging && !isDraggingNode) {
      const newPanX = event.clientX - dragStart.x;
      const newPanY = event.clientY - dragStart.y;
      dispatch({
        type: 'UPDATE_CANVAS_STATE',
        payload: { panX: newPanX, panY: newPanY }
      });
    }
  }, [isDragging, dragStart, dispatch, isDraggingNode, canvasState.zoom, canvasState.panX, canvasState.panY]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingNode(false);
    setJustFinishedDragging(false);
  }, []);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, canvasState.zoom * delta));
    dispatch({
      type: 'UPDATE_CANVAS_STATE',
      payload: { zoom: newZoom }
    });
  }, [canvasState.zoom, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            dispatch({ type: 'UNDO' });
            break;
          case 'y':
            event.preventDefault();
            dispatch({ type: 'REDO' });
            break;
          case 's':
            event.preventDefault();
            // Save functionality would go here
            break;
        }
      }
      
      if (event.key === 'Delete' && selectedNode) {
        dispatch({ type: 'DELETE_NODE', payload: selectedNode });
      }
      
      if (event.key === 'Escape') {
        dispatch({ type: 'SET_CONNECTING', payload: false });
        setConnectingFrom(null);
        dispatch({ type: 'SET_SELECTED_NODE', payload: null });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, dispatch]);

  return (
    <CanvasContainer isConnecting={isConnecting}>
      <SVG
        ref={svgRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          transform: `scale(${canvasState.zoom}) translate(${canvasState.panX}px, ${canvasState.panY}px)`,
          transformOrigin: '0 0'
        }}
      >
        <defs>
          <GridPattern id="grid">
            <GridRect />
          </GridPattern>
        </defs>
        
        {/* Grid background */}
        <rect
          width="100%"
          height="100%"
          fill="url(#grid)"
          opacity="0.3"
        />
        
        {/* Connections */}
        {connections.map((connection, index) => (
          <ConnectionLine
            key={`${connection.from}-${connection.to}-${index}`}
            connection={connection}
            nodes={nodes}
            canvasState={canvasState}
          />
        ))}
        
        {/* Temporary connection line when connecting */}
        {isConnecting && connectingFrom && (
          (() => {
            const fromNode = nodes.find(n => n.id === connectingFrom);
            if (!fromNode) return null;
            
            return (
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={mousePosition.x}
                y2={mousePosition.y}
                stroke="#ff6b6b"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
                pointerEvents="none"
              />
            );
          })()
        )}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <MindMapNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            isConnecting={isConnecting}
            isConnectingFrom={connectingFrom === node.id}
            canvasState={canvasState}
            onClick={() => handleNodeClick(node)}
            onDoubleClick={() => handleNodeDoubleClick(node)}
            onMove={handleNodeMove}
            onDragStart={handleNodeDragStart}
            onDragEnd={handleNodeDragEnd}
          />
        ))}
      </SVG>
    </CanvasContainer>
  );
};

export default MindMapCanvas;
