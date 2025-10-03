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
  ChevronDown,
  ChevronRight,
  FileUp,
  QrCode,
  FileSpreadsheet,
  Eye,
  GitCompareArrows,
  Users,
  BarChart3,
  DollarSign,
  TrendingUpIcon,
  FileBarChart,
  Store,
  User,
  Building2,
  Shield,
  Plug,
  Crown,
  AlertTriangle,
  TrendingDown,
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem('sidebar-expanded-groups');
    return saved ? JSON.parse(saved) : [];
  });

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
    { 
      icon: Upload, 
      label: "Upload", 
      path: "/upload",
      subItems: [
        { icon: FileUp, label: "Upload Files", tab: "files" },
        { icon: QrCode, label: "Scan QR", tab: "qr" },
        { icon: FileSpreadsheet, label: "Import CSV", tab: "csv" },
      ]
    },
    { 
      icon: FileText, 
      label: "Ledger", 
      path: "/ledger",
      subItems: [
        { icon: Eye, label: "All Transactions", tab: "all" },
        { icon: FileText, label: "Needs Review", tab: "review" },
        { icon: GitCompareArrows, label: "Reconciliation", tab: "reconcile" },
        { icon: Users, label: "Vendors", tab: "vendors" },
      ]
    },
    { 
      icon: TrendingUp, 
      label: "Insights", 
      path: "/insights",
      subItems: [
        { icon: BarChart3, label: "Analytics", tab: "analytics" },
        { icon: DollarSign, label: "Budgets & Alerts", tab: "budgets" },
        { icon: TrendingUpIcon, label: "Forecasting", tab: "forecast" },
        { icon: FileBarChart, label: "Reports", tab: "reports" },
        { icon: Store, label: "Industry Packs", tab: "industry" },
      ]
    },
    { 
      icon: Shield, 
      label: "Owner Tools", 
      path: "/owner-tools",
      subItems: [
        { icon: Settings, label: "Control Panel", tab: "control" },
        { icon: Eye, label: "Transparency", tab: "transparency" },
        { icon: AlertTriangle, label: "Fraud Detection", tab: "fraud" },
        { icon: TrendingDown, label: "Cost Control", tab: "costs" },
        { icon: Sparkles, label: "Automation", tab: "automation" },
        { icon: TrendingUp, label: "Growth & Planning", tab: "growth" },
      ]
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/settings",
      subItems: [
        { icon: User, label: "Profile", tab: "profile" },
        { icon: Building2, label: "Business Type", tab: "business-type" },
        { icon: Shield, label: "Team & Audit", tab: "audit" },
        { icon: Plug, label: "Integrations", tab: "integrations" },
        { icon: Crown, label: "Plan & Usage", tab: "plan" },
      ]
    },
  ];

  const toggleGroup = (path: string) => {
    setExpandedGroups(prev => {
      const newGroups = prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path];
      localStorage.setItem('sidebar-expanded-groups', JSON.stringify(newGroups));
      return newGroups;
    });
  };

  const isGroupExpanded = (path: string) => expandedGroups.includes(path);

  const isTabActive = (path: string, tab?: string) => {
    const params = new URLSearchParams(window.location.search);
    const currentTab = params.get('tab');
    return location.pathname === path && (!tab || currentTab === tab);
  };

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
      <nav className="flex-1 p-3 md:p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isParentActive = location.pathname === item.path;
          const hasActiveChild = item.subItems?.some(sub => isTabActive(item.path, sub.tab));
          
          return (
            <div key={item.path} className="mt-2 first:mt-0">
              <button
                className={`
                  relative w-full h-11 px-3 rounded-xl flex items-center gap-2
                  font-medium text-foreground/90 transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-0
                  ${isParentActive || hasActiveChild
                    ? 'bg-white/10 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 before:absolute before:left-0 before:h-5/6 before:w-0.5 before:rounded-full before:bg-sky-400/80'
                    : 'hover:bg-white/5 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400'
                  }
                `}
                onClick={(e) => {
                  if (item.subItems) {
                    toggleGroup(item.path);
                    // Allow navigation on parent click
                    if (!e.ctrlKey && !e.metaKey) {
                      navigate(item.path);
                      setIsOpen(false);
                    }
                  } else {
                    navigate(item.path);
                    setIsOpen(false);
                  }
                }}
                aria-expanded={item.subItems ? isGroupExpanded(item.path) : undefined}
                aria-current={isParentActive ? 'page' : undefined}
              >
                <item.icon className={`h-4 w-4 ${isParentActive || hasActiveChild ? 'text-sky-400' : ''}`} />
                <span className={`flex-1 text-left ${isParentActive || hasActiveChild ? '' : 'text-foreground/90'}`}>
                  {item.label}
                </span>
                {item.subItems && (
                  <button
                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(item.path);
                    }}
                    aria-label={isGroupExpanded(item.path) ? "Collapse" : "Expand"}
                  >
                    {isGroupExpanded(item.path) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </button>
                )}
              </button>
              
              {item.subItems && isGroupExpanded(item.path) && (
                <div className="mt-1 space-y-1">
                  {item.subItems.map((subItem) => {
                    const isActive = isTabActive(item.path, subItem.tab);
                    return (
                      <button
                        key={subItem.tab}
                        className={`
                          relative w-full h-10 pl-8 pr-3 rounded-lg flex items-center gap-2
                          font-normal text-foreground/70 transition-all duration-200
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-0
                          ${isActive
                            ? 'bg-white/10 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 before:absolute before:left-0 before:h-5/6 before:w-0.5 before:rounded-full before:bg-sky-400/80'
                            : 'hover:bg-white/5 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400'
                          }
                        `}
                        onClick={() => {
                          navigate(`${item.path}?tab=${subItem.tab}`);
                          setIsOpen(false);
                        }}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <subItem.icon className={`h-3.5 w-3.5 transition-opacity ${isActive ? 'opacity-100 text-sky-400' : 'opacity-70 group-hover:opacity-100'}`} />
                        <span className={`text-sm ${isActive ? '' : 'text-foreground/70'}`}>
                          {subItem.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        
        {/* AI Chat Button */}
        <div className="mt-2">
          <button
            className="
              relative w-full h-11 px-3 rounded-xl flex items-center gap-2
              font-medium text-foreground/90 transition-all duration-200
              hover:bg-white/5 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-0
            "
            onClick={() => {
              setIsChatOpen(true);
              setIsOpen(false);
            }}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="flex-1 text-left text-foreground/90">AI Chat</span>
          </button>
        </div>
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
