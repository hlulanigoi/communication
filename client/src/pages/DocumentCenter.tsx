import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, ShieldCheck, Award, Share2, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocuments, getStudents, generateCertificate, generatePlacementLetter, generateComplianceReport, deleteDocument, getDocumentDownloadUrl } from "@/lib/api";
import type { Student } from "@shared/schema";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DocumentCenter() {
  const queryClient = useQueryClient();
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [placementDialogOpen, setPlacementDialogOpen] = useState(false);
  const [complianceDialogOpen, setComplianceDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [certificateType, setCertificateType] = useState<string>("");
  const [achievements, setAchievements] = useState<string>("");
  const [reportType, setReportType] = useState<string>("");
  const [reportSummary, setReportSummary] = useState<string>("");

  // Queries
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  // Mutations
  const generateCertMutation = useMutation({
    mutationFn: generateCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Certificate generated successfully!');
      setCertificateDialogOpen(false);
      setSelectedStudent("");
      setCertificateType("");
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
      setSelectedStudent("");
      setAchievements("");
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
      setReportType("");
      setReportSummary("");
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate compliance report: ${error.message}`);
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

  // Handlers
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

  const handleDelete = (docId: string) => {
    setSelectedDocId(docId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDocId) {
      deleteMutation.mutate(selectedDocId);
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

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'Certificate': return Award;
      case 'Placement Letter': return FileText;
      case 'Compliance': return ShieldCheck;
      default: return FileText;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Document Center</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest">Digital Archive & Automated Document Generation</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Documents List */}
        <Card className="industrial-border">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-sm font-black italic">RECENTLY GENERATED DOCUMENTS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {docsLoading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents generated yet. Use the generators below to create your first document.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {documents.map((doc) => {
                  const Icon = getDocIcon(doc.type);
                  const date = doc.generatedDate ? new Date(doc.generatedDate).toLocaleDateString('en-ZA') : 'N/A';
                  
                  return (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors" data-testid={`document-item-${doc.id}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary flex items-center justify-center border-l-2 border-l-primary">
                          <Icon className="w-5 h-5 opacity-50" />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-tight">{doc.title}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{doc.studentName} • {date}</p>
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
            )}
          </CardContent>
        </Card>

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
      </div>

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
    </Layout>
  );
}
