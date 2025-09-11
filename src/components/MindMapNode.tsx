import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Node, CanvasState } from '../types';

const NodeContainer = styled.g<{ isSelected: boolean; isConnecting: boolean; isConnectingFrom: boolean }>`
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  ${props => props.isSelected && `
    filter: drop-shadow(0 0 8px ${props.isConnectingFrom ? '#ff6b6b' : '#4A90E2'});
  `}
  
  ${props => props.isConnectingFrom && `
    filter: drop-shadow(0 0 8px #ff6b6b);
  `}
`;

const NodeCircle = styled.circle<{ color: string }>`
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
}

const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  isSelected,
  isConnecting,
  isConnectingFrom,
  canvasState,
  onClick,
  onDoubleClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(node.text);
    onDoubleClick();
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
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
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
          {node.text}
        </NodeText>
      )}
    </NodeContainer>
  );
};

export default MindMapNode;
