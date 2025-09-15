'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useCollaboration } from './use-collaboration';

interface Point {
  x: number;
  y: number;
}

interface WhiteboardElement {
  id: string;
  type: 'pen' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'sticky';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: Point[];
  strokeColor: string;
  strokeWidth: number;
  text?: string;
  userId?: string;
  timestamp?: number;
}

interface WhiteboardContextType {
  // Tools
  activeTool: string;
  setActiveTool: (tool: string) => void;

  // Drawing properties
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;

  // Canvas state
  zoom: number;
  panOffset: Point;
  setPanOffset: (offset: Point) => void;

  // Elements
  elements: WhiteboardElement[];
  addElement: (element: WhiteboardElement) => void;
  updateElement: (elementId: string, updates: Partial<WhiteboardElement>) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Zoom controls
  zoomIn: () => void;
  zoomOut: () => void;
}

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

export function WhiteboardProvider({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState('select');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [history, setHistory] = useState<WhiteboardElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { broadcastElement, onElementReceived } = useCollaboration();

  useEffect(() => {
    onElementReceived((receivedElement: WhiteboardElement) => {
      setElements((prev) => {
        const existingIndex = prev.findIndex((el) => el.id === receivedElement.id);
        if (existingIndex >= 0) {
          const newElements = [...prev];
          newElements[existingIndex] = receivedElement;
          return newElements;
        } else {
          return [...prev, receivedElement];
        }
      });
    });
  }, [onElementReceived]);

  const addElement = useCallback(
    (element: WhiteboardElement) => {
      const enhancedElement = {
        ...element,
        timestamp: Date.now(),
      };

      setElements((prev) => {
        const newElements = [...prev, enhancedElement];

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        return newElements;
      });

      broadcastElement(enhancedElement);
    },
    [history, historyIndex, broadcastElement],
  );

  const updateElement = useCallback(
    (elementId: string, updates: Partial<WhiteboardElement>) => {
      setElements((prev) => {
        const newElements = prev.map((el) => (el.id === elementId ? { ...el, ...updates, timestamp: Date.now() } : el));

        const updatedElement = newElements.find((el) => el.id === elementId);
        if (updatedElement) {
          broadcastElement(updatedElement);
        }

        return newElements;
      });
    },
    [broadcastElement],
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1] || []);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <WhiteboardContext.Provider
      value={{
        activeTool,
        setActiveTool,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
        zoom,
        panOffset,
        setPanOffset,
        elements,
        addElement,
        updateElement,
        undo,
        redo,
        canUndo,
        canRedo,
        zoomIn,
        zoomOut,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
}

export function useWhiteboard() {
  const context = useContext(WhiteboardContext);
  if (context === undefined) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider');
  }
  return context;
}
