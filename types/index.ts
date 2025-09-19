import { Id } from '@/convex/_generated/dataModel';

export type User = {
  id: Id<'users'>;
  name: string;
  email: string;
  createdAt: number;
};

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
}
