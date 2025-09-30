import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Upload, BarChart3, Brain, CheckCircle2, Sparkles, Receipt } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated floating receipts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <Receipt className="absolute top-20 left-10 w-16 h-16 animate-float text-primary" />
        <Receipt className="absolute top-40 right-20 w-20 h-20 animate-float text-accent" style={{ animationDelay: "2s" }} />
        <Receipt className="absolute bottom-32 left-1/4 w-12 h-12 animate-float text-primary" style={{ animationDelay: "4s" }} />
        <BarChart3 className="absolute top-1/3 right-1/4 w-16 h-16 animate-float text-accent" style={{ animationDelay: "1s" }} />
        <Calculator className="absolute bottom-20 right-10 w-14 h-14 animate-float text-primary" style={{ animationDelay: "3s" }} />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3lhbiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border backdrop-blur-xl glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 neon-border bg-primary/10 rounded-lg">
              <Calculator className="h-6 w-6 text-primary animate-pulse-glow" />
            </div>
            <span className="text-xl font-bold text-foreground">AI Bookkeeper</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:bg-secondary">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground hover:bg-primary/90 hover-lift">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 animate-pulse-glow">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">Automated AI Bookkeeping — Try It Free</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight animate-fade-up">
            <span className="text-foreground">Asenay Tech</span>
            <br />
            <span className="text-primary neon-glow">
              AI Bookkeeper
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Upload a receipt or CSV. Get categorized entries, dashboards, and AI-driven recommendations instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto shadow-2xl hover-lift neon-border"
            >
              <Upload className="mr-2 h-5 w-5" />
              Try it Free — No Sign-Up Required
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="glass-card-hover p-8 rounded-2xl hover-lift animate-fade-up">
            <div className="inline-flex p-4 neon-border bg-primary/10 rounded-xl mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">Smart OCR</h3>
            <p className="text-muted-foreground leading-relaxed">
              Extract data from PDF receipts, images, and CSV files automatically with AI-powered recognition
            </p>
          </div>

          <div className="glass-card-hover p-8 rounded-2xl hover-lift animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex p-4 neon-border bg-accent/10 rounded-xl mb-4">
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">Live Dashboards</h3>
            <p className="text-muted-foreground leading-relaxed">
              Real-time charts and KPIs updated with every upload. Track your spending at a glance.
            </p>
          </div>

          <div className="glass-card-hover p-8 rounded-2xl hover-lift animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="inline-flex p-4 neon-border bg-primary/10 rounded-xl mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">AI Insights</h3>
            <p className="text-muted-foreground leading-relaxed">
              Smart predictions, spending patterns, and personalized cost-saving recommendations
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="glass-card-hover p-12 rounded-3xl max-w-4xl mx-auto animate-scale-in neon-border">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Ready to Transform Your Bookkeeping?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start uploading receipts and let AI handle the rest. No credit card required.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto shadow-2xl hover-lift"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border backdrop-blur-sm py-8 text-center text-sm text-muted-foreground mt-20">
        <p>© 2025 AI Bookkeeper. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
