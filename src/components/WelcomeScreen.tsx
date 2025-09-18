import React from 'react';
import styled from 'styled-components';
import { MindMap } from '../types';

const WelcomeScreenContainer = styled.div`
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
  color: #4a90e2;
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

const CreateButton = styled.button<{ variant?: "primary" | "secondary" }>`
  background: ${(props) =>
    props.variant === "primary" ? "#4A90E2" : "#666666"};
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
    background: ${(props) =>
      props.variant === "primary" ? "#5ba0f2" : "#777777"};
    transform: translateY(-1px);
  }
`;

interface WelcomeScreenProps {
  onCreateMap: (map: MindMap) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateMap }) => {
  const handleCreateMap = () => {
    const newMap: MindMap = {
      _id: `map_${Date.now()}`,
      title: "My First Mind Map",
      userId: "current_user",
      nodes: [],
      connections: [],
      metadata: {
        theme: "dark",
        canvasSize: { width: 2000, height: 1500 },
        zoomLevel: 1,
        panX: 0,
        panY: 0,
      },
      isPublic: false,
      collaborators: [],
      tags: [],
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onCreateMap(newMap);
  };

  return (
    <WelcomeScreenContainer>
      <WelcomeTitle>Welcome to MindMapPro</WelcomeTitle>
      <WelcomeSubtitle>
        Create, edit, and collaborate on mind maps with our intuitive
        interface. Start by creating your first mind map or explore the
        features below.
      </WelcomeSubtitle>

      <FeatureGrid>
        <FeatureCard>
          <FeatureIcon>🎯</FeatureIcon>
          <FeatureTitle>Easy Creation</FeatureTitle>
          <FeatureDescription>
            Click anywhere to add nodes and connect them with simple
            drag-and-drop
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

      <CreateButton variant="primary" onClick={handleCreateMap}>
        🚀 Create Your First Mind Map
      </CreateButton>
    </WelcomeScreenContainer>
  );
};

export default WelcomeScreen;
