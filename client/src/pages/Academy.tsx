import Layout from "@/components/Layout";
import { mockStaff } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Star, UserPlus, GraduationCap, Users, UserRound } from "lucide-react";

export default function Academy() {
  const students = mockStaff.filter(s => s.type === 'Student' || s.type === 'Intern');

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Academy Management</h1>
          <p className="text-muted-foreground mt-1">Student placements, internships, and certification tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-9 industrial-border bg-primary text-primary-foreground">
            <UserPlus className="w-4 h-4 mr-2" />
            Enroll Student
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Student Directory */}
        <Card className="md:col-span-2 industrial-border">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              CURRENT PLACEMENTS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {students.map((student) => (
                <div key={student.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary flex items-center justify-center font-bold text-xs uppercase italic">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-tight">{student.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{student.role} • {student.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-tighter hover:bg-primary hover:text-white">
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      Generate Docs
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-tighter hover:bg-primary hover:text-white">
                      <Star className="w-3.5 h-3.5 mr-1.5" />
                      Testimonial
                    </Button>
                  </div>
                </div>
              ))}
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
              <Button variant="outline" className="w-full justify-start text-xs font-bold uppercase tracking-tighter h-10 border-border/50">
                <Download className="w-4 h-4 mr-2 text-primary" />
                All Training Manuals
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs font-bold uppercase tracking-tighter h-10 border-border/50">
                <Download className="w-4 h-4 mr-2 text-primary" />
                Monthly Progress Reports
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs font-bold uppercase tracking-tighter h-10 border-border/50">
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
                  <span className="text-xl font-black font-display text-primary">12</span>
                </div>
                <div className="flex justify-between items-end border-b border-primary/10 pb-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Active Interns</span>
                  <span className="text-xl font-black font-display text-primary">4</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
