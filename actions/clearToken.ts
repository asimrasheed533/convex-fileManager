'use server';

import { cookies } from 'next/headers';

export const clearToken = async () => {
  (await cookies()).set('token', '', {
    path: '/',
  });
};
