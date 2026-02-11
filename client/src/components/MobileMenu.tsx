import { X, Settings, LogOut, User, FileText, DollarSign, MessageSquare, BarChart3, GraduationCap, Receipt } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const secondaryNavItems = [
  { href: "/billing", icon: DollarSign, label: "Billing" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/dvi", icon: Receipt, label: "DVI" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/communication", icon: MessageSquare, label: "Communication" },
  { href: "/academy", icon: GraduationCap, label: "Academy" },
  { href: "/admin-bills", icon: Receipt, label: "Admin Bills" },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-card border-l border-border z-50 transform transition-transform duration-300 ease-out pt-safe",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-display font-bold text-lg">MENU</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9"
              data-testid="mobile-menu-close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">Service Manager</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              More Features
            </div>
            {secondaryNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors active:scale-95"
                  data-testid={`menu-${item.label.toLowerCase().replace(/ /g, '-')}`}
                >
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              data-testid="menu-settings"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              data-testid="menu-logout"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
