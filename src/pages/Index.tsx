import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Upload, Brain, BarChart3, MessageSquare, CheckCircle2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    const checkAuth = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">AI Bookkeeper</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            AI-Powered Bookkeeping
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Snap photos of receipts, let AI handle the rest. Get intelligent insights, automatic categorization, and financial guidance powered by artificial intelligence.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="mr-4">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
            View Demo
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-6">
            <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Upload</h3>
            <p className="text-muted-foreground">
              Upload receipts via photo, PDF, or CSV. AI extracts all details automatically.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
            <p className="text-muted-foreground">
              Advanced OCR and parsing automatically categorizes and validates transactions.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
            <p className="text-muted-foreground">
              Get AI-powered recommendations, predictions, and financial guidance.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg p-8 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Free", price: "$0", uploads: "2", features: ["2 uploads/month", "Basic OCR", "Manual entry"] },
              { name: "Starter", price: "$5", uploads: "50", features: ["50 uploads/month", "AI summaries", "Chat assistant", "Priority support"] },
              { name: "Pro", price: "$15", uploads: "200", features: ["200 uploads/month", "Reconciliation", "AI predictions", "Insights", "Export data"] },
              { name: "Business", price: "$39", uploads: "∞", features: ["Unlimited uploads", "Team accounts", "Admin panel", "API access"] }
            ].map((plan) => (
              <div key={plan.name} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-muted-foreground">/mo</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.name === "Pro" ? "default" : "outline"} onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 AI Bookkeeper. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
