import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { fetchQuery } from 'convex/nextjs';
import { redirect } from 'next/navigation';

export default async function File({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;

  if (!fileId) return redirect('/?error=invalid_file_id');

  const file = await fetchQuery(api.files.getFile, { fileId: fileId as Id<'files'> });
  if (!file) return redirect('/?error=file_not_found');

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
