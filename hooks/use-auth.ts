import { AuthContext } from '@/providers/auth';
import { useContext } from 'react';

export default function useAuth() {
  const user = useContext(AuthContext);

  if (!user) {
    throw new Error('Auth context not found');
  }

  return user;
}
