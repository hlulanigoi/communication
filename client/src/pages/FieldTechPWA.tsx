import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Camera, FileText, MapPin, Battery, Wifi, Signal, ChevronRight } from 'lucide-react';
import MobileJobCreator from './MobileJobCreator';
import DocumentCapture from './DocumentCapture';
import MobileScreen from '@/components/MobileScreen';

export default function FieldTechPWA() {
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'documents'>('home');
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col safe-area-inset">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg pt-safe">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">FieldTech</h1>
              <p className="text-xs text-primary-foreground/75">Ready to work</p>
            </div>
            <div className="flex items-center gap-1">
              {!isOnline && (
                <Badge variant="secondary" className="gap-1 px-2 py-1 text-xs">
                  <Wifi className="w-3 h-3" />
                  Offline
                </Badge>
              )}
              {isOnline && (
                <Badge className="gap-1 px-2 py-1 text-xs bg-green-600">
                  <Signal className="w-3 h-3" />
                  Online
                </Badge>
              )}
              <Badge variant="outline" className="gap-1 px-2 py-1 text-xs">
                <Battery className="w-2.5 h-2.5" />
                {battery}%
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'home' && (
          <div className="px-4 py-6 space-y-4">
            {/* Quick Overview */}
            <div className="bg-card rounded-lg border p-4 space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
              
              {/* Job Creator Button */}
              <button
                onClick={() => setActiveTab('jobs')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg p-4 flex items-center justify-between transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-base">Create Job</p>
                    <p className="text-xs text-blue-100">Capture with camera & voice</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Document Capture Button */}
              <button
                onClick={() => setActiveTab('documents')}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg p-4 flex items-center justify-between transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-base">Digitize Document</p>
                    <p className="text-xs text-orange-100">Scan invoices & receipts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Info Section */}
            <div className="bg-secondary/30 rounded-lg border border-secondary p-4 space-y-2">
              <p className="text-sm font-medium">💡 Tips</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Take photos in good lighting for accurate OCR</li>
                <li>• Use voice notes to capture extra details</li>
                <li>• All data syncs automatically when online</li>
                <li>• Works completely offline for later sync</li>
              </ul>
            </div>

            {/* Status Card */}
            <div className="bg-card rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Location Status</span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Ready
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Sync Status</span>
                <span className="font-medium">{isOnline ? '✓ Ready' : '⏸ Offline'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <MobileScreen 
            title="Create Job" 
            onBack={() => setActiveTab('home')}
          >
            <MobileJobCreator />
          </MobileScreen>
        )}

        {activeTab === 'documents' && (
          <MobileScreen 
            title="Digitize Document" 
            onBack={() => setActiveTab('home')}
          >
            <DocumentCapture />
          </MobileScreen>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg pb-safe">
        <div className="flex gap-1 p-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-3 px-2 rounded-lg text-center text-xs font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-3 px-2 rounded-lg text-center text-xs font-medium flex flex-col items-center gap-1 transition-all ${
              activeTab === 'jobs'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Camera className="w-4 h-4" />
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-3 px-2 rounded-lg text-center text-xs font-medium flex flex-col items-center gap-1 transition-all ${
              activeTab === 'documents'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FileText className="w-4 h-4" />
            Docs
          </button>
        </div>
      </nav>
    </div>
  );
}
