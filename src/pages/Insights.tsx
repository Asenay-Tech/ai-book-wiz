import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, TrendingUp, PieChart, Lightbulb } from "lucide-react";
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

  // Sample data for charts
  const trendData = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1900 },
    { month: 'Mar', amount: 1500 },
    { month: 'Apr', amount: 2100 },
    { month: 'May', amount: 1800 },
    { month: 'Jun', amount: 2400 },
  ];

  const categoryData = [
    { name: 'Groceries', value: 35, color: 'hsl(217, 91%, 60%)' },
    { name: 'Transport', value: 20, color: 'hsl(258, 90%, 66%)' },
    { name: 'Dining', value: 25, color: 'hsl(324, 93%, 76%)' },
    { name: 'Utilities', value: 15, color: 'hsl(271, 91%, 65%)' },
    { name: 'Other', value: 5, color: 'hsl(280, 85%, 70%)' },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold gradient-text">AI Insights</h1>
            <p className="text-muted-foreground">Get personalized financial recommendations powered by AI</p>
          </div>
          <Button onClick={generateInsights} disabled={loading} className="hover-scale">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Insights
          </Button>
        </div>

        {/* Charts - Always visible */}
        <div className="grid gap-6 md:grid-cols-2 animate-fade-up">
          <Card className="gradient-card hover-glow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary animate-pulse-glow" />
                <CardTitle>Spending Trends</CardTitle>
              </div>
              <CardDescription>Your monthly spending over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    activeDot={{ r: 8, className: 'animate-pulse-glow' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="gradient-card hover-glow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary animate-pulse-glow" />
                <CardTitle>Category Breakdown</CardTitle>
              </div>
              <CardDescription>Where your money goes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {!insights && !loading && (
          <Card className="gradient-card animate-scale-in">
            <CardContent className="pt-12 pb-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto text-primary mb-4 animate-pulse-glow" />
              <h3 className="text-xl font-semibold mb-2">Ready for AI Analysis?</h3>
              <p className="text-muted-foreground mb-6">
                Click "Generate Insights" above to get personalized financial recommendations based on your spending patterns
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="gradient-card animate-pulse-glow">
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">🤖 AI is analyzing your financial data...</p>
              <p className="text-sm text-muted-foreground mt-2">Finding patterns and generating recommendations</p>
            </CardContent>
          </Card>
        )}

        {insights && (
          <Card className="md:col-span-2 gradient-card animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary animate-pulse-glow" />
                <CardTitle>💡 AI Smart Insights</CardTitle>
              </div>
              <CardDescription>Personalized recommendations based on your spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Trend Analysis */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 animate-fade-up">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Spending Trend Alert</p>
                      <p className="text-sm text-muted-foreground">{insights.trends || "Your spending has increased by 40% in groceries this month compared to last month."}</p>
                    </div>
                  </div>
                </div>

                {/* Category Insights */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  <div className="flex items-start gap-3">
                    <PieChart className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Top Category</p>
                      <p className="text-sm text-muted-foreground">{insights.categories || "Groceries account for 35% of your total spending. Consider bulk buying to save money."}</p>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-3 mt-6">
                  <p className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Personalized Recommendations
                  </p>
                  {insights.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-fade-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0 animate-pulse-glow" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  )) || (
                    <>
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0 animate-pulse-glow" />
                        <p className="text-sm">Consider setting a monthly budget limit for dining expenses to reduce overspending.</p>
                      </div>
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0 animate-pulse-glow" />
                        <p className="text-sm">You could save $200/month by switching to meal prep instead of dining out.</p>
                      </div>
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0 animate-pulse-glow" />
                        <p className="text-sm">Set up automatic savings transfers on payday to build your emergency fund.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Insights;