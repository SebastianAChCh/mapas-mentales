import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MindMap, Node, Connection, ActionHistory, CanvasState } from '../types';

interface MindMapState {
  currentMap: MindMap | null;
  nodes: Node[];
  connections: Connection[];
  selectedNode: string | null;
  actionHistory: ActionHistory[];
  historyIndex: number;
  canvasState: CanvasState;
  isEditing: boolean;
  isConnecting: boolean;
  isLoading: boolean;
  error: string | null;
}

type MindMapAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_MAP'; payload: MindMap | null }
  | { type: 'SET_NODES'; payload: Node[] }
  | { type: 'ADD_NODE'; payload: Node }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<Node> } }
  | { type: 'MOVE_NODE'; payload: { id: string; x: number; y: number } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'SET_CONNECTIONS'; payload: Connection[] }
  | { type: 'ADD_CONNECTION'; payload: Connection }
  | { type: 'DELETE_CONNECTION'; payload: { from: string; to: string } }
  | { type: 'SET_SELECTED_NODE'; payload: string | null }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'UPDATE_CANVAS_STATE'; payload: Partial<CanvasState> }
  | { type: 'ADD_ACTION'; payload: ActionHistory }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' };

const initialState: MindMapState = {
  currentMap: null,
  nodes: [],
  connections: [],
  selectedNode: null,
  actionHistory: [],
  historyIndex: -1,
  canvasState: {
    zoom: 1,
    panX: 0,
    panY: 0,
    width: 2000,
    height: 1500
  },
  isEditing: false,
  isConnecting: false,
  isLoading: false,
  error: null
};

function mindMapReducer(state: MindMapState, action: MindMapAction): MindMapState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CURRENT_MAP':
      return {
        ...state,
        currentMap: action.payload,
        nodes: action.payload?.nodes || [],
        connections: action.payload?.connections || [],
        canvasState: action.payload?.metadata ? {
          zoom: action.payload.metadata.zoomLevel,
          panX: action.payload.metadata.panX,
          panY: action.payload.metadata.panY,
          width: action.payload.metadata.canvasSize.width,
          height: action.payload.metadata.canvasSize.height
        } : state.canvasState
      };
    
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
        actionHistory: [...state.actionHistory.slice(0, state.historyIndex + 1), {
          type: 'add_node',
          data: action.payload,
          timestamp: Date.now()
        }],
        historyIndex: state.historyIndex + 1
      };
    
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map(node =>
          node.id === action.payload.id
            ? { ...node, ...action.payload.updates }
            : node
        ),
        actionHistory: [...state.actionHistory.slice(0, state.historyIndex + 1), {
          type: 'edit_node',
          data: { id: action.payload.id, updates: action.payload.updates },
          timestamp: Date.now()
        }],
        historyIndex: state.historyIndex + 1
      };
    
    case 'MOVE_NODE':
      return {
        ...state,
        nodes: state.nodes.map(node =>
          node.id === action.payload.id
            ? { ...node, x: action.payload.x, y: action.payload.y }
            : node
        ),
        actionHistory: [...state.actionHistory.slice(0, state.historyIndex + 1), {
          type: 'move_node',
          data: { id: action.payload.id, x: action.payload.x, y: action.payload.y },
          timestamp: Date.now()
        }],
        historyIndex: state.historyIndex + 1
      };
    
    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload),
        connections: state.connections.filter(
          conn => conn.from !== action.payload && conn.to !== action.payload
        ),
        selectedNode: state.selectedNode === action.payload ? null : state.selectedNode,
        actionHistory: [...state.actionHistory.slice(0, state.historyIndex + 1), {
          type: 'delete_node',
          data: action.payload,
          timestamp: Date.now()
        }],
        historyIndex: state.historyIndex + 1
      };
    
    case 'SET_CONNECTIONS':
      return { ...state, connections: action.payload };
    
    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [...state.connections, action.payload],
        actionHistory: [...state.actionHistory.slice(0, state.historyIndex + 1), {
          type: 'add_connection',
          data: action.payload,
          timestamp: Date.now()
        }],
        historyIndex: state.historyIndex + 1
      };
    
    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(
          conn => !(conn.from === action.payload.from && conn.to === action.payload.to)
        ),
        actionHistory: [...state.actionHistory.slice(0, state.historyIndex + 1), {
          type: 'delete_connection',
          data: action.payload,
          timestamp: Date.now()
        }],
        historyIndex: state.historyIndex + 1
      };
    
    case 'SET_SELECTED_NODE':
      return { ...state, selectedNode: action.payload };
    
    case 'SET_EDITING':
      return { ...state, isEditing: action.payload };
    
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    
    case 'UPDATE_CANVAS_STATE':
      return {
        ...state,
        canvasState: { ...state.canvasState, ...action.payload }
      };
    
    case 'ADD_ACTION':
      return {
        ...state,
        actionHistory: [...state.actionHistory.slice(0, state.historyIndex + 1), action.payload],
        historyIndex: state.historyIndex + 1
      };
    
    case 'UNDO':
      if (state.historyIndex >= 0) {
        // const actionToUndo = state.actionHistory[state.historyIndex];
        // Implementation would depend on the specific action type
        return {
          ...state,
          historyIndex: state.historyIndex - 1
        };
      }
      return state;
    
    case 'REDO':
      if (state.historyIndex < state.actionHistory.length - 1) {
        return {
          ...state,
          historyIndex: state.historyIndex + 1
        };
      }
      return state;
    
    case 'CLEAR_HISTORY':
      return {
        ...state,
        actionHistory: [],
        historyIndex: -1
      };
    
    default:
      return state;
  }
}

interface MindMapContextType {
  state: MindMapState;
  dispatch: React.Dispatch<MindMapAction>;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export function MindMapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mindMapReducer, initialState);

  return (
    <MindMapContext.Provider value={{ state, dispatch }}>
      {children}
    </MindMapContext.Provider>
  );
}

export function useMindMap() {
  const context = useContext(MindMapContext);
  if (context === undefined) {
    throw new Error('useMindMap must be used within a MindMapProvider');
  }
  return context;
}
