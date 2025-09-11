import React from 'react';
import styled from 'styled-components';
import { Connection, Node, CanvasState } from '../types';

const Line = styled.line<{ color: string; thickness: number }>`
  stroke: ${props => props.color};
  stroke-width: ${props => props.thickness};
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: all 0.2s ease;
  
  &:hover {
    stroke-width: ${props => props.thickness + 2};
    opacity: 0.8;
  }
`;

const Arrowhead = styled.polygon<{ color: string }>`
  fill: ${props => props.color};
`;

interface ConnectionLineProps {
  connection: Connection;
  nodes: Node[];
  canvasState: CanvasState;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  nodes,
  canvasState
}) => {
  const fromNode = nodes.find(node => node.id === connection.from);
  const toNode = nodes.find(node => node.id === connection.to);

  if (!fromNode || !toNode) {
    return null;
  }

  // Calculate arrow direction and position
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return null;

  // Normalize direction vector
  const unitX = dx / distance;
  const unitY = dy / distance;

  // Calculate connection points (edge of circles)
  const fromRadius = 30; // Base radius for from node
  const toRadius = 30; // Base radius for to node
  
  const fromX = fromNode.x + unitX * fromRadius;
  const fromY = fromNode.y + unitY * fromRadius;
  const toX = toNode.x - unitX * toRadius;
  const toY = toNode.y - unitY * toRadius;

  // Arrowhead points
  const arrowLength = 10;
  const arrowAngle = Math.PI / 6; // 30 degrees
  
  const arrowX1 = toX - arrowLength * Math.cos(Math.atan2(dy, dx) - arrowAngle);
  const arrowY1 = toY - arrowLength * Math.sin(Math.atan2(dy, dx) - arrowAngle);
  const arrowX2 = toX - arrowLength * Math.cos(Math.atan2(dy, dx) + arrowAngle);
  const arrowY2 = toY - arrowLength * Math.sin(Math.atan2(dy, dx) + arrowAngle);

  // Control points for curved line (optional) - currently using straight lines
  // const midX = (fromX + toX) / 2;
  // const midY = (fromY + toY) / 2;
  // const controlOffset = 50;
  // const controlX = midX + (-dy * controlOffset) / distance;
  // const controlY = midY + (dx * controlOffset) / distance;
  // const pathData = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;

  return (
    <g>
      {/* Main connection line */}
      <Line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        color={connection.color}
        thickness={connection.thickness}
      />
      
      {/* Arrowhead */}
      <Arrowhead
        color={connection.color}
        points={`${toX},${toY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
      />
    </g>
  );
};

export default ConnectionLine;
