'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { Id } from '@/convex/_generated/dataModel';
import useAuth from '@/hooks/use-auth';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function CreateFolder() {
  const user = useAuth();
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, startSubmit] = useTransition();

  const createFolder = useMutation(api.folders.createFolder);

  const [selectedFolder] = useQueryState('folder', parseAsString.withDefault(''));

  const folderId = (selectedFolder === '' ? null : selectedFolder) as Id<'folders'>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startSubmit(async () => {
      await createFolder({ name: folderName, userId: user._id, parentFolderId: folderId });
      setFolderName('');
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>Enter a name for your new folder.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 pb-5">
            <Input id="folderName" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="My Folder" className="col-span-4" autoFocus />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !folderName.trim()}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
