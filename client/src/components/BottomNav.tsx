import { Link, useLocation } from "wouter";
import { Home, Wrench, Package, Users, FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/vehicles", icon: Wrench, label: "Vehicles" },
  { href: "/jobs", icon: LayoutDashboard, label: "Jobs" },
  { href: "/inventory", icon: Package, label: "Parts" },
  { href: "/clients", icon: Users, label: "Clients" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <a
                data-testid={`bottom-nav-${item.label.toLowerCase()}`}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:scale-95"
                )}
              >
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-all",
                    isActive && "scale-110"
                  )}
                />
                <span className="text-[10px] font-medium tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
