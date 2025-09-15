'use server';

import { cookies } from 'next/headers';

export async function saveToken(token: string) {
  (await cookies()).set('token', token, {
    path: '/',
  });
}
