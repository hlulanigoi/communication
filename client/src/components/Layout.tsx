import { Link, useLocation } from "wouter";
import { navItems } from "@/lib/mockData";
import { Bell, Search, Settings, Menu, X, User, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Invoice Created', message: 'Invoice INV-2024-001 has been created successfully.', timestamp: '2 mins ago' },
    { id: 2, type: 'alert', title: 'Low Stock Alert', message: 'Brake Pads inventory is below minimum threshold.', timestamp: '15 mins ago' },
    { id: 3, type: 'info', title: 'Job Assigned', message: 'New job JB-2024-156 has been assigned to you.', timestamp: '1 hour ago' },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-sans selection:bg-primary/20">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <div className="flex items-center">
              <span className="font-display font-black text-2xl italic tracking-tighter text-sidebar-foreground">
                JUST<span className="text-primary NOT-italic">FIX</span>
              </span>
              <div className="flex ml-1 items-center">
                <div className="w-2 h-4 bg-primary skew-x-[-20deg]" />
                <div className="w-2 h-4 bg-primary skew-x-[-20deg] ml-0.5" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
              Platform
            </div>
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                      isActive 
                        ? "bg-sidebar-accent text-primary border-l-2 border-primary" 
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Snippet */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
              <Avatar className="w-8 h-8 rounded border border-sidebar-border">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">Service Manager</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <span className="text-sm font-display font-medium">WORKSPACE:</span>
              <span className="text-sm font-medium text-foreground">Main Workshop (HQ)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search VIN, Client, Job ID..." 
                className="pl-9 h-9 bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all font-mono text-sm"
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-muted-foreground hover:text-foreground"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </Button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {notifications.length > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 hover:bg-secondary/5 transition-colors group">
                        <div className="flex items-start gap-3">
                          <div className="pt-0.5">
                            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500/70" />}
                            {notification.type === 'alert' && <AlertCircle className="w-5 h-5 text-amber-500/70" />}
                            {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500/70" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground/60 mt-2">{notification.timestamp}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                            onClick={() => setNotifications(notifications.filter(n => n.id !== notification.id))}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                )}

                <div className="sticky bottom-0 bg-background border-t border-border p-3 text-center">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/5">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
