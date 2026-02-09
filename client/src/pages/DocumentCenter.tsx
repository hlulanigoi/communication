import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, Download, ShieldCheck, Award, Share2, Trash2, Loader2, AlertCircle, 
  Upload, Search, Filter, Grid3x3, List, Plus, X, Eye, FileIcon, ImageIcon,
  FileSpreadsheet, File, FolderOpen, Calendar, Tag, User
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getDocuments, 
  getStudents, 
  getClients,
  getStaff,
  generateCertificate, 
  generatePlacementLetter, 
  generateComplianceReport, 
  deleteDocument,
  bulkDeleteDocuments, 
  getDocumentDownloadUrl,
  uploadDocument,
  searchDocuments,
  filterDocuments,
  type DocumentFilters,
} from "@/lib/api";
import type { Student, Client, Staff } from "@shared/schema";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DocumentCenter() {
  const queryClient = useQueryClient();
  
  // Dialog states
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [placementDialogOpen, setPlacementDialogOpen] = useState(false);
  const [complianceDialogOpen, setComplianceDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Selection states
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>({});
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterDateStart, setFilterDateStart] = useState<string>("");
  const [filterDateEnd, setFilterDateEnd] = useState<string>("");

  // Form states - Generators
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [certificateType, setCertificateType] = useState<string>("");
  const [achievements, setAchievements] = useState<string>("");
  const [reportType, setReportType] = useState<string>("");
  const [reportSummary, setReportSummary] = useState<string>("");

  // Form states - Upload
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadType, setUploadType] = useState<string>("Custom");
  const [uploadCategory, setUploadCategory] = useState<string>("General");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const [uploadTags, setUploadTags] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStudentId, setUploadStudentId] = useState<string>("");
  const [uploadClientId, setUploadClientId] = useState<string>("");
  const [uploadStaffId, setUploadStaffId] = useState<string>("");

  // Queries
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: getStaff,
  });

  // Mutations
  const generateCertMutation = useMutation({
    mutationFn: generateCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Certificate generated successfully!');
      setCertificateDialogOpen(false);
      resetGeneratorForms();
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate certificate: ${error.message}`);
    },
  });

  const generatePlacementMutation = useMutation({
    mutationFn: generatePlacementLetter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Placement letter generated successfully!');
      setPlacementDialogOpen(false);
      resetGeneratorForms();
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate placement letter: ${error.message}`);
    },
  });

  const generateComplianceMutation = useMutation({
    mutationFn: generateComplianceReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Compliance report generated successfully!');
      setComplianceDialogOpen(false);
      resetGeneratorForms();
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate compliance report: ${error.message}`);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully!');
      setUploadDialogOpen(false);
      resetUploadForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedDocId(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteDocuments,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(`${data.deletedCount} document(s) deleted successfully!`);
      setBulkDeleteDialogOpen(false);
      setSelectedDocs([]);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete documents: ${error.message}`);
    },
  });

  // Helper functions
  const resetGeneratorForms = () => {
    setSelectedStudent("");
    setCertificateType("");
    setAchievements("");
    setReportType("");
    setReportSummary("");
  };

  const resetUploadForm = () => {
    setUploadTitle("");
    setUploadType("Custom");
    setUploadCategory("General");
    setUploadDescription("");
    setUploadTags("");
    setUploadFile(null);
    setUploadStudentId("");
    setUploadClientId("");
    setUploadStaffId("");
  };

  // Handlers - Generators
  const handleGenerateCertificate = () => {
    if (!selectedStudent || !certificateType) {
      toast.error('Please select a student and certificate type');
      return;
    }
    generateCertMutation.mutate({ studentId: selectedStudent, certificateType });
  };

  const handleGeneratePlacement = () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    const achievementsList = achievements
      ? achievements.split('\n').filter(a => a.trim())
      : [];
    generatePlacementMutation.mutate({ studentId: selectedStudent, achievements: achievementsList });
  };

  const handleGenerateCompliance = () => {
    if (!reportType) {
      toast.error('Please enter a report type');
      return;
    }
    generateComplianceMutation.mutate({ reportType, summary: reportSummary });
  };

  // Handlers - Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name);
      }
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadTitle) {
      toast.error('Please select a file and enter a title');
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (!base64) {
        toast.error('Failed to read file');
        return;
      }

      const tags = uploadTags ? uploadTags.split(',').map(t => t.trim()).filter(Boolean) : [];

      uploadMutation.mutate({
        title: uploadTitle,
        type: uploadType,
        category: uploadCategory,
        fileType: uploadFile.type || 'application/octet-stream',
        fileName: uploadFile.name,
        fileSize: uploadFile.size.toString(),
        content: base64,
        studentId: uploadStudentId || undefined,
        clientId: uploadClientId || undefined,
        staffId: uploadStaffId || undefined,
        description: uploadDescription || undefined,
        tags: tags.length > 0 ? tags : undefined,
        uploadedBy: 'Admin',
      });
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(uploadFile);
  };

  // Handlers - Delete
  const handleDelete = (docId: string) => {
    setSelectedDocId(docId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDocId) {
      deleteMutation.mutate(selectedDocId);
    }
  };

  const handleBulkDelete = () => {
    if (selectedDocs.length === 0) {
      toast.error('No documents selected');
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    if (selectedDocs.length > 0) {
      bulkDeleteMutation.mutate(selectedDocs);
    }
  };

  const handleDownload = (docId: string, title: string) => {
    const url = getDocumentDownloadUrl(docId);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  // Handlers - Selection
  const toggleDocSelection = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllDocs = () => {
    setSelectedDocs(filteredDocuments.map(doc => doc.id));
  };

  const deselectAllDocs = () => {
    setSelectedDocs([]);
  };

  // Handlers - Filters
  const applyFilters = () => {
    const filters: DocumentFilters = {};
    
    if (filterType) filters.type = filterType;
    if (filterCategory) filters.category = filterCategory;
    if (filterDateStart) filters.startDate = new Date(filterDateStart);
    if (filterDateEnd) filters.endDate = new Date(filterDateEnd);

    setActiveFilters(filters);
    setFilterDialogOpen(false);
    
    if (Object.keys(filters).length > 0) {
      toast.success('Filters applied');
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    setFilterType("");
    setFilterCategory("");
    setFilterDateStart("");
    setFilterDateEnd("");
    setSearchQuery("");
    toast.success('Filters cleared');
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    let docs = [...documents];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query)) ||
        (doc.studentName && doc.studentName.toLowerCase().includes(query)) ||
        (doc.clientName && doc.clientName.toLowerCase().includes(query)) ||
        (doc.type && doc.type.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (activeFilters.type) {
      docs = docs.filter(doc => doc.type === activeFilters.type);
    }
    if (activeFilters.category) {
      docs = docs.filter(doc => doc.category === activeFilters.category);
    }
    if (activeFilters.startDate) {
      docs = docs.filter(doc => {
        const docDate = doc.generatedDate ? new Date(doc.generatedDate) : null;
        return docDate && docDate >= activeFilters.startDate!;
      });
    }
    if (activeFilters.endDate) {
      docs = docs.filter(doc => {
        const docDate = doc.generatedDate ? new Date(doc.generatedDate) : null;
        return docDate && docDate <= activeFilters.endDate!;
      });
    }

    return docs;
  }, [documents, searchQuery, activeFilters]);

  // Get document icon
  const getDocIcon = (type: string, fileType?: string) => {
    if (fileType?.includes('image')) return ImageIcon;
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return FileSpreadsheet;
    
    switch (type) {
      case 'Certificate': return Award;
      case 'Placement Letter': return FileText;
      case 'Compliance': return ShieldCheck;
      default: return File;
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Student': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Vehicle': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'Client': 'bg-green-500/10 text-green-600 border-green-500/20',
      'Job': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      'Staff': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      'Insurance': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'General': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    };
    return colors[category] || colors['General'];
  };

  // Document categories and types for filters
  const categories = ['Student', 'Vehicle', 'Client', 'Job', 'Staff', 'Insurance', 'General'];
  const types = ['Certificate', 'Placement Letter', 'Compliance', 'Invoice', 'Report', 'Contract', 'Custom'];

  const activeFilterCount = Object.keys(activeFilters).length + (searchQuery ? 1 : 0);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground" data-testid="document-center-title">Document Center</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest">Comprehensive Document Management System</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
            data-testid="upload-document-btn"
            className="font-bold text-xs uppercase"
          >
            <Upload className="w-4 h-4 mr-2" /> Upload
          </Button>
          {selectedDocs.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleBulkDelete}
              data-testid="bulk-delete-btn"
              className="font-bold text-xs uppercase"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedDocs.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="industrial-border mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by title, description, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFilterDialogOpen(true)}
                data-testid="filter-btn"
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" /> 
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-primary text-white px-1.5 py-0 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                  data-testid="clear-filters-btn"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <div className="border-l mx-2"></div>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="icon"
                onClick={() => setViewMode('list')}
                data-testid="view-list-btn"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="icon"
                onClick={() => setViewMode('grid')}
                data-testid="view-grid-btn"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: {searchQuery}
                </Badge>
              )}
              {activeFilters.type && (
                <Badge variant="secondary" className="text-xs">
                  Type: {activeFilters.type}
                </Badge>
              )}
              {activeFilters.category && (
                <Badge variant="secondary" className="text-xs">
                  Category: {activeFilters.category}
                </Badge>
              )}
              {activeFilters.startDate && (
                <Badge variant="secondary" className="text-xs">
                  From: {activeFilters.startDate.toLocaleDateString()}
                </Badge>
              )}
              {activeFilters.endDate && (
                <Badge variant="secondary" className="text-xs">
                  To: {activeFilters.endDate.toLocaleDateString()}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Documents ({filteredDocuments.length})</TabsTrigger>
          <TabsTrigger value="generators">Generators</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Selection toolbar */}
          {filteredDocuments.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                  onCheckedChange={(checked) => checked ? selectAllDocs() : deselectAllDocs()}
                  data-testid="select-all-checkbox"
                />
                <span className="text-sm font-medium">
                  {selectedDocs.length > 0 
                    ? `${selectedDocs.length} selected` 
                    : 'Select all'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredDocuments.length} document(s)
              </div>
            </div>
          )}

          {/* Documents List */}
          <Card className="industrial-border">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-sm font-black italic">DOCUMENT LIBRARY</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {docsLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery || activeFilterCount > 0
                      ? 'No documents match your search or filters.'
                      : 'No documents yet. Upload or generate your first document.'}
                  </p>
                </div>
              ) : viewMode === 'list' ? (
                <div className="divide-y divide-border/50">
                  {filteredDocuments.map((doc) => {
                    const Icon = getDocIcon(doc.type, doc.fileType || '');
                    const date = doc.generatedDate ? new Date(doc.generatedDate).toLocaleDateString('en-ZA') : 'N/A';
                    const isSelected = selectedDocs.includes(doc.id);
                    
                    return (
                      <div 
                        key={doc.id} 
                        className={`p-4 flex items-center justify-between hover:bg-muted/5 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                        data-testid={`document-item-${doc.id}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleDocSelection(doc.id)}
                            data-testid={`select-doc-${doc.id}`}
                          />
                          <div className="w-10 h-10 bg-secondary flex items-center justify-center border-l-2 border-l-primary">
                            <Icon className="w-5 h-5 opacity-50" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-sm uppercase tracking-tight">{doc.title}</p>
                              <Badge className={`text-[10px] ${getCategoryColor(doc.category || 'General')}`}>
                                {doc.category || 'General'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                              <span>{doc.type}</span>
                              {(doc.studentName || doc.clientName || doc.staffName) && (
                                <>
                                  <span>•</span>
                                  <span>{doc.studentName || doc.clientName || doc.staffName}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{date}</span>
                              {doc.fileSize && (
                                <>
                                  <span>•</span>
                                  <span>{(parseInt(doc.fileSize) / 1024).toFixed(1)} KB</span>
                                </>
                              )}
                            </div>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[10px] font-black uppercase tracking-tighter hover:bg-primary hover:text-white"
                            onClick={() => handleDownload(doc.id, doc.title)}
                            data-testid={`download-btn-${doc.id}`}
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" /> DOWNLOAD
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => handleDelete(doc.id)}
                            data-testid={`delete-btn-${doc.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredDocuments.map((doc) => {
                    const Icon = getDocIcon(doc.type, doc.fileType || '');
                    const date = doc.generatedDate ? new Date(doc.generatedDate).toLocaleDateString('en-ZA') : 'N/A';
                    const isSelected = selectedDocs.includes(doc.id);
                    
                    return (
                      <Card 
                        key={doc.id}
                        className={`industrial-border hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary' : ''}`}
                        data-testid={`document-card-${doc.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleDocSelection(doc.id)}
                              />
                              <Icon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <Badge className={`text-[10px] ${getCategoryColor(doc.category || 'General')}`}>
                              {doc.category || 'General'}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-sm mb-1 line-clamp-2">{doc.title}</h3>
                          <p className="text-[10px] text-muted-foreground mb-2">{doc.type}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{doc.description}</p>
                          )}
                          <div className="text-[10px] text-muted-foreground mb-3">
                            <div>{date}</div>
                            {(doc.studentName || doc.clientName || doc.staffName) && (
                              <div className="flex items-center gap-1 mt-1">
                                <User className="w-3 h-3" />
                                {doc.studentName || doc.clientName || doc.staffName}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-[10px] font-black"
                              onClick={() => handleDownload(doc.id, doc.title)}
                            >
                              <Download className="w-3 h-3 mr-1" /> Download
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:text-destructive"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generators" className="space-y-4">
          {/* Document Generators */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="industrial-border bg-black text-white p-6 flex flex-col items-center justify-center text-center space-y-4">
              <Award className="w-12 h-12 text-primary animate-pulse" />
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter">Issue Certificate</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Generate verifiable digital certificates for students</p>
              </div>
              <Button 
                className="w-full bg-primary text-white font-black text-xs uppercase tracking-widest"
                onClick={() => setCertificateDialogOpen(true)}
                data-testid="open-certificate-generator"
              >
                START GENERATOR
              </Button>
            </Card>
            
            <Card className="industrial-border p-6 flex flex-col items-center justify-center text-center space-y-4">
              <FileText className="w-12 h-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter">Placement Letter</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Automated student placement & internship letters</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full font-black text-xs uppercase tracking-widest border-2"
                onClick={() => setPlacementDialogOpen(true)}
                data-testid="open-placement-generator"
              >
                GENERATE LETTER
              </Button>
            </Card>

            <Card className="industrial-border p-6 flex flex-col items-center justify-center text-center space-y-4 border-emerald-500/20">
              <ShieldCheck className="w-12 h-12 text-emerald-500" />
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter">Compliance Report</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Audit-ready insurance & workshop compliance docs</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full font-black text-xs uppercase tracking-widest border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                onClick={() => setComplianceDialogOpen(true)}
                data-testid="open-compliance-generator"
              >
                AUDIT REPORT
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="industrial-border">
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
              <CardDescription>Pre-configured templates for common document types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-bold mb-1">Invoice Template</h4>
                  <p className="text-xs text-muted-foreground mb-3">Standard service invoice</p>
                  <Button size="sm" variant="outline" className="w-full">Coming Soon</Button>
                </Card>
                <Card className="p-4 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-bold mb-1">Service Report</h4>
                  <p className="text-xs text-muted-foreground mb-3">Vehicle service summary</p>
                  <Button size="sm" variant="outline" className="w-full">Coming Soon</Button>
                </Card>
                <Card className="p-4 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-bold mb-1">Contract</h4>
                  <p className="text-xs text-muted-foreground mb-3">Client service agreement</p>
                  <Button size="sm" variant="outline" className="w-full">Coming Soon</Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="upload-dialog">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">Upload Document</DialogTitle>
            <DialogDescription>Upload a new document to the library</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="upload-file">Select File *</Label>
              <Input
                id="upload-file"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                data-testid="upload-file-input"
              />
              {uploadFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upload-title">Document Title *</Label>
                <Input
                  id="upload-title"
                  placeholder="e.g., Vehicle Service Report"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  data-testid="upload-title-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-type">Document Type</Label>
                <Select value={uploadType} onValueChange={setUploadType}>
                  <SelectTrigger id="upload-type" data-testid="upload-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-category">Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger id="upload-category" data-testid="upload-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Description (Optional)</Label>
              <Textarea
                id="upload-description"
                placeholder="Brief description of the document..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                rows={2}
                data-testid="upload-description-textarea"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-tags">Tags (Optional)</Label>
              <Input
                id="upload-tags"
                placeholder="comma, separated, tags"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                data-testid="upload-tags-input"
              />
              <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            </div>

            <div className="border-t pt-4 mt-4">
              <Label className="mb-3 block">Link to (Optional)</Label>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-student">Student</Label>
                  <Select value={uploadStudentId} onValueChange={setUploadStudentId}>
                    <SelectTrigger id="upload-student">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-client">Client</Label>
                  <Select value={uploadClientId} onValueChange={setUploadClientId}>
                    <SelectTrigger id="upload-client">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-staff">Staff Member</Label>
                  <Select value={uploadStaffId} onValueChange={setUploadStaffId}>
                    <SelectTrigger id="upload-staff">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {staff.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUploadDocument} 
              disabled={uploadMutation.isPending || !uploadFile || !uploadTitle}
              data-testid="confirm-upload-btn"
            >
              {uploadMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent data-testid="filter-dialog">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">Filter Documents</DialogTitle>
            <DialogDescription>Apply filters to narrow down your search</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-type">Document Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter-type" data-testid="filter-type-select">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-category">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="filter-category" data-testid="filter-category-select">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-date-start">Date From</Label>
                <Input
                  id="filter-date-start"
                  type="date"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  data-testid="filter-date-start"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-date-end">Date To</Label>
                <Input
                  id="filter-date-end"
                  type="date"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                  data-testid="filter-date-end"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setFilterType("");
              setFilterCategory("");
              setFilterDateStart("");
              setFilterDateEnd("");
            }}>
              Clear
            </Button>
            <Button onClick={applyFilters} data-testid="apply-filters-btn">
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Generator Dialog */}
      <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
        <DialogContent data-testid="certificate-dialog">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">Generate Certificate</DialogTitle>
            <DialogDescription>Create a professional certificate for a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cert-student">Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger id="cert-student" data-testid="cert-student-select">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert-type">Certificate Type</Label>
              <Input
                id="cert-type"
                placeholder="e.g., Automotive Technician - Level 1"
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                data-testid="cert-type-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertificateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleGenerateCertificate} 
              disabled={generateCertMutation.isPending}
              data-testid="generate-certificate-btn"
            >
              {generateCertMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Placement Letter Dialog */}
      <Dialog open={placementDialogOpen} onOpenChange={setPlacementDialogOpen}>
        <DialogContent data-testid="placement-dialog">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">Generate Placement Letter</DialogTitle>
            <DialogDescription>Create a placement completion letter for a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="place-student">Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger id="place-student" data-testid="place-student-select">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievements">Key Achievements (Optional)</Label>
              <Textarea
                id="achievements"
                placeholder="Enter one achievement per line&#10;e.g.,&#10;Completed advanced diagnostic training&#10;Maintained 100% attendance record"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                rows={4}
                data-testid="achievements-textarea"
              />
              <p className="text-xs text-muted-foreground">One achievement per line</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlacementDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleGeneratePlacement} 
              disabled={generatePlacementMutation.isPending}
              data-testid="generate-placement-btn"
            >
              {generatePlacementMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compliance Report Dialog */}
      <Dialog open={complianceDialogOpen} onOpenChange={setComplianceDialogOpen}>
        <DialogContent data-testid="compliance-dialog">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">Generate Compliance Report</DialogTitle>
            <DialogDescription>Create an audit-ready compliance report</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Input
                id="report-type"
                placeholder="e.g., Insurance Compliance Audit Q1 2024"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                data-testid="report-type-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-summary">Summary (Optional)</Label>
              <Textarea
                id="report-summary"
                placeholder="Brief summary of the compliance report..."
                value={reportSummary}
                onChange={(e) => setReportSummary(e.target.value)}
                rows={3}
                data-testid="report-summary-textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComplianceDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleGenerateCompliance} 
              disabled={generateComplianceMutation.isPending}
              data-testid="generate-compliance-btn"
            >
              {generateComplianceMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Documents</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDocs.length} document(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
