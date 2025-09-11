export interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  nodeType: string;
  parentId: string | null;
  fontSize: number;
  shape: string;
  width: number;
  height: number;
}

export interface Connection {
  from: string;
  to: string;
  style: string;
  color: string;
  thickness: number;
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  width: number;
  height: number;
}

export interface MindMapMetadata {
  theme: string;
  canvasSize: {
    width: number;
    height: number;
  };
  zoomLevel: number;
  panX: number;
  panY: number;
}

export interface MindMap {
  _id?: string;
  title: string;
  userId: string;
  nodes: Node[];
  connections: Connection[];
  metadata: MindMapMetadata;
  isPublic: boolean;
  collaborators: string[];
  tags: string[];
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ActionHistory {
  type: 'add_node' | 'delete_node' | 'move_node' | 'edit_node' | 'add_connection' | 'delete_connection' | 'change_color';
  data: any;
  timestamp: number;
}

export interface ExportOptions {
  format: 'png' | 'pdf' | 'json' | 'txt';
  width?: number;
  height?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
