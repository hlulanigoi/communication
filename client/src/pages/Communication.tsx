import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Users, Hash, Phone, Video } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const channels = ["announcements", "workshop-floor", "parts-procurement", "service-advisors"];
const contacts = [
  { name: "Alex Miller", role: "Lead Mechanic", status: "online" },
  { name: "Sam Knight", role: "Service Advisor", status: "online" },
  { name: "Jessica Low", role: "Inventory", status: "away" },
  { name: "Admin (You)", role: "Manager", status: "online" }
];

export default function Communication() {
  const [activeChannel, setActiveChannel] = useState("workshop-floor");

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
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>AM</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">Alex Miller</span>
                      <span className="text-[10px] text-muted-foreground">10:45 AM</span>
                    </div>
                    <div className="bg-secondary/20 rounded-lg p-3 text-sm">
                      Has anyone seen the diagnostic report for the RS6 (V001)? The intake manifold looks questionable.
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">Sam Knight</span>
                      <span className="text-[10px] text-muted-foreground">10:48 AM</span>
                    </div>
                    <div className="bg-secondary/20 rounded-lg p-3 text-sm">
                      Just uploaded it to the vehicle documents. Marcus (the owner) is asking for an update by noon.
                    </div>
                  </div>
                </div>

                <div className="flex flex-row-reverse gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 items-end max-w-[80%]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] text-muted-foreground">10:50 AM</span>
                      <span className="font-semibold text-sm">Admin</span>
                    </div>
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 text-sm">
                      I'll review the report now. Alex, please hold off on ordering parts until I confirm the quote with Finance.
                    </div>
                  </div>
                </div>
              </div>
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
