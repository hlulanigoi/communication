import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Camera, FileText, MapPin, Battery, Wifi, Signal } from 'lucide-react';
import MobileJobCreator from './MobileJobCreator';
import DocumentCapture from './DocumentCapture';

export default function FieldTechPWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [battery, setBattery] = useState(100);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBattery(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBattery(Math.round(battery.level * 100));
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">FieldTech</h1>
              <p className="text-xs text-primary-foreground/80">Job & Document Management</p>
            </div>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="destructive" className="gap-1">
                  <Wifi className="w-3 h-3" />
                  Offline
                </Badge>
              )}
              {isOnline && (
                <Badge variant="outline" className="gap-1 bg-green-500/20 border-green-500/50">
                  <Signal className="w-3 h-3" />
                  Online
                </Badge>
              )}
              <Badge variant="outline" className="gap-1 bg-blue-500/20 border-blue-500/50">
                <Battery className="w-3 h-3" />
                {battery}%
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-safe">
        <Tabs defaultValue="jobs" className="h-full w-full">
          <TabsList className="sticky top-16 z-40 w-full rounded-none border-b bg-background/95 backdrop-blur grid grid-cols-2 p-0 h-auto">
            <TabsTrigger value="jobs" className="rounded-none border-0 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <Camera className="w-4 h-4 mr-2" />
              Job Creator
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-none border-0 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <FileText className="w-4 h-4 mr-2" />
              Document Capture
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="m-0 border-0">
            <MobileJobCreator />
          </TabsContent>

          <TabsContent value="documents" className="m-0 border-0">
            <DocumentCapture />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer Status Bar */}
      <footer className="sticky bottom-0 bg-muted/50 border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          <span>Field Ready</span>
        </div>
        <div className="text-right">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </footer>
    </div>
  );
}
