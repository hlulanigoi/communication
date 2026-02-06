import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ShieldCheck, Award, Share2 } from "lucide-react";

export default function DocumentCenter() {
  const docs = [
    { title: "Technician Certification - Level 1", student: "Jordan Lee", date: "2024-02-10", type: "Certificate", icon: Award },
    { title: "Internship Completion Letter", student: "Taylor Reed", date: "2024-02-12", type: "Document", icon: FileText },
    { title: "Insurance Compliance Audit", student: "Admin", date: "2024-02-14", type: "Compliance", icon: ShieldCheck },
  ];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Document Center</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest">Digital Archive & Automated Document Generation</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="industrial-border">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-sm font-black italic">RECENTLY GENERATED DOCUMENTS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {docs.map((doc, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary flex items-center justify-center border-l-2 border-l-primary">
                      <doc.icon className="w-5 h-5 opacity-50" />
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-tight">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{doc.student} • {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-tighter hover:bg-primary hover:text-white">
                      <Download className="w-3.5 h-3.5 mr-1.5" /> DOWNLOAD
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="industrial-border bg-black text-white p-6 flex flex-col items-center justify-center text-center space-y-4">
            <Award className="w-12 h-12 text-primary animate-pulse" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Issue Certificate</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Generate verifiable digital certificates for students</p>
            </div>
            <Button className="w-full bg-primary text-white font-black text-xs uppercase tracking-widest">START GENERATOR</Button>
          </Card>
          
          <Card className="industrial-border p-6 flex flex-col items-center justify-center text-center space-y-4">
            <FileText className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Placement Letter</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Automated student placement & internship letters</p>
            </div>
            <Button variant="outline" className="w-full font-black text-xs uppercase tracking-widest border-2">GENERATE LETTER</Button>
          </Card>

          <Card className="industrial-border p-6 flex flex-col items-center justify-center text-center space-y-4 border-emerald-500/20">
            <ShieldCheck className="w-12 h-12 text-emerald-500" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Compliance Report</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Audit-ready insurance & workshop compliance docs</p>
            </div>
            <Button variant="outline" className="w-full font-black text-xs uppercase tracking-widest border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white">AUDIT REPORT</Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
