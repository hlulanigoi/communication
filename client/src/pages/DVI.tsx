import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Camera, Smartphone, Send, ShieldCheck } from "lucide-react";

export default function DVI() {
  const sections = [
    { title: "Battery & Electrical", status: "Critical", icon: AlertCircle, items: ["Battery Health", "Alternator Output", "Starter Motor"] },
    { title: "Lighting System", status: "Good", icon: CheckCircle2, items: ["Headlights", "Indicators", "Brake Lights"] },
    { title: "Diagnostics", status: "Attention", icon: AlertCircle, items: ["Fault Codes", "Wiring Harness", "Sensor Status"] },
  ];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground text-glow-red">Digital Inspection</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest italic">Technician: Alex Miller • Job: J-2024-001</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 industrial-border border-primary/50 text-primary">
            <Camera className="w-4 h-4 mr-2" /> Capture Media
          </Button>
          <Button className="h-9 industrial-border bg-primary text-primary-foreground">
            <Send className="w-4 h-4 mr-2" /> Send to Client
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {sections.map((section, i) => (
            <Card key={i} className="industrial-border overflow-hidden">
              <CardHeader className="bg-muted/30 flex flex-row items-center justify-between p-4 border-b border-border/50">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <section.icon className={`w-4 h-4 ${section.status === 'Good' ? 'text-emerald-500' : 'text-primary'}`} />
                  {section.title.toUpperCase()}
                </CardTitle>
                <Badge className={section.status === 'Good' ? 'bg-emerald-500' : 'bg-primary'}>
                  {section.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {section.items.map((item, j) => (
                    <div key={j} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                      <span className="text-sm font-bold uppercase tracking-tight">{item}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] border-emerald-500/50 text-emerald-500 hover:bg-emerald-500 hover:text-white">GOOD</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white">MAYBE</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] border-primary/50 text-primary hover:bg-primary hover:text-white">FAIL</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="industrial-border bg-black text-white">
            <CardHeader>
              <CardTitle className="text-xs font-black text-primary">MEDIA ATTACHMENTS</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-white/10 flex items-center justify-center border border-white/20 group cursor-pointer hover:border-primary transition-all">
                <Camera className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </div>
              <div className="aspect-square bg-white/10 flex items-center justify-center border border-white/20 group cursor-pointer hover:border-primary transition-all">
                <Camera className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-border border-primary">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-xs font-black text-primary">CLIENT APPROVAL HUB</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-secondary/10 border-l-2 border-l-primary">
                <Smartphone className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-bold uppercase leading-tight">SMS Approval Link Active</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/10 border-l-2 border-l-emerald-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] font-bold uppercase leading-tight">Insurance Claim Pre-Authorized</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
