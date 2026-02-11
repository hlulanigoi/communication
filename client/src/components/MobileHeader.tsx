import { Bell, Search, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";
import MobileSearch from "./MobileSearch";

export default function MobileHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border pt-safe">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl italic tracking-tighter text-foreground">
              JUST<span className="text-primary NOT-italic">FIX</span>
            </span>
            <div className="flex items-center space-x-0.5">
              <div className="w-1.5 h-4 bg-primary skew-x-[-20deg]" />
              <div className="w-1.5 h-4 bg-primary/60 skew-x-[-20deg]" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              onClick={() => setShowSearch(true)}
              data-testid="mobile-search-button"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground relative"
              data-testid="mobile-notifications-button"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              onClick={() => setShowMenu(true)}
              data-testid="mobile-menu-button"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
      
      {/* Mobile Search Modal */}
      <MobileSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
