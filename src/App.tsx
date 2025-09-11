import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MindMapProvider, useMindMap } from './context/MindMapContext';
import MindMapCanvas from './components/MindMapCanvas';
import Toolbar from './components/Toolbar';
import MindMapManager from './components/MindMapManager';
import ExportModal from './components/ExportModal';
import { MindMap, ExportOptions } from './types';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #1a1a1a;
  overflow: hidden;
  position: relative;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1001;
`;

const Logo = styled.h1`
  color: #4A90E2;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#5ba0f2' : '#777777'};
    transform: translateY(-1px);
  }
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100vh;
  padding-top: 60px;
`;

const WelcomeScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ffffff;
  text-align: center;
  padding: 40px;
`;

const WelcomeTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #4A90E2;
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  color: #aaaaaa;
  margin: 0 0 32px 0;
  max-width: 600px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  max-width: 800px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #ffffff;
`;

const FeatureDescription = styled.p`
  font-size: 14px;
  color: #aaaaaa;
  margin: 0;
`;

const AppContent: React.FC = () => {
  const { state, dispatch } = useMindMap();
  const [currentMap, setCurrentMap] = useState<MindMap | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { nodes, connections, isLoading } = state;

  // Load initial mind map or create default
  useEffect(() => {
    if (!currentMap && nodes.length === 0) {
      // Create a default welcome mind map
      const defaultMap: MindMap = {
        _id: 'welcome_map',
        title: 'Welcome to MindMapPro',
        userId: 'current_user',
        nodes: [
          {
            id: 'welcome_node',
            text: 'Welcome to MindMapPro!',
            x: 1000,
            y: 500,
            color: '#4A90E2',
            nodeType: 'default',
            parentId: null,
            fontSize: 18,
            shape: 'circle',
            width: 120,
            height: 50
          }
        ],
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
        description: 'Your first mind map',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCurrentMap(defaultMap);
      dispatch({ type: 'SET_CURRENT_MAP', payload: defaultMap });
    }
  }, [currentMap, nodes.length, dispatch]);

  const handleMapSelect = (map: MindMap) => {
    setCurrentMap(map);
    dispatch({ type: 'SET_CURRENT_MAP', payload: map });
  };

  const handleMapCreate = (map: MindMap) => {
    setCurrentMap(map);
    dispatch({ type: 'SET_CURRENT_MAP', payload: map });
  };

  const handleMapUpdate = (map: MindMap) => {
    setCurrentMap(map);
    dispatch({ type: 'SET_CURRENT_MAP', payload: map });
  };

  const handleMapDelete = (mapId: string) => {
    if (currentMap?._id === mapId) {
      setCurrentMap(null);
      dispatch({ type: 'SET_CURRENT_MAP', payload: null });
    }
  };

  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true);
    
    try {
      // In a real app, this would call the backend API
      console.log('Exporting with options:', options);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just download as JSON
      if (options.format === 'json') {
        const dataStr = JSON.stringify(currentMap, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentMap?.title || 'mindmap'}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = () => {
    if (currentMap) {
      const updatedMap = {
        ...currentMap,
        nodes,
        connections,
        updatedAt: new Date()
      };
      
      // Save to localStorage
      const savedMaps = JSON.parse(localStorage.getItem('mindMaps') || '[]');
      const updatedMaps = savedMaps.map((map: MindMap) => 
        map._id === currentMap._id ? updatedMap : map
      );
      localStorage.setItem('mindMaps', JSON.stringify(updatedMaps));
      
      setCurrentMap(updatedMap);
      dispatch({ type: 'SET_CURRENT_MAP', payload: updatedMap });
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleSave, 30000);
    return () => clearInterval(interval);
  }, [currentMap, nodes, connections, handleSave]);

  if (isLoading) {
    return (
      <AppContainer>
        <WelcomeScreen>
          <div>Loading...</div>
        </WelcomeScreen>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <Logo>MindMapPro</Logo>
        <HeaderActions>
          <Button onClick={handleSave}>
            💾 Save
          </Button>
          <Button onClick={() => setShowExportModal(true)}>
            📤 Export
          </Button>
        </HeaderActions>
      </Header>

      <CanvasContainer>
        {currentMap ? (
          <>
            <MindMapCanvas />
            <Toolbar />
            <MindMapManager
              currentMap={currentMap}
              onMapSelect={handleMapSelect}
              onMapCreate={handleMapCreate}
              onMapUpdate={handleMapUpdate}
              onMapDelete={handleMapDelete}
            />
          </>
        ) : (
          <WelcomeScreen>
            <WelcomeTitle>Welcome to MindMapPro</WelcomeTitle>
            <WelcomeSubtitle>
              Create, edit, and collaborate on mind maps with our intuitive interface.
              Start by creating your first mind map or explore the features below.
            </WelcomeSubtitle>
            
            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>🎯</FeatureIcon>
                <FeatureTitle>Easy Creation</FeatureTitle>
                <FeatureDescription>
                  Click anywhere to add nodes and connect them with simple drag-and-drop
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>🎨</FeatureIcon>
                <FeatureTitle>Customizable</FeatureTitle>
                <FeatureDescription>
                  Change colors, fonts, and styles to match your preferences
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>📱</FeatureIcon>
                <FeatureTitle>Responsive</FeatureTitle>
                <FeatureDescription>
                  Works perfectly on desktop, tablet, and mobile devices
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>💾</FeatureIcon>
                <FeatureTitle>Auto-Save</FeatureTitle>
                <FeatureDescription>
                  Your work is automatically saved and synced across devices
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
            
            <Button
              variant="primary"
              onClick={() => {
                const newMap: MindMap = {
                  _id: `map_${Date.now()}`,
                  title: 'My First Mind Map',
                  userId: 'current_user',
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
                  description: '',
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                handleMapCreate(newMap);
              }}
            >
              🚀 Create Your First Mind Map
            </Button>
          </WelcomeScreen>
        )}
      </CanvasContainer>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </AppContainer>
  );
};

const App: React.FC = () => {
  return (
    <MindMapProvider>
      <AppContent />
    </MindMapProvider>
  );
};

export default App;