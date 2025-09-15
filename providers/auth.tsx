'use client';

import { createContext, ReactNode } from 'react';

import { FunctionReturnType } from 'convex/server';
import { api } from '@/convex/_generated/api';

export type UserType = NonNullable<FunctionReturnType<typeof api.user.getCurrentUser>>;

export const AuthContext = createContext<UserType | null>(null);

export default function AuthProvider({ user, children }: { user: NonNullable<UserType>; children: ReactNode }) {
  return <AuthContext value={user}>{children}</AuthContext>;
}
