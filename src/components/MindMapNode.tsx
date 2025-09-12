import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Node, CanvasState } from '../types';

const NodeContainer = styled.g.withConfig({
  shouldForwardProp: (prop) => !['isSelected', 'isConnecting', 'isConnectingFrom', 'isDragging'].includes(prop),
})<{ isSelected: boolean; isConnecting: boolean; isConnectingFrom: boolean; isDragging: boolean }>`
  cursor: ${props => {
    if (props.isDragging) return 'grabbing';
    if (props.isConnecting) return 'crosshair';
    return 'pointer';
  }};
  transition: ${props => props.isDragging ? 'none' : 'all 0.2s ease'};
  
  &:hover {
    transform: ${props => props.isDragging ? 'none' : 'scale(1.05)'};
  }
  
  ${props => props.isSelected && `
    filter: drop-shadow(0 0 8px ${props.isConnectingFrom ? '#ff6b6b' : '#4A90E2'});
  `}
  
  ${props => props.isConnectingFrom && `
    filter: drop-shadow(0 0 12px #ff6b6b);
    animation: pulse 1.5s ease-in-out infinite;
  `}
  
  ${props => props.isDragging && `
    filter: drop-shadow(0 0 12px #4A90E2);
  `}
  
  ${props => props.isConnecting && !props.isConnectingFrom && `
    filter: drop-shadow(0 0 6px #4A90E2);
  `}
  
  @keyframes pulse {
    0%, 100% { filter: drop-shadow(0 0 12px #ff6b6b); }
    50% { filter: drop-shadow(0 0 20px #ff6b6b); }
  }
`;

const NodeCircle = styled.circle.withConfig({
  shouldForwardProp: (prop) => !['color'].includes(prop),
})<{ color: string }>`
  fill: ${props => props.color};
  stroke: #ffffff;
  stroke-width: 2;
  transition: all 0.2s ease;
  
  &:hover {
    stroke-width: 3;
  }
`;

const NodeText = styled.text`
  fill: #ffffff;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  user-select: none;
`;

const NodeInput = styled.foreignObject`
  pointer-events: all;
`;

const Input = styled.input`
  background: transparent;
  border: 2px solid #4A90E2;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  padding: 4px 8px;
  text-align: center;
  outline: none;
  width: 100px;
  
  &:focus {
    border-color: #66b3ff;
  }
`;

interface MindMapNodeProps {
  node: Node;
  isSelected: boolean;
  isConnecting: boolean;
  isConnectingFrom: boolean;
  canvasState: CanvasState;
  onClick: () => void;
  onDoubleClick: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  isSelected,
  isConnecting,
  isConnectingFrom,
  canvasState,
  onClick,
  onDoubleClick,
  onMove,
  onDragStart,
  onDragEnd
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState(node.text);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Global mouse handlers to ensure dragging works even when mouse leaves the node
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const deltaX = (event.clientX - dragStart.x) / canvasState.zoom;
        const deltaY = (event.clientY - dragStart.y) / canvasState.zoom;
        
        // Check if we've moved enough to consider it a drag (threshold of 5 pixels)
        const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (dragDistance > 5) {
          setHasDragged(true);
        }
        
        const newX = dragStart.nodeX + deltaX;
        const newY = dragStart.nodeY + deltaY;
        
        onMove(node.id, newX, newY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (onDragEnd) {
          onDragEnd();
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, canvasState.zoom, node.id, onMove, onDragEnd]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!hasDragged) {
      onClick();
    } else {
      // If we've dragged but we're in connection mode, still allow the click
      // This prevents accidental drags from blocking connection attempts
      if (isConnecting) {
        onClick();
      }
    }
  }, [hasDragged, onClick, isConnecting]);

  const handleDoubleClick = () => {
    if (!hasDragged) {
      setIsEditing(true);
      setEditText(node.text);
      onDoubleClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSave = () => {
    if (editText.trim()) {
      // Update node text through context
      // This would be handled by the parent component
      console.log('Saving node text:', editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(node.text);
    setIsEditing(false);
  };

  const handleBlur = () => {
    handleSave();
  };

  // Drag event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (isEditing || isConnecting) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragging(true);
    setHasDragged(false);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      nodeX: node.x,
      nodeY: node.y
    });
    
    if (onDragStart) {
      onDragStart();
    }
  }, [isEditing, isConnecting, node.x, node.y, onDragStart]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const deltaX = (event.clientX - dragStart.x) / canvasState.zoom;
    const deltaY = (event.clientY - dragStart.y) / canvasState.zoom;
    
    const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (dragDistance > 5) {
      setHasDragged(true);
    }
    
    const newX = dragStart.nodeX + deltaX;
    const newY = dragStart.nodeY + deltaY;
    
    onMove(node.id, newX, newY);
  }, [isDragging, dragStart, canvasState.zoom, node.id, onMove]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragging(false);
    
    if (onDragEnd) {
      onDragEnd();
    }
  }, [isDragging, onDragEnd]);

  const getNodeRadius = () => {
    const baseRadius = 30;
    const textLength = node.text.length;
    return Math.max(baseRadius, Math.min(60, baseRadius + textLength * 2));
  };

  const radius = getNodeRadius();

  return (
    <NodeContainer
      isSelected={isSelected}
      isConnecting={isConnecting}
      isConnectingFrom={isConnectingFrom}
      isDragging={isDragging}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <NodeCircle
        cx={node.x}
        cy={node.y}
        r={radius}
        color={node.color}
      />
      
      {isEditing ? (
        <NodeInput
          x={node.x - 50}
          y={node.y - 10}
          width="100"
          height="20"
        >
          <Input
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </NodeInput>
      ) : (
        <NodeText
          x={node.x}
          y={node.y}
          fontSize={node.fontSize}
        >
          {editText}
        </NodeText>
      )}
    </NodeContainer>
  );
};

export default MindMapNode;
