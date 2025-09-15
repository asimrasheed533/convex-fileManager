import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { fetchQuery } from 'convex/nextjs';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function File({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;

  if (!fileId) {
    return redirect('/?error=invalid_file_id');
  }

  const file = await fetchQuery(api.files.getFile, { fileId: fileId as Id<'files'> });

  if (!file) {
    return redirect('/?error=file_not_found');
  }

  return <iframe src={file.fileUrl ?? undefined} className="w-full h-[100vh]" title={file.name} />;
}
