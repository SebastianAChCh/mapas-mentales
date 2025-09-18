import React, { useState } from 'react';
import styled from 'styled-components';
import { ChromePicker } from 'react-color';
import { useMindMap } from '../context/MindMapContext';

const MenuContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(42, 42, 42, 0.95);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  min-width: 200px;
`;

const MenuGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MenuGroupTitle = styled.h3`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['active', 'variant'].includes(prop),
})<{ active?: boolean; variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => {
    if (props.active) return '#4A90E2';
    if (props.variant === 'danger') return '#ff6b6b';
    if (props.variant === 'secondary') return '#666666';
    return '#555555';
  }};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => {
      if (props.active) return '#5ba0f2';
      if (props.variant === 'danger') return '#ff5252';
      if (props.variant === 'secondary') return '#777777';
      return '#666666';
    }};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ColorPickerContainer = styled.div`
  position: relative;
`;

const ColorButton = styled.button<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #ffffff;
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  z-index: 1001;
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SliderLabel = styled.label`
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
`;

const Slider = styled.input`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #333333;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4A90E2;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4A90E2;
    cursor: pointer;
    border: none;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
`;

const Menu: React.FC = () => {
  const { state, dispatch } = useMindMap();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#4A90E2');

  const { isConnecting, selectedNode, nodes } = state;

  const handleConnectToggle = () => {
    if (!isConnecting) {
      // Activar modo de conexión
      dispatch({ type: 'SET_CONNECTING', payload: true });
    } else {
      // Desactivar modo de conexión solo si el usuario hace clic en el botón
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };

  const handleRedo = () => {
    dispatch({ type: 'REDO' });
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      dispatch({ type: 'DELETE_NODE', payload: selectedNode });
    }
  };

  const handleColorChange = (color: any) => {
    setSelectedColor(color.hex);
    if (selectedNode) {
      dispatch({
        type: 'UPDATE_NODE',
        payload: { id: selectedNode, updates: { color: color.hex } }
      });
    }
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const zoom = parseFloat(event.target.value);
    dispatch({
      type: 'UPDATE_CANVAS_STATE',
      payload: { zoom }
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all nodes?')) {
      dispatch({ type: 'SET_NODES', payload: [] });
      dispatch({ type: 'SET_CONNECTIONS', payload: [] });
      dispatch({ type: 'CLEAR_HISTORY' });
    }
  };

  return (
    <MenuContainer>
      <MenuGroup>
        <MenuGroupTitle>Actions</MenuGroupTitle>
        <Button
          active={isConnecting}
          onClick={handleConnectToggle}
        >
          {isConnecting ? '🔗 Cancel Connect' : '🔗 Connect Nodes'}
        </Button>
        {isConnecting && (
          <div style={{ color: '#4A90E2', fontSize: '12px', marginTop: '4px' }}>
            Click on two nodes to connect them
          </div>
        )}
        <Button onClick={handleUndo}>
          ↶ Undo
        </Button>
        <Button onClick={handleRedo}>
          ↷ Redo
        </Button>
      </MenuGroup>

      <Divider />

      <MenuGroup>
        <MenuGroupTitle>Node Properties</MenuGroupTitle>
        <ColorPickerContainer>
          <ColorButton
            color={selectedNode ? nodes.find(n => n.id === selectedNode)?.color || '#4A90E2' : '#4A90E2'}
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
          {showColorPicker && (
            <ColorPickerWrapper>
              <ChromePicker
                color={selectedColor}
                onChange={handleColorChange}
                disableAlpha
              />
            </ColorPickerWrapper>
          )}
        </ColorPickerContainer>
        <Button
          variant="danger"
          onClick={handleDeleteNode}
          disabled={!selectedNode}
        >
          🗑️ Delete Node
        </Button>
      </MenuGroup>

      <Divider />

      <MenuGroup>
        <MenuGroupTitle>Canvas</MenuGroupTitle>
        <SliderContainer>
          <SliderLabel>Zoom: {Math.round(state.canvasState.zoom * 100)}%</SliderLabel>
          <Slider
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={state.canvasState.zoom}
            onChange={handleZoomChange}
          />
        </SliderContainer>
        <Button
          variant="danger"
          onClick={handleClearAll}
        >
          🧹 Clear All
        </Button>
      </MenuGroup>

      <Divider />

      <MenuGroup>
        <MenuGroupTitle>Info</MenuGroupTitle>
        <div style={{ color: '#ffffff', fontSize: '12px' }}>
          Nodes: {nodes.length}
        </div>
        <div style={{ color: '#ffffff', fontSize: '12px' }}>
          Connections: {state.connections.length}
        </div>
      </MenuGroup>
    </MenuContainer>
  );
};

export default Menu;
