import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import AuthProvider from '@/providers/auth';
import { fetchQuery } from 'convex/nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = await cookies();

  const token = cookie.get('token')?.value;

  if (!token) {
    return redirect('/');
  }

  const user = await fetchQuery(api.user.getCurrentUser, { userId: token as Id<'users'> });

  if (!user) {
    return redirect('/');
  }
  return (
    <div>
      <AuthProvider user={user}>{children}</AuthProvider>
    </div>
  );
}
