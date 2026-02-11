import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface MobileScreenProps {
  children: React.ReactNode;
  onBack?: () => void;
  title?: string;
}

/**
 * Mobile-optimized screen wrapper
 * Ensures full mobile viewport with proper spacing and navbar integration
 */
export default function MobileScreen({ children, onBack, title }: MobileScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Mobile Header */}
      {(title || onBack) && (
        <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-muted rounded-lg transition-colors active:bg-muted"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {title && <h2 className="text-lg font-semibold flex-1">{title}</h2>}
        </div>
      )}

      {/* Content - account for bottom nav */}
      <div className="flex-1 overflow-y-auto pb-24">
        {children}
      </div>
    </div>
  );
}
