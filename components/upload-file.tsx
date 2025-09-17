'use client';

import { useState, useRef, DragEvent, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { filesize } from 'filesize';
import { toast } from 'sonner';
import useAuth from '@/hooks/use-auth';
import { parseAsString, useQueryState } from 'nuqs';
import { Id } from '@/convex/_generated/dataModel';

export function UploadFile() {
  const user = useAuth();

  const [isUploading, startUploading] = useTransition();

  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [open, setOpen] = useState(false);

  const [selectedFolder] = useQueryState('folder', parseAsString.withDefault(''));

  const folderId = (selectedFolder === '' ? null : selectedFolder) as Id<'folders'>;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const uploadfile = useMutation(api.files.uploadfile);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startUploading(async () => {
      if (!selectedFile) {
        toast.error('Please select a file');
        return;
      }

      try {
        const postUrl = await generateUploadUrl();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open('POST', postUrl, true);
          xhr.setRequestHeader('Content-Type', selectedFile.type);

          // 📊 Track upload progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percent);
            }
          };

          xhr.onload = async () => {
            if (xhr.status === 200) {
              const { storageId } = JSON.parse(xhr.responseText);

              await uploadfile({
                storageId,
                user: user._id,
                name: selectedFile.name,
                size: selectedFile.size,
                mimeType: selectedFile.type,
                folder: folderId,
              });

              setSelectedFile(null);
              setOpen(false);
              setUploadProgress(0);

              if (fileInputRef.current) fileInputRef.current.value = '';
              toast.success('File uploaded successfully');
              resolve();
            } else {
              reject(new Error('Upload failed'));
            }
          };

          xhr.onerror = () => reject(new Error('Upload failed'));
          xhr.send(selectedFile);
        });
      } catch (err) {
        console.error(err);
        toast.error('File upload failed');
        setUploadProgress(0);
      }
    });
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
              ${isDragging ? 'border-gray-500 bg-gray-100' : 'border-muted/50 bg-transparent'}
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
                <span className="text-xs text-muted-foreground">{filesize(selectedFile.size)}</span>
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
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-900 h-2 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
              <p className="text-xs text-gray-600 mt-1 text-right">{uploadProgress}%</p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
