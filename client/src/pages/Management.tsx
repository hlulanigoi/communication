import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Upload, FolderPlus, Search, Download, Trash2, MoreVertical,
  FileText, FileImage, File, FolderOpen, Folder, ChevronRight,
  Grid3x3, List, Eye, Calendar, User, HardDrive
} from "lucide-react";

type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  type: string;
  department: string | null;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type ManagementFile = {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: string;
  fileExtension: string | null;
  folderId: string | null;
  folderPath: string | null;
  description: string | null;
  tags: string | null;
  uploadedBy: string;
  uploadedByName: string | null;
  views: string;
  downloads: string;
  createdAt: string;
  updatedAt: string;
};

export default function Management() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch folders
  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ['/api/management/folders'],
  });

  // Fetch files in current folder
  const { data: files = [], isLoading } = useQuery<ManagementFile[]>({
    queryKey: currentFolderId 
      ? [`/api/management/files/folder/${currentFolderId}`]
      : ['/api/management/files'],
  });

  // Get current folder
  const currentFolder = folders.find(f => f.id === currentFolderId);
  
  // Get root folders (departments)
  const rootFolders = folders.filter(f => f.parentId === null);
  
  // Get subfolders in current folder
  const subfolders = folders.filter(f => f.parentId === currentFolderId);

  // Filter files by search
  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/management/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/management/files'] });
      queryClient.invalidateQueries({ queryKey: [`/api/management/files/folder/${currentFolderId}`] });
      toast({ title: "File uploaded successfully" });
      setIsUploadOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/management/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/management/folders'] });
      toast({ title: "Folder created successfully" });
      setIsCreateFolderOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Creation failed", description: error.message, variant: "destructive" });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/management/files/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/management/files'] });
      queryClient.invalidateQueries({ queryKey: [`/api/management/files/folder/${currentFolderId}`] });
      toast({ title: "File deleted successfully" });
    },
  });

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString().split(',')[1];
      uploadMutation.mutate({
        fileName: file.name.replace(/\.[^/.]+$/, ""),
        originalName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size.toString(),
        fileExtension: file.name.split('.').pop(),
        folderId: currentFolderId,
        content: base64,
        uploadedBy: 'Admin',
        uploadedByName: 'System Admin',
      });
    };
    reader.readAsDataURL(file);
  }, [currentFolderId, uploadMutation]);

  // Handle folder creation
  const handleCreateFolder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('folderName') as string;
    
    createFolderMutation.mutate({
      name,
      parentId: currentFolderId,
      type: 'custom',
      department: currentFolder?.department || null,
      createdBy: 'Admin',
    });
  };

  // Download file
  const handleDownload = async (file: ManagementFile) => {
    window.open(`/api/management/files/${file.id}/download`, '_blank');
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-8 w-8 text-blue-500" />;
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Build breadcrumb
  const breadcrumb: Folder[] = [];
  let temp = currentFolder;
  while (temp) {
    breadcrumb.unshift(temp);
    temp = folders.find(f => f.id === temp!.parentId);
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="management-title">Management</h1>
            <p className="text-muted-foreground">Company file management system</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              variant="outline"
              size="icon"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
            </Button>
            
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="create-folder-btn">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFolder} className="space-y-4">
                  <Input
                    name="folderName"
                    placeholder="Folder name"
                    required
                    data-testid="folder-name-input"
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="create-folder-submit">Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button data-testid="upload-file-btn">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    data-testid="file-upload-input"
                  />
                  {currentFolder && (
                    <p className="text-sm text-muted-foreground">
                      Uploading to: {currentFolder.path}
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-files-input"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFolderId(null)}
            data-testid="breadcrumb-root"
          >
            <HardDrive className="h-4 w-4 mr-1" />
            Root
          </Button>
          {breadcrumb.map((folder) => (
            <div key={folder.id} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFolderId(folder.id)}
                data-testid={`breadcrumb-${folder.name}`}
              >
                {folder.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Folder Tree (if at root) */}
        {!currentFolderId && rootFolders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rootFolders.map((folder) => (
              <Card
                key={folder.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCurrentFolderId(folder.id)}
                data-testid={`dept-folder-${folder.department}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Folder className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{folder.name}</h3>
                    <p className="text-sm text-muted-foreground">{folder.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Subfolders */}
        {subfolders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Folders</h2>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
              {subfolders.map((folder) => (
                <Card
                  key={folder.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setCurrentFolderId(folder.id)}
                  data-testid={`subfolder-${folder.name}`}
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-6 w-6 text-yellow-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">{folder.type}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Files ({filteredFiles.length})
          </h2>
          
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading files...</div>
          ) : filteredFiles.length === 0 ? (
            <Card className="p-12 text-center">
              <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No files in this folder</p>
              <p className="text-sm text-muted-foreground mt-2">Upload your first file to get started</p>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="p-4 hover:shadow-md transition-shadow" data-testid={`file-card-${file.id}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center h-20">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm truncate" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{file.views}</span>
                        <Download className="h-3 w-3" />
                        <span>{file.downloads}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDownload(file)}
                        data-testid={`download-file-${file.id}`}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => deleteFileMutation.mutate(file.id)}
                            className="text-destructive"
                            data-testid={`delete-file-${file.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="p-4" data-testid={`file-list-${file.id}`}>
                  <div className="flex items-center gap-4">
                    {getFileIcon(file.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.originalName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {file.uploadedByName || file.uploadedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {file.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {file.downloads} downloads
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => deleteFileMutation.mutate(file.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
