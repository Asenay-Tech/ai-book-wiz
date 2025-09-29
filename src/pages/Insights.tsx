import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, TrendingUp, PieChart } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Insights = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const generateInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-insights", {
        body: { userId: user.id }
      });

      if (error) throw error;

      setInsights(data);
      toast.success("AI insights generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">Get personalized financial recommendations</p>
          </div>
          <Button onClick={generateInsights} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Insights
          </Button>
        </div>

        {!insights && !loading && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No insights yet</h3>
              <p className="text-muted-foreground mb-6">
                Click the button above to generate AI-powered financial insights based on your transactions
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Analyzing your financial data...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
            </CardContent>
          </Card>
        )}

        {insights && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Spending Trends</CardTitle>
                </div>
                <CardDescription>Your spending patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{insights.trends || "No trend data available"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <CardTitle>Top Categories</CardTitle>
                </div>
                <CardDescription>Where your money goes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{insights.categories || "No category data available"}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>AI Recommendations</CardTitle>
                </div>
                <CardDescription>Personalized tips to improve your finances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No recommendations available</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Insights;