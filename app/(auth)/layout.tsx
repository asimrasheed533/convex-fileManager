import { clearToken } from '@/actions/clearToken';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { fetchQuery } from 'convex/nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const cookie = await cookies();

  const token = cookie.get('token')?.value;

  if (token) {
    return redirect('/dashboard');
  }

  const user = await fetchQuery(api.user.getCurrentUser, { userId: token as Id<'users'> });

  if (!user) {
    await clearToken();
  }

  return children;
}
