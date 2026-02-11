import MobileHeader from "./MobileHeader";
import BottomNav from "./BottomNav";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <MobileHeader />
      
      {/* Main Content with bottom padding for nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
