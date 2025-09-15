'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './use-auth';

interface Point {
  x: number;
  y: number;
}

interface Cursor {
  userId: string;
  userName: string;
  userColor: string;
  position: Point;
  lastSeen: number;
}

interface CollaborationContextType {
  // Live cursors
  cursors: Cursor[];
  updateCursor: (position: Point) => void;

  // Real-time sync
  broadcastElement: (element: any) => void;
  onElementReceived: (callback: (element: any) => void) => void;

  // Presence
  activeUsers: Array<{
    id: string;
    name: string;
    color: string;
    isActive: boolean;
  }>;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

// Mock WebSocket-like behavior for demonstration
class MockCollaborationService {
  private listeners: Array<(data: any) => void> = [];
  private cursors: Map<string, Cursor> = new Map();

  // Simulate broadcasting to other users
  broadcast(data: any) {
    // In a real implementation, this would send to WebSocket/Convex
    setTimeout(() => {
      this.listeners.forEach((listener) => listener(data));
    }, 50); // Simulate network delay
  }

  subscribe(callback: (data: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  updateCursor(userId: string, cursor: Cursor) {
    this.cursors.set(userId, cursor);
    this.broadcast({ type: 'cursor', userId, cursor });
  }

  getCursors() {
    return Array.from(this.cursors.values());
  }
}

const collaborationService = new MockCollaborationService();

export function CollaborationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [elementCallback, setElementCallback] = useState<((element: any) => void) | null>(null);

  // Mock active users for demonstration
  const activeUsers = [
    { id: '1', name: 'John Doe', color: '#ef4444', isActive: true },
    { id: '2', name: 'Jane Smith', color: '#22c55e', isActive: true },
    { id: '3', name: 'Mike Johnson', color: '#3b82f6', isActive: false },
  ];

  // Subscribe to collaboration events
  useEffect(() => {
    const unsubscribe = collaborationService.subscribe((data) => {
      switch (data.type) {
        case 'cursor':
          if (data.userId !== user?.id) {
            setCursors((prev) => {
              const filtered = prev.filter((c) => c.userId !== data.userId);
              return [...filtered, data.cursor];
            });
          }
          break;
        case 'element':
          if (elementCallback && data.userId !== user?.id) {
            elementCallback(data.element);
          }
          break;
      }
    });

    return unsubscribe;
  }, [user?.id, elementCallback]);

  // Clean up old cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => prev.filter((cursor) => now - cursor.lastSeen < 5000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateCursor = useCallback(
    (position: Point) => {
      if (!user) return;

      const cursor: Cursor = {
        userId: user.id,
        userName: user.name,
        userColor: activeUsers.find((u) => u.id === user.id)?.color || '#3b82f6',
        position,
        lastSeen: Date.now(),
      };

      collaborationService.updateCursor(user.id, cursor);
    },
    [user],
  );

  const broadcastElement = useCallback(
    (element: any) => {
      if (!user) return;

      collaborationService.broadcast({
        type: 'element',
        userId: user.id,
        element,
      });
    },
    [user],
  );

  const onElementReceived = useCallback((callback: (element: any) => void) => {
    setElementCallback(() => callback);
  }, []);

  return (
    <CollaborationContext.Provider
      value={{
        cursors,
        updateCursor,
        broadcastElement,
        onElementReceived,
        activeUsers,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}
