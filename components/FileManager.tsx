"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  File,
  Upload,
  Trash2,
  Edit,
  MoreVertical,
  Grid,
  List,
  Plus,
  FolderOpen,
  ChevronRight,
  Search,
} from "lucide-react";
import DownloadIcon from "@/icons/DownloadIcon";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { CreateFileDialog } from "@/components/CreateFileDialog";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
type ViewMode = "grid" | "list";

export default function FileManager() {
  const [selectedFolder, setSelectedFolder] = useState<Id<"folders"> | null>(
    null
  );

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Mutations for creating folders and files
  const createFolder = useMutation(api.folders.createFolder);
  const createFile = useMutation(api.files.createFile);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Get user ID from localStorage
  const userId =
    typeof window !== "undefined"
      ? (localStorage.getItem("userId") as Id<"users">)
      : null;

  // Query folders and files from Convex
  const folders =
    useQuery(
      api.folders.listFolders,
      userId
        ? {
            owner: userId,
            parent: selectedFolder,
          }
        : "skip"
    ) ?? [];

  const files = useQuery(api.files.getFiles, { folder: selectedFolder }) ?? [];

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter folders based on search query
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to navigate to a folder
  const navigateToFolder = (folderId: Id<"folders">) => {
    setSelectedFolder(folderId);
  };

  // Function to navigate up one level
  const navigateUp = () => {
    if (!selectedFolder) return;

    // Find the current folder to get its parent
    const currentFolder = folders.find((f) => f._id === selectedFolder);

    if (currentFolder && currentFolder.parent) {
      setSelectedFolder(currentFolder.parent);
    } else {
      // If no parent or not found, go to root
      setSelectedFolder(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedFolder && (
              <Button
                variant="ghost"
                size="icon"
                onClick={navigateUp}
                title="Go up one level"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
            )}
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files and folders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CreateFolderDialog
              onCreateFolder={async (name) => {
                try {
                  const userId = localStorage.getItem("userId");
                  if (!userId) throw new Error("User not authenticated");

                  await createFolder({
                    name,
                    owner: userId as Id<"users">,
                    parent: selectedFolder,
                  });
                } catch (error) {
                  console.error("Error creating folder:", error);
                }
              }}
              trigger={
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              }
            />
            <CreateFileDialog
              onUploadFile={async (file) => {
                try {
                  const userId = localStorage.getItem("userId");
                  if (!userId) throw new Error("User not authenticated");

                  // Get upload URL
                  const uploadUrl = await generateUploadUrl();

                  // Upload file to storage
                  const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: {
                      "Content-Type": file.type,
                    },
                    body: file,
                  });
                  const { storageId } = await result.json();

                  // Create file record
                  await createFile({
                    name: file.name,
                    owner: userId as Id<"users">,
                    folder: selectedFolder,
                    storageId,
                    size: file.size,
                    mimeType: file.type,
                    isPublic: false,
                    type: getFileType(file.name),
                  });
                } catch (error) {
                  console.error("Error uploading file:", error);
                }
              }}
              trigger={
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              }
            />
            {/* Delete button removed as it's handled in FileActions */}
            <Button variant="outline" size="icon" title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
            <div className="border-l h-6 mx-2" />
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Display current path */}
          <div className="mb-4 text-sm text-muted-foreground">
            {selectedFolder
              ? "Folder: " +
                (folders.find((f) => f._id === selectedFolder)?.name ||
                  "Loading...")
              : "Root"}
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Render folders */}
              {filteredFolders.map((folder) => (
                <Card
                  key={folder._id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigateToFolder(folder._id)}
                >
                  <div className="bg-muted/30 p-4 flex items-center justify-center h-32">
                    <FolderOpen className="h-16 w-16 text-yellow-500" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="truncate">
                        <h3
                          className="font-medium truncate"
                          title={folder.name}
                        >
                          {folder.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Folder
                        </p>
                      </div>
                      <FileActions id={folder._id} type="folder" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Render files */}
              {filteredFiles.map((file) => (
                <Card
                  key={file._id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-muted/30 p-4 flex items-center justify-center h-32">
                    <FileIcon type={file.type} />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="truncate">
                        <h3 className="font-medium truncate" title={file.name}>
                          {file.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {file.size} • {file._creationTime}
                        </p>
                      </div>
                      <FileActions id={file._id} type="file" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Render folders in list view */}
              {filteredFolders.map((folder) => (
                <div
                  key={folder._id}
                  className="flex items-center p-3 rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigateToFolder(folder._id)}
                >
                  <div className="mr-3">
                    <FolderOpen className="h-10 w-10 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground">Folder</p>
                  </div>
                  {/* <FileActions id={file._id} type="file" /> */}
                </div>
              ))}

              {/* Render files in list view */}
              {filteredFiles.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center p-3 rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="mr-3">
                    <FileIcon type={file.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{file.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {file.size} • {file._creationTime}
                    </p>
                  </div>
                  <div className="ml-4 text-sm text-muted-foreground">
                    {file.type}
                  </div>
                  {/* <FileActions id={folder._id} type="folder" /> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileActions({
  id,
  type,
}: { id?: Id<"files"> | Id<"folders">; type?: "file" | "folder" } = {}) {
  const deleteFile = useMutation(api.files.deleteFile);
  // const deleteFolder = useMutation(api.folders.deleteFolder);

  // const handleDelete = async () => {
  //   if (!id) return;

  //   try {
  //     if (type === "file") {
  //       await deleteFile({ id: id as Id<"files"> });
  //     } else if (type === "folder") {
  //       await deleteFolder({ id: id as Id<"folders"> });
  //     }
  //   } catch (error) {
  //     console.error(`Error deleting ${type}:`, error);
  //   }
  // };

  return (
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
        <DropdownMenuItem
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            // handleDelete();
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case "document":
      return <File className="h-10 w-10 text-blue-500" />;
    case "spreadsheet":
      return <File className="h-10 w-10 text-green-500" />;
    case "presentation":
      return <File className="h-10 w-10 text-orange-500" />;
    case "pdf":
      return <File className="h-10 w-10 text-red-500" />;
    case "image":
      return <Image className="h-10 w-10 text-purple-500" />;
    case "video":
      return <Video className="h-10 w-10 text-pink-500" />;
    default:
      return <File className="h-10 w-10" />;
  }
}

function Image(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function Video(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}

// Helper function to determine file type based on extension
function getFileType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  const typeMap: Record<string, string> = {
    // Documents
    doc: "document",
    docx: "document",
    txt: "document",
    rtf: "document",
    md: "document",

    // Spreadsheets
    xls: "spreadsheet",
    xlsx: "spreadsheet",
    csv: "spreadsheet",

    // Presentations
    ppt: "presentation",
    pptx: "presentation",

    // PDFs
    pdf: "pdf",

    // Images
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    svg: "image",
    webp: "image",

    // Videos
    mp4: "video",
    webm: "video",
    mov: "video",
    avi: "video",
  };

  return typeMap[extension] || "document";
}
