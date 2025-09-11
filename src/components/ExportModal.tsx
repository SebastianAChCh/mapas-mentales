import React, { useState } from 'react';
import styled from 'styled-components';
import { ExportOptions } from '../types';

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

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const FormatOption = styled.div<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.isSelected ? '#4A90E2' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    background: rgba(74, 144, 226, 0.1);
    border-color: #4A90E2;
  }
`;

const FormatIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const FormatName = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const FormatDescription = styled.div`
  color: #aaaaaa;
  font-size: 12px;
`;

const SizeControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const SizeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Label = styled.label`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
`;

const Input = styled.input`
  background: #333333;
  border: 1px solid #555555;
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 14px;
  width: 100px;
  
  &:focus {
    outline: none;
    border-color: #4A90E2;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => {
    if (props.variant === 'primary') return '#4A90E2';
    if (props.variant === 'danger') return '#ff6b6b';
    return '#666666';
  }};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      if (props.variant === 'primary') return '#5ba0f2';
      if (props.variant === 'danger') return '#ff5252';
      return '#777777';
    }};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  isExporting?: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isExporting = false
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('png');
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);

  const formatOptions = [
    {
      id: 'png' as const,
      icon: '🖼️',
      name: 'PNG Image',
      description: 'High quality image'
    },
    {
      id: 'pdf' as const,
      icon: '📄',
      name: 'PDF Document',
      description: 'Printable document'
    },
    {
      id: 'json' as const,
      icon: '📋',
      name: 'JSON Data',
      description: 'Raw data format'
    },
    {
      id: 'txt' as const,
      icon: '📝',
      name: 'Text File',
      description: 'Plain text outline'
    }
  ];

  const handleExport = () => {
    const options: ExportOptions = {
      format: selectedFormat,
      width,
      height
    };
    onExport(options);
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <ModalTitle>Export Mind Map</ModalTitle>
        
        <FormatGrid>
          {formatOptions.map((format) => (
            <FormatOption
              key={format.id}
              isSelected={selectedFormat === format.id}
              onClick={() => setSelectedFormat(format.id)}
            >
              <FormatIcon>{format.icon}</FormatIcon>
              <FormatName>{format.name}</FormatName>
              <FormatDescription>{format.description}</FormatDescription>
            </FormatOption>
          ))}
        </FormatGrid>

        {(selectedFormat === 'png' || selectedFormat === 'pdf') && (
          <SizeControls>
            <SizeRow>
              <Label>Width:</Label>
              <Input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 1200)}
                min="100"
                max="4000"
              />
              <span style={{ color: '#aaaaaa', fontSize: '12px' }}>px</span>
            </SizeRow>
            <SizeRow>
              <Label>Height:</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 800)}
                min="100"
                max="4000"
              />
              <span style={{ color: '#aaaaaa', fontSize: '12px' }}>px</span>
            </SizeRow>
          </SizeControls>
        )}

        <ButtonGroup>
          <Button variant="secondary" onClick={handleClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <LoadingSpinner />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;
