import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Users, Hash, Phone, Video, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getHRNotes, getStaff } from "@/lib/api";
import type { HRNote, Staff } from "@shared/schema";

const channels = ["announcements", "workshop-floor", "parts-procurement", "service-advisors"];

export default function Communication() {
  const [activeChannel, setActiveChannel] = useState("workshop-floor");
  const [notes, setNotes] = useState<HRNote[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [notesData, staffData] = await Promise.all([
          getHRNotes(),
          getStaff()
        ]);
        setNotes(notesData);
        setStaff(staffData.slice(0, 4));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const contacts = staff.length > 0 ? staff.map(s => ({
    name: s.name,
    role: s.role || 'Staff',
    status: 'online' as const
  })) : [
    { name: "Loading...", role: "Please wait", status: "online" as const }
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold">Staff Communication</h1>
            <p className="text-sm text-muted-foreground">Internal messaging and collaboration.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon"><Phone className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon"><Video className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Sidebar */}
          <Card className="w-64 flex flex-col bg-secondary/5 border-border/50">
            <div className="p-4 flex-1 space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Channels</h3>
                <div className="space-y-1">
                  {channels.map(c => (
                    <Button 
                      key={c} 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start font-medium text-sm h-9 px-2",
                        activeChannel === c ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                      )}
                      onClick={() => setActiveChannel(c)}
                    >
                      <Hash className="w-4 h-4 mr-2 opacity-50" />
                      {c}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Direct Messages</h3>
                <div className="space-y-1">
                  {contacts.map(contact => (
                    <Button key={contact.name} variant="ghost" className="w-full justify-start h-10 px-2 group">
                      <div className="relative mr-3">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[10px]">{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-card",
                          contact.status === 'online' ? "bg-emerald-500" : "bg-slate-400"
                        )} />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{contact.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{contact.role}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden bg-card">
            <CardHeader className="border-b border-border/50 py-3 px-4 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">{activeChannel}</CardTitle>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <Avatar key={i} className="w-7 h-7 border-2 border-card">
                    <AvatarFallback className="text-[9px]">U{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
              {loading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-32" />
                        <div className="h-16 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex gap-3 items-start p-4 bg-rose-500/10 border border-rose-500/20 rounded">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-600">{error}</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No messages in {activeChannel}</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {notes.slice(0, 3).map((note, i) => (
                    <div key={i} className={`flex ${i === notes.length - 1 ? 'flex-row-reverse' : ''} gap-3`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{note.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col gap-1 max-w-[80%] ${i === notes.length - 1 ? 'items-end' : ''}`}>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm">{note.author}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(note.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className={`rounded-lg p-3 text-sm ${
                          i === notes.length - 1 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary/20'
                        }`}>
                          {note.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t border-border/50">
              <div className="relative">
                <Input 
                  placeholder={`Message #${activeChannel}`} 
                  className="pr-12 h-11 bg-secondary/10 border-border focus-visible:ring-primary/30"
                />
                <Button size="icon" className="absolute right-1 top-1 h-9 w-9 bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4 text-primary-foreground" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
