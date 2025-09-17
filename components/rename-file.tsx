'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

interface RenameFileProps {
  fileId: Id<'files'>;
  currentName: string;
  onUpdated?: (newName: string) => void;
}

export function RenameFile({ fileId, currentName, onUpdated }: RenameFileProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState(currentName);
  const [isSubmitting, startTransition] = useTransition();

  const editFile = useMutation(api.files.editFile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    startTransition(async () => {
      try {
        const updated = await editFile({ fileId, name: fileName });
        toast.success(`Folder renamed to ${fileName}`);
        setOpen(false);
        if (updated) {
          onUpdated?.(updated.name);
        }
      } catch (err) {
        console.error('Failed to rename file', err);
      }
    });
  };

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex items-center gap-2 cursor-pointer"
      >
        <Edit className="h-4 w-4" />
        <span>Rename</span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>Enter a new name for this file.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 pb-5">
              <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Enter new file name" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !fileName.trim()}>
                {isSubmitting ? 'Renaming...' : 'Rename'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
