import React from 'react';

interface FieldTechLayoutProps {
  children: React.ReactNode;
}

/**
 * Simplified layout for field technicians
 * No sidebar, no complex navigation - just the essentials
 */
export default function FieldTechLayout({ children }: FieldTechLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
