import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Upload,
  FileSpreadsheet,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Calculator
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
  user: any;
}

const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const navigate = useNavigate();

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
    { icon: FileSpreadsheet, label: "Ledger", path: "/ledger" },
    { icon: BarChart3, label: "Insights", path: "/insights" },
    { icon: MessageSquare, label: "AI Chat", path: "/chat" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3lhbiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border glass-card p-4 flex flex-col z-50">
        <div className="flex items-center gap-2 mb-8 animate-fade-in">
          <div className="p-2 neon-border bg-primary/10 rounded-xl animate-pulse-glow">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-primary">AI Bookkeeper</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item, index) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className={`w-full justify-start hover-lift animate-fade-in ${
                location.pathname === item.path ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => navigate(item.path)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover-lift" 
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;