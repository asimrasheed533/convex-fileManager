'use client';

import { createContext, ReactNode } from 'react';

import { FunctionReturnType } from 'convex/server';
import { api } from '@/convex/_generated/api';

type User = FunctionReturnType<typeof api.user.getCurrentUser>;

export const AuthContext = createContext<User>(null);

export default function AuthProvider({ user, children }: { user: NonNullable<User>; children: ReactNode }) {
  return <AuthContext value={user}>{children}</AuthContext>;
}
