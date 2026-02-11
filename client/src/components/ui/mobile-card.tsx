import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-lg p-4 shadow-sm",
        onClick && "active:scale-[0.98] transition-transform cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardHeader({ children, className }: MobileCardHeaderProps) {
  return (
    <div className={cn("mb-3", className)}>
      {children}
    </div>
  );
}

interface MobileCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardTitle({ children, className }: MobileCardTitleProps) {
  return (
    <h3 className={cn("font-display font-bold text-base uppercase tracking-tight", className)}>
      {children}
    </h3>
  );
}

interface MobileCardContentProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardContent({ children, className }: MobileCardContentProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

interface MobileCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardFooter({ children, className }: MobileCardFooterProps) {
  return (
    <div className={cn("mt-3 pt-3 border-t border-border flex items-center gap-2", className)}>
      {children}
    </div>
  );
}
