import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MindMap } from '../types';

const ManagerContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(42, 42, 42, 0.95);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  min-width: 300px;
  max-height: 80vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' ? '#4A90E2' : '#666666'};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#5ba0f2' : '#777777'};
    transform: translateY(-1px);
  }
`;

const MindMapList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MindMapItem = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.isActive ? '#4A90E2' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(74, 144, 226, 0.1);
    border-color: #4A90E2;
  }
`;

const MindMapTitle = styled.h3`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const MindMapMeta = styled.div`
  color: #aaaaaa;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MindMapActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'secondary' }>`
  background: ${props => {
    if (props.variant === 'danger') return '#ff6b6b';
    if (props.variant === 'secondary') return '#666666';
    return '#555555';
  }};
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      if (props.variant === 'danger') return '#ff5252';
      if (props.variant === 'secondary') return '#777777';
      return '#666666';
    }};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #aaaaaa;
  padding: 40px 20px;
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
`;

const ModalTitle = styled.h3`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

const Input = styled.input`
  width: 100%;
  background: #333333;
  border: 1px solid #555555;
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #4A90E2;
  }
  
  &::placeholder {
    color: #aaaaaa;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: #333333;
  border: 1px solid #555555;
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 16px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4A90E2;
  }
  
  &::placeholder {
    color: #aaaaaa;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

interface MindMapManagerProps {
  currentMap: MindMap | null;
  onMapSelect: (map: MindMap) => void;
  onMapCreate: (map: MindMap) => void;
  onMapUpdate: (map: MindMap) => void;
  onMapDelete: (mapId: string) => void;
}

const MindMapManager: React.FC<MindMapManagerProps> = ({
  currentMap,
  onMapSelect,
  onMapCreate,
  onMapUpdate,
  onMapDelete
}) => {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMap, setEditingMap] = useState<MindMap | null>(null);
  const [newMapTitle, setNewMapTitle] = useState('');
  const [newMapDescription, setNewMapDescription] = useState('');

  // Load mind maps from localStorage
  useEffect(() => {
    const savedMaps = localStorage.getItem('mindMaps');
    if (savedMaps) {
      try {
        const parsedMaps = JSON.parse(savedMaps);
        setMindMaps(parsedMaps);
      } catch (error) {
        console.error('Error loading mind maps:', error);
      }
    }
  }, []);

  // Save mind maps to localStorage
  useEffect(() => {
    localStorage.setItem('mindMaps', JSON.stringify(mindMaps));
  }, [mindMaps]);

  const handleCreateMap = () => {
    if (!newMapTitle.trim()) return;

    const newMap: MindMap = {
      _id: `map_${Date.now()}`,
      title: newMapTitle,
      userId: 'current_user', // In a real app, this would come from auth
      nodes: [],
      connections: [],
      metadata: {
        theme: 'dark',
        canvasSize: { width: 2000, height: 1500 },
        zoomLevel: 1,
        panX: 0,
        panY: 0
      },
      isPublic: false,
      collaborators: [],
      tags: [],
      description: newMapDescription,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMindMaps(prev => [newMap, ...prev]);
    onMapCreate(newMap);
    setNewMapTitle('');
    setNewMapDescription('');
    setShowCreateModal(false);
  };

  const handleEditMap = (map: MindMap) => {
    setEditingMap(map);
    setNewMapTitle(map.title);
    setNewMapDescription(map.description);
    setShowCreateModal(true);
  };

  const handleUpdateMap = () => {
    if (!editingMap || !newMapTitle.trim()) return;

    const updatedMap = {
      ...editingMap,
      title: newMapTitle,
      description: newMapDescription,
      updatedAt: new Date()
    };

    setMindMaps(prev => prev.map(map => 
      map._id === editingMap._id ? updatedMap : map
    ));
    onMapUpdate(updatedMap);
    setEditingMap(null);
    setNewMapTitle('');
    setNewMapDescription('');
    setShowCreateModal(false);
  };

  const handleDeleteMap = (mapId: string) => {
    if (window.confirm('Are you sure you want to delete this mind map?')) {
      setMindMaps(prev => prev.filter(map => map._id !== mapId));
      onMapDelete(mapId);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingMap(null);
    setNewMapTitle('');
    setNewMapDescription('');
  };

  return (
    <>
      <ManagerContainer>
        <Header>
          <Title>Mind Maps</Title>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            + New Map
          </Button>
        </Header>

        <MindMapList>
          {mindMaps.length === 0 ? (
            <EmptyState>
              <div>No mind maps yet</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>
                Create your first mind map to get started
              </div>
            </EmptyState>
          ) : (
            mindMaps.map((map) => (
              <MindMapItem
                key={map._id}
                isActive={currentMap?._id === map._id}
                onClick={() => onMapSelect(map)}
              >
                <MindMapTitle>{map.title}</MindMapTitle>
                <MindMapMeta>
                  <span>{map.nodes.length} nodes</span>
                  <span>{new Date(map.updatedAt || map.createdAt || '').toLocaleDateString()}</span>
                </MindMapMeta>
                {map.description && (
                  <div style={{ color: '#cccccc', fontSize: '12px', marginTop: '8px' }}>
                    {map.description}
                  </div>
                )}
                <MindMapActions>
                  <ActionButton
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMap(map);
                    }}
                  >
                    Edit
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMap(map._id!);
                    }}
                  >
                    Delete
                  </ActionButton>
                </MindMapActions>
              </MindMapItem>
            ))
          )}
        </MindMapList>
      </ManagerContainer>

      <Modal isOpen={showCreateModal}>
        <ModalContent>
          <ModalTitle>
            {editingMap ? 'Edit Mind Map' : 'Create New Mind Map'}
          </ModalTitle>
          <Input
            type="text"
            placeholder="Mind map title"
            value={newMapTitle}
            onChange={(e) => setNewMapTitle(e.target.value)}
          />
          <TextArea
            placeholder="Description (optional)"
            value={newMapDescription}
            onChange={(e) => setNewMapDescription(e.target.value)}
          />
          <ModalActions>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={editingMap ? handleUpdateMap : handleCreateMap}
              disabled={!newMapTitle.trim()}
            >
              {editingMap ? 'Update' : 'Create'}
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MindMapManager;
