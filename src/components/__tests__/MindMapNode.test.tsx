import React from 'react';
import { render } from '@testing-library/react';
import MindMapNode from '../MindMapNode';

const canvasState = { zoom: 1, panX: 0, panY: 0, width: 800, height: 600 };

const baseNode = {
  id: 'n1',
  text: 'Hi',
  x: 100,
  y: 100,
  color: '#4A90E2',
  nodeType: 'default',
  parentId: null,
  fontSize: 14,
  shape: 'circle',
  width: 100,
  height: 50,
};

test('calculates radius based on text length (small text)', () => {
  const { container } = render(
    <svg>
      <MindMapNode
        node={{ ...baseNode, text: 'Hi' }}
        isSelected={false}
        isConnecting={false}
        isConnectingFrom={false}
        canvasState={canvasState}
        onClick={() => {}}
        onDoubleClick={() => {}}
        onMove={() => {}}
      />
    </svg>
  );

  const circle = container.querySelector('circle');
  // baseRadius 30 + text.length * 2 => 30 + 2*2 = 34
  expect(circle).toHaveAttribute('r', '34');
});

test('caps radius at 60 for long text', () => {
  const longText = 'a'.repeat(100);
  const { container } = render(
    <svg>
      <MindMapNode
        node={{ ...baseNode, text: longText }}
        isSelected={false}
        isConnecting={false}
        isConnectingFrom={false}
        canvasState={canvasState}
        onClick={() => {}}
        onDoubleClick={() => {}}
        onMove={() => {}}
      />
    </svg>
  );

  const circle = container.querySelector('circle');
  expect(circle).toHaveAttribute('r', '60');
});
