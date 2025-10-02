import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Upload,
  MessageSquare,
  FileSpreadsheet,
  BarChart3,
  Sparkles,
  Clock,
  PiggyBank,
  FileText,
  Zap
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    receiptsUploaded: 0,
    monthlyUploads: 0,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
        loadStats(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      toast.error("Failed to load profile");
    } else {
      setProfile(data);
    }
  };

  const loadStats = async (userId: string) => {
    const [transactions, receipts] = await Promise.all([
      supabase.from("transactions").select("amount", { count: "exact" }).eq("user_id", userId),
      supabase.from("receipts").select("*", { count: "exact" }).eq("user_id", userId),
    ]);

    if (transactions.data && receipts.data) {
      const totalAmount = transactions.data.reduce((sum, t) => sum + Number(t.amount), 0);
      setStats({
        totalTransactions: transactions.count || 0,
        totalAmount,
        receiptsUploaded: receipts.count || 0,
        monthlyUploads: profile?.monthly_uploads_used || 0,
      });
    }
  };

  const getUploadLimit = () => {
    const tier = profile?.subscription_tier || "free";
    const limits = { free: 2, starter: 50, pro: 200, business: 999999 };
    return limits[tier as keyof typeof limits];
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-primary neon-glow">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || user?.email}! 👋
          </p>
        </div>

        {/* Subscription Status */}
        <Card className="stat-card animate-fade-up hover-glow neon-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Plan: {profile?.subscription_tier?.toUpperCase() || "FREE"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Uploads</span>
                <span className="font-semibold text-primary animate-counter">{stats.monthlyUploads} / {getUploadLimit()}</span>
              </div>
              <Progress value={(stats.monthlyUploads / getUploadLimit()) * 100} className="h-2" />
              {stats.monthlyUploads >= getUploadLimit() ? (
                <p className="text-sm text-destructive">Upload limit reached. Upgrade your plan!</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {getUploadLimit() - stats.monthlyUploads} uploads remaining this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Savings Meter */}
        <Card className="stat-card hover-glow animate-fade-up neon-border bg-gradient-to-br from-primary/10 to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              Monthly Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary animate-counter">
                    {Math.floor((stats.receiptsUploaded * 5) / 60)}
                  </span>
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Money Saved</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-accent animate-counter">
                    ${(stats.receiptsUploaded * 2.5).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Based on {stats.receiptsUploaded} automated receipts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Row */}
        <Card className="stat-card hover-glow animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary hover:border-primary"
                onClick={() => navigate("/upload")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Invoice
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent/10 hover:text-accent hover:border-accent"
                onClick={() => navigate("/insights")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analyze Expenses
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary hover:border-primary"
                onClick={() => navigate("/ledger")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card hover-lift hover-glow animate-fade-up">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent animate-counter">${stats.totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="stat-card hover-lift hover-glow animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary animate-counter">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">Total entries</p>
            </CardContent>
          </Card>

          <Card className="stat-card hover-lift hover-glow animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receipts</CardTitle>
              <Receipt className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent animate-counter">{stats.receiptsUploaded}</div>
              <p className="text-xs text-muted-foreground mt-1">Processed</p>
            </CardContent>
          </Card>

          <Card className="stat-card hover-lift hover-glow animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Upload className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary animate-counter">{stats.monthlyUploads}</div>
              <p className="text-xs text-muted-foreground mt-1">Uploads used</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="stat-card cursor-pointer hover-lift hover-glow animate-fade-up" onClick={() => navigate("/upload")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 neon-border bg-primary/10 rounded-xl">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Upload Receipt</h3>
                <p className="text-sm text-muted-foreground">Scan and parse receipts with AI OCR</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover-lift hover-glow animate-fade-up" style={{ animationDelay: "0.1s" }} onClick={() => navigate("/ledger")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 neon-border bg-accent/10 rounded-xl">
                  <FileSpreadsheet className="h-12 w-12 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">View Ledger</h3>
                <p className="text-sm text-muted-foreground">Manage all your transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card cursor-pointer hover-lift hover-glow animate-fade-up" style={{ animationDelay: "0.2s" }} onClick={() => navigate("/insights")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 neon-border bg-primary/10 rounded-xl">
                  <BarChart3 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">AI Insights</h3>
                <p className="text-sm text-muted-foreground">Get personalized recommendations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="stat-card hover-glow animate-scale-in neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/chat")} variant="outline" className="w-full hover-lift">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with AI Assistant
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;