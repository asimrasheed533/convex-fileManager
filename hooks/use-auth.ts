import { AuthContext, UserType } from '@/providers/auth';
import { useContext } from 'react';

export default function useAuth() {
  const user = useContext(AuthContext) as UserType;

  if (!user) {
    throw new Error('Auth context not found');
  }

  return user;
}
