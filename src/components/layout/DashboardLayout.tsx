import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Home,
  Upload,
  FileText,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  Calculator,
  Menu,
  Sparkles,
} from "lucide-react";
import FloatingChat from "@/components/FloatingChat";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
  user: any;
}

const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Upload, label: "Upload", path: "/upload" },
    { icon: FileText, label: "Ledger", path: "/ledger" },
    { icon: TrendingUp, label: "Insights", path: "/insights" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
            <Calculator className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-primary text-sm md:text-base">AI Bookkeeper</h2>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? "secondary" : "ghost"}
            className={`w-full justify-start text-sm md:text-base ${
              location.pathname === item.path 
                ? "bg-primary/20 text-primary hover:bg-primary/30" 
                : "hover:bg-muted"
            }`}
            onClick={() => {
              navigate(item.path);
              setIsOpen(false);
            }}
          >
            <item.icon className="mr-2 md:mr-3 h-4 w-4" />
            {item.label}
          </Button>
        ))}
        
        {/* AI Chat Button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-sm md:text-base hover:bg-muted"
          onClick={() => {
            setIsChatOpen(true);
            setIsOpen(false);
          }}
        >
          <MessageSquare className="mr-2 md:mr-3 h-4 w-4" />
          AI Chat
        </Button>
      </nav>

      {/* Sign Out */}
      <div className="p-3 md:p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-sm md:text-base"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 md:mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full">
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-xl">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-bold text-primary">AI Bookkeeper</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg"
                onClick={() => navigate("/settings")}
              >
                <Sparkles className="mr-1 h-4 w-4" />
                Upgrade
              </Button>
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 bg-card/95 backdrop-blur-xl">
                  <div className="flex flex-col h-full">
                    <SidebarContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
          <SidebarContent />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {/* Desktop Header with Upgrade Button */}
        {!isMobile && (
          <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Welcome back, {user?.email}</span>
              </div>
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg"
                onClick={() => navigate("/settings")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                🚀 Upgrade Plan
              </Button>
            </div>
          </div>
        )}
        
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Floating Chat Widget */}
      <FloatingChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} userId={user?.id} />
    </div>
  );
};

export default DashboardLayout;
