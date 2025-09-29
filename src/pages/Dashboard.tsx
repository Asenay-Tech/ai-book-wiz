import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Upload,
  MessageSquare,
  FileSpreadsheet,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
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
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || user?.email}!
          </p>
        </div>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Plan: {profile?.subscription_tier?.toUpperCase() || "FREE"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Uploads</span>
                <span>{stats.monthlyUploads} / {getUploadLimit()}</span>
              </div>
              <Progress value={(stats.monthlyUploads / getUploadLimit()) * 100} />
              {stats.monthlyUploads >= getUploadLimit() && (
                <p className="text-sm text-destructive">Upload limit reached. Upgrade your plan!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receipts</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.receiptsUploaded}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyUploads}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/upload")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Upload className="h-12 w-12 text-primary" />
                <h3 className="font-semibold">Upload Receipt</h3>
                <p className="text-sm text-muted-foreground">Scan and parse receipts with AI</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/ledger")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <FileSpreadsheet className="h-12 w-12 text-primary" />
                <h3 className="font-semibold">View Ledger</h3>
                <p className="text-sm text-muted-foreground">Manage all transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/insights")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-primary" />
                <h3 className="font-semibold">AI Insights</h3>
                <p className="text-sm text-muted-foreground">Get financial recommendations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/chat")} variant="outline" className="w-full">
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