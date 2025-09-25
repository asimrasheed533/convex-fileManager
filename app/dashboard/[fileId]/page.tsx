'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export default function File({ fileId }: { fileId: Id<'files'> }) {
  const file = useQuery(api.files.getFile, { fileId });

  if (file === undefined) return <p>Loading...</p>;
  if (file === null) return <p>File not found</p>;

  let src = file.fileUrl ?? '';

  if (file.mimeType?.includes('word') || file.mimeType?.includes('officedocument.wordprocessingml')) {
    src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.fileUrl!)}`;
  } else if (file.mimeType?.includes('excel') || file.mimeType?.includes('spreadsheetml')) {
    src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.fileUrl!)}`;
  } else if (file.mimeType?.includes('powerpoint') || file.mimeType?.includes('presentationml')) {
    src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.fileUrl!)}`;
  } else if (file.mimeType?.includes('pdf')) {
    src = file.fileUrl!;
  } else if (file.mimeType?.startsWith('image/')) {
    src = file.fileUrl!;
  }

  return <iframe src={src} className="w-full h-[100vh]" title={file.name} />;
}
