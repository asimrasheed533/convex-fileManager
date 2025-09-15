'use client';

import { useState, useRef, DragEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export function UploadFile() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFolder = '' as Id<'folders'>;

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const sendFile = useMutation(api.files.createFile);
  const userId = '123';

  async function onUploadFile(file: File) {
    if (!file || !userId) return;
    try {
      setIsUploading(true);
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await sendFile({
        name: file.name,
        owner: '123',
        folder: selectedFolder ?? null,
        storageId,
        size: file.size,
        mimeType: file.type,
        isPublic: false,
        type: 'document',
      });
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      await onUploadFile(selectedFile);
      setSelectedFile(null);
      setOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Select a file from your device or drag & drop it here.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-100' : 'border-muted/50 bg-transparent'}
            `}
          >
            <input id="file" type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <label htmlFor="file" className="flex flex-col items-center gap-2 cursor-pointer">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Click to upload or drag & drop</span>
              <span className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</span>
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/20">
              <File className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">{Math.round(selectedFile.size / 1024)} KB</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
