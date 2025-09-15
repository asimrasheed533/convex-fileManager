'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { File, Trash2, Edit, MoreVertical, Grid, List, FolderOpen, ChevronRight, Search, Loader } from 'lucide-react';
import DownloadIcon from '@/icons/DownloadIcon';
import { CreateFolder } from '@/components/create-folder';
import { UploadFile } from '@/components/upload-file';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { parseAsString, useQueryState } from 'nuqs';
import { useQueryWithStatus } from '@/hooks/use-query';
import { ReactNode, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { filesize } from 'filesize';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';

export default function FileManager() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        console.log(error);
        toast.error(error);
      }, 1000);
    }
  }, [error]);

  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));

  const [viewMode, setViewMode] = useQueryState('view', parseAsString.withDefault('grid'));

  const [selectedFolder] = useQueryState('folder', parseAsString.withDefault(''));

  const folderId = (selectedFolder === '' ? null : selectedFolder) as Id<'folders'>;

  const { data: files, isPending } = useQueryWithStatus(api.files.getFiles, { folder: folderId }) ?? [];

  const filteredFiles = files?.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedFolder && (
              <Button onClick={() => router.back()} variant="ghost" size="icon" title="Go up one level">
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
            )}
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search files and folders..." className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CreateFolder />
            <UploadFile />
            <div className="border-l h-6 mx-2" />
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} title="Grid View">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} title="List View">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {isPending ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : !filteredFiles || filteredFiles.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">No files found</p>
            </div>
          ) : (
            <FilesWrapper>{filteredFiles.map((entry) => (entry.type === 'folder' ? <FolderComponent key={entry._id} data={entry} /> : <FileComponent key={entry._id} data={entry} />))}</FilesWrapper>
          )}
        </div>
      </div>
    </div>
  );
}

function FilesWrapper({ children }: { children: ReactNode }) {
  const [viewMode] = useQueryState('view', parseAsString.withDefault('grid'));

  return viewMode === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{children}</div> : <div className="space-y-2">{children}</div>;
}

function FolderComponent({ data }: { data: Doc<'folders'> }) {
  const router = useRouter();

  const deleteFolderMutation = useMutation(api.folders.deleteFolder);

  const handleDeleteFolder = async (folderId: Id<'folders'>) => {
    try {
      await deleteFolderMutation({ folderId });
      toast.success('Folder deleted successfully');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete folder');
    }
  };

  const [viewMode] = useQueryState('view', parseAsString.withDefault('grid'));

  const actions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Edit className="h-4 w-4 mr-2" /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DownloadIcon className="h-4 w-4 mr-2" /> Download
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteFolder(data._id)}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return viewMode === 'grid' ? (
    <Card key={data._id} onDoubleClick={() => router.push(`/dashboard?folder=${data._id.toString()}`)} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="bg-muted/30 p-4 flex items-center justify-center h-32">
        <FolderOpen className="h-16 w-16 text-yellow-500" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="truncate">
            <h3 className="font-medium truncate" title={data.name}>
              {data.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Created {dayjs(data._creationTime).format('MMMM D, YYYY')}</p>
          </div>
          {actions}
        </div>
      </CardContent>
    </Card>
  ) : (
    <div key={data._id} onDoubleClick={() => router.push(`/dashboard?folder=${data._id.toString()}`)} className="flex items-center p-3 rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="mr-3">
        <FolderOpen className="h-10 w-10 text-yellow-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{data.name}</h3>
        <p className="text-xs text-muted-foreground">Created {dayjs(data._creationTime).format('MMMM D, YYYY')}</p>
      </div>
      {actions}
    </div>
  );
}

function FileComponent({ data }: { data: Doc<'files'> }) {
  const router = useRouter();

  const [viewMode] = useQueryState('view', parseAsString.withDefault('grid'));

  const actions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Edit className="h-4 w-4 mr-2" /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DownloadIcon className="h-4 w-4 mr-2" /> Download
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return viewMode === 'grid' ? (
    <Card key={data._id} onDoubleClick={() => router.push(`/dashboard/${data._id.toString()}`)} className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-muted/30 p-4 flex items-center justify-center h-32">
        <FileIcon type={data.mimeType} />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="truncate">
            <h3 className="font-medium truncate" title={data.name}>
              {data.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {filesize(data.size)} • {dayjs(data._creationTime).format('MMMM D, YYYY')}
            </p>
          </div>
          {actions}
        </div>
      </CardContent>
    </Card>
  ) : (
    <div key={data._id} onDoubleClick={() => router.push(`/dashboard/${data._id.toString()}`)} className="flex items-center p-3 rounded-md hover:bg-accent/50 transition-colors">
      <div className="mr-3">
        <FileIcon type={data.mimeType} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{data.name}</h3>
        <p className="text-xs text-muted-foreground">
          {filesize(data.size)} • {dayjs(data._creationTime).format('MMMM D, YYYY')}
        </p>
      </div>
      {actions}
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case 'document':
      return <File className="h-10 w-10 text-blue-500" />;
    case 'spreadsheet':
      return <File className="h-10 w-10 text-green-500" />;
    case 'presentation':
      return <File className="h-10 w-10 text-orange-500" />;
    case 'pdf':
      return <File className="h-10 w-10 text-red-500" />;
    case 'image':
      return <Image className="h-10 w-10 text-purple-500" />;
    case 'video':
      return <Video className="h-10 w-10 text-pink-500" />;
    default:
      return <File className="h-10 w-10" />;
  }
}

function Image(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function Video(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
