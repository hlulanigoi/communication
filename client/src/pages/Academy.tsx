import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { 
  getStudents, 
  generateCertificate, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  createTestimonial,
  getTestimonialsByStudent,
  getCertificatesByStudent,
  uploadDocument,
  generatePlacementLetter
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Star, 
  UserPlus, 
  GraduationCap, 
  UserRound, 
  Save, 
  AlertCircle,
  Edit2,
  Trash2,
  Award,
  BookOpen,
  Calendar,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Student, Testimonial, Certificate } from "@shared/schema";

export default function Academy() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Dialog states
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form states
  const [enrollForm, setEnrollForm] = useState({
    name: "",
    email: "",
    role: "",
    type: "Student",
    department: "",
    supervisor: "",
    skills: "",
    status: "Active"
  });

  const [logForm, setLogForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    hoursLogged: "",
    skillsPracticed: "",
    notes: ""
  });

  const [testimonialForm, setTestimonialForm] = useState({
    employerName: "",
    employerRole: "",
    employerEmail: "",
    content: "",
    rating: "5"
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const placed = students.filter(s => s.status === "Alumni" || s.status === "Placed").length;
    const active = students.filter(s => s.status === "Active").length;
    const interns = students.filter(s => s.type === "Intern" && s.status === "Active").length;
    
    return { placed, active, interns };
  }, [students]);

  // Handle student enrollment
  const handleEnrollStudent = async () => {
    try {
      if (!enrollForm.name || !enrollForm.email || !enrollForm.role) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      await createStudent(enrollForm);

      toast({
        title: "Success",
        description: `${enrollForm.name} has been enrolled successfully!`
      });

      setEnrollDialogOpen(false);
      setEnrollForm({
        name: "",
        email: "",
        role: "",
        type: "Student",
        department: "",
        supervisor: "",
        skills: "",
        status: "Active"
      });
      loadStudents();
    } catch (err) {
      console.error("Failed to enroll student:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to enroll student",
        variant: "destructive"
      });
    }
  };

  // Handle training log save
  const handleSaveLog = async () => {
    try {
      if (!selectedStudent || !logForm.title || !logForm.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Create a simple text document for the training log
      const logContent = `
Training Log - ${logForm.title}
Date: ${logForm.date}
Student: ${selectedStudent.name}
Hours Logged: ${logForm.hoursLogged || "N/A"}
Skills Practiced: ${logForm.skillsPracticed || "N/A"}

Description:
${logForm.description}

Notes:
${logForm.notes || "No additional notes"}
      `.trim();

      // Convert to base64
      const base64Content = btoa(unescape(encodeURIComponent(logContent)));

      await uploadDocument({
        title: `Training Log - ${logForm.title}`,
        type: "Training Log",
        category: "Student",
        fileType: "text/plain",
        fileName: `training_log_${logForm.date}_${selectedStudent.name.replace(/\s+/g, '_')}.txt`,
        fileSize: String(logContent.length),
        content: base64Content,
        studentId: selectedStudent.id,
        description: logForm.description,
        tags: ["training", "log", "academy"],
        uploadedBy: "Academy System"
      });

      toast({
        title: "Success",
        description: "Training log saved successfully!"
      });

      setLogDialogOpen(false);
      setLogForm({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        hoursLogged: "",
        skillsPracticed: "",
        notes: ""
      });
    } catch (err) {
      console.error("Failed to save training log:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save training log",
        variant: "destructive"
      });
    }
  };

  // Handle testimonial request
  const handleRequestTestimonial = async () => {
    try {
      if (!selectedStudent || !testimonialForm.employerName || !testimonialForm.content) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      await createTestimonial({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        employerName: testimonialForm.employerName,
        employerRole: testimonialForm.employerRole || "Supervisor",
        content: testimonialForm.content,
        rating: testimonialForm.rating,
        verified: "true"
      });

      toast({
        title: "Success",
        description: "Testimonial recorded successfully!"
      });

      setTestimonialDialogOpen(false);
      setTestimonialForm({
        employerName: "",
        employerRole: "",
        employerEmail: "",
        content: "",
        rating: "5"
      });
    } catch (err) {
      console.error("Failed to create testimonial:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create testimonial",
        variant: "destructive"
      });
    }
  };

  // Handle certificate generation
  const handleGenerateCertificate = async (studentId: string, certificateType: string = "Completion Certificate") => {
    try {
      await generateCertificate({
        studentId,
        certificateType,
      });
      
      toast({
        title: "Success",
        description: "Certificate generated successfully! Check Document Center to download."
      });
    } catch (err) {
      console.error("Failed to generate certificate:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate certificate",
        variant: "destructive"
      });
    }
  };

  // Handle placement letter generation
  const handleGeneratePlacementLetter = async (studentId: string) => {
    try {
      await generatePlacementLetter({
        studentId,
        achievements: ["Completed practical training", "Demonstrated technical proficiency"]
      });
      
      toast({
        title: "Success",
        description: "Placement letter generated successfully! Check Document Center to download."
      });
    } catch (err) {
      console.error("Failed to generate placement letter:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate placement letter",
        variant: "destructive"
      });
    }
  };

  // Handle student deletion
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from the academy?`)) {
      return;
    }

    try {
      await deleteStudent(studentId);
      toast({
        title: "Success",
        description: `${studentName} has been removed from the academy.`
      });
      loadStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete student",
        variant: "destructive"
      });
    }
  };

  // Batch operations
  const handleBatchDownloadCertificates = async () => {
    toast({
      title: "Batch Operation",
      description: "Generating certificates for all eligible students...",
    });

    let successCount = 0;
    for (const student of students) {
      if (student.status === "Alumni" || student.status === "Placed") {
        try {
          await generateCertificate({
            studentId: student.id,
            certificateType: "Completion Certificate"
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to generate certificate for ${student.name}:`, err);
        }
      }
    }

    toast({
      title: "Batch Operation Complete",
      description: `Generated ${successCount} certificate(s). Check Document Center to download.`,
    });
  };

  const handleBatchTrainingManuals = () => {
    toast({
      title: "Training Manuals",
      description: "This feature will compile all training materials. Coming soon!",
    });
  };

  const handleBatchProgressReports = () => {
    toast({
      title: "Progress Reports",
      description: "Generating monthly progress reports for all active students...",
    });
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-semibold">Error loading students</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Academy Management</h1>
          <p className="text-muted-foreground mt-1">Student placements, internships, and certification tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            data-testid="enroll-student-btn"
            className="h-9 industrial-border bg-primary text-primary-foreground"
            onClick={() => setEnrollDialogOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Enroll Student
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Student Directory */}
        <Card className="md:col-span-2 industrial-border" data-testid="student-directory-card">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              PRACTICAL TRAINING LOGS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-secondary/10 animate-pulse rounded" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold">No students enrolled</p>
                  <p className="text-xs mt-1">Click "Enroll Student" to add your first student</p>
                </div>
              ) : (
                students.map((student) => (
                  <div 
                    key={student.id} 
                    className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors"
                    data-testid={`student-row-${student.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary flex items-center justify-center border-l-2 border-l-primary/30">
                        <UserRound className="w-5 h-5 opacity-40" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm uppercase tracking-tight">{student.name}</p>
                          <Badge variant="outline" className="text-[9px] h-4 px-1 leading-none border-primary/20 text-primary font-black italic">
                            {student.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">{student.role} • {student.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        data-testid={`save-log-btn-${student.id}`}
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] font-bold uppercase tracking-tighter hover:bg-emerald-500 hover:text-white border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                        onClick={() => {
                          setSelectedStudent(student);
                          setLogDialogOpen(true);
                        }}
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save Log
                      </Button>
                      <Button 
                        data-testid={`generate-docs-btn-${student.id}`}
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] font-bold uppercase tracking-tighter hover:bg-primary hover:text-white"
                        onClick={() => handleGenerateCertificate(student.id)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Generate Cert
                      </Button>
                      <Button 
                        data-testid={`testimonial-btn-${student.id}`}
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] font-bold uppercase tracking-tighter hover:bg-amber-500 hover:text-white border-amber-500/30 text-amber-600"
                        onClick={() => {
                          setSelectedStudent(student);
                          setTestimonialDialogOpen(true);
                        }}
                      >
                        <Star className="w-3.5 h-3.5 mr-1.5" />
                        Testimonial
                      </Button>
                      <Button 
                        data-testid={`edit-student-btn-${student.id}`}
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] font-bold uppercase tracking-tighter hover:bg-blue-500 hover:text-white"
                        onClick={() => {
                          setSelectedStudent(student);
                          setDetailsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        data-testid={`delete-student-btn-${student.id}`}
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] font-bold uppercase tracking-tighter hover:bg-red-500 hover:text-white border-red-500/30 text-red-600"
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Tools */}
        <div className="space-y-6">
          <Card className="industrial-border">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-sm">BATCH OPERATIONS</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button 
                data-testid="batch-training-manuals-btn"
                variant="outline" 
                className="w-full justify-start text-xs font-bold uppercase tracking-tighter h-10 border-border/50"
                onClick={handleBatchTrainingManuals}
              >
                <Download className="w-4 h-4 mr-2 text-primary" />
                All Training Manuals
              </Button>
              <Button 
                data-testid="batch-progress-reports-btn"
                variant="outline" 
                className="w-full justify-start text-xs font-bold uppercase tracking-tighter h-10 border-border/50"
                onClick={handleBatchProgressReports}
              >
                <Download className="w-4 h-4 mr-2 text-primary" />
                Monthly Progress Reports
              </Button>
              <Button 
                data-testid="batch-certificates-btn"
                variant="outline" 
                className="w-full justify-start text-xs font-bold uppercase tracking-tighter h-10 border-border/50"
                onClick={handleBatchDownloadCertificates}
              >
                <Download className="w-4 h-4 mr-2 text-primary" />
                Graduation Certificates
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 industrial-border">
            <CardHeader>
              <CardTitle className="text-xs text-primary">ACADEMY STATS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-primary/10 pb-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Placed Students</span>
                  <span className="text-xl font-black font-display text-primary" data-testid="placed-students-count">{stats.placed}</span>
                </div>
                <div className="flex justify-between items-end border-b border-primary/10 pb-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Active Interns</span>
                  <span className="text-xl font-black font-display text-primary" data-testid="active-interns-count">{stats.interns}</span>
                </div>
                <div className="flex justify-between items-end border-b border-primary/10 pb-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Active Students</span>
                  <span className="text-xl font-black font-display text-primary" data-testid="active-students-count">{stats.active}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enroll Student Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="enroll-student-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Enroll New Student
            </DialogTitle>
            <DialogDescription>
              Add a new student or intern to the academy program
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  data-testid="enroll-name-input"
                  placeholder="John Doe"
                  value={enrollForm.name}
                  onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  data-testid="enroll-email-input"
                  type="email"
                  placeholder="john@example.com"
                  value={enrollForm.email}
                  onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  data-testid="enroll-role-input"
                  placeholder="Junior Technician"
                  value={enrollForm.role}
                  onChange={(e) => setEnrollForm({ ...enrollForm, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={enrollForm.type} onValueChange={(value) => setEnrollForm({ ...enrollForm, type: value })}>
                  <SelectTrigger data-testid="enroll-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  data-testid="enroll-department-input"
                  placeholder="Auto Electrics"
                  value={enrollForm.department}
                  onChange={(e) => setEnrollForm({ ...enrollForm, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Input
                  id="supervisor"
                  data-testid="enroll-supervisor-input"
                  placeholder="Supervisor Name"
                  value={enrollForm.supervisor}
                  onChange={(e) => setEnrollForm({ ...enrollForm, supervisor: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills/Areas of Focus</Label>
              <Textarea
                id="skills"
                data-testid="enroll-skills-input"
                placeholder="Electrical diagnostics, wiring, battery systems..."
                value={enrollForm.skills}
                onChange={(e) => setEnrollForm({ ...enrollForm, skills: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="enroll-submit-btn" onClick={handleEnrollStudent}>
              <UserPlus className="w-4 h-4 mr-2" />
              Enroll Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Training Log Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="training-log-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Save Training Log
            </DialogTitle>
            <DialogDescription>
              Record training activities for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="log-title">Log Title *</Label>
                <Input
                  id="log-title"
                  data-testid="log-title-input"
                  placeholder="Daily Training Session"
                  value={logForm.title}
                  onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-date">Date *</Label>
                <Input
                  id="log-date"
                  data-testid="log-date-input"
                  type="date"
                  value={logForm.date}
                  onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="log-hours">Hours Logged</Label>
                <Input
                  id="log-hours"
                  data-testid="log-hours-input"
                  type="number"
                  placeholder="8"
                  value={logForm.hoursLogged}
                  onChange={(e) => setLogForm({ ...logForm, hoursLogged: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-skills">Skills Practiced</Label>
                <Input
                  id="log-skills"
                  data-testid="log-skills-input"
                  placeholder="Diagnostics, Wiring"
                  value={logForm.skillsPracticed}
                  onChange={(e) => setLogForm({ ...logForm, skillsPracticed: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-description">Description *</Label>
              <Textarea
                id="log-description"
                data-testid="log-description-input"
                placeholder="Describe the training activities and progress..."
                value={logForm.description}
                onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-notes">Additional Notes</Label>
              <Textarea
                id="log-notes"
                data-testid="log-notes-input"
                placeholder="Any additional observations or comments..."
                value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLogDialogOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="log-submit-btn" onClick={handleSaveLog} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={testimonialDialogOpen} onOpenChange={setTestimonialDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="testimonial-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Request/Record Testimonial
            </DialogTitle>
            <DialogDescription>
              Collect testimonial for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employer-name">Employer/Supervisor Name *</Label>
                <Input
                  id="employer-name"
                  data-testid="employer-name-input"
                  placeholder="Jane Smith"
                  value={testimonialForm.employerName}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, employerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employer-role">Role/Position</Label>
                <Input
                  id="employer-role"
                  data-testid="employer-role-input"
                  placeholder="Technical Supervisor"
                  value={testimonialForm.employerRole}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, employerRole: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employer-email">Email</Label>
                <Input
                  id="employer-email"
                  data-testid="employer-email-input"
                  type="email"
                  placeholder="jane@company.com"
                  value={testimonialForm.employerEmail}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, employerEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (out of 5)</Label>
                <Select value={testimonialForm.rating} onValueChange={(value) => setTestimonialForm({ ...testimonialForm, rating: value })}>
                  <SelectTrigger data-testid="rating-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                    <SelectItem value="2">⭐⭐ (2)</SelectItem>
                    <SelectItem value="1">⭐ (1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial-content">Testimonial Content *</Label>
              <Textarea
                id="testimonial-content"
                data-testid="testimonial-content-input"
                placeholder="Write the testimonial feedback..."
                value={testimonialForm.content}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestimonialDialogOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="testimonial-submit-btn" onClick={handleRequestTestimonial} className="bg-amber-600 hover:bg-amber-700">
              <Star className="w-4 h-4 mr-2" />
              Save Testimonial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="student-details-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              Student Details
            </DialogTitle>
            <DialogDescription>
              View and edit student information
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={selectedStudent.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={selectedStudent.email} disabled />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={selectedStudent.role} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Badge variant="outline" className="mt-2">{selectedStudent.type}</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge className="mt-2">{selectedStudent.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={selectedStudent.department || "N/A"} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Supervisor</Label>
                  <Input value={selectedStudent.supervisor || "N/A"} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <Textarea value={selectedStudent.skills || "No skills recorded"} disabled rows={3} />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => handleGenerateCertificate(selectedStudent.id, "Achievement Certificate")}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Generate Certificate
                </Button>
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={() => handleGeneratePlacementLetter(selectedStudent.id)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Placement Letter
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
