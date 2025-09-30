import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Upload, BarChart3, Brain, CheckCircle2, Sparkles } from "lucide-react";

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
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Bookkeeper</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="text-white hover:bg-white/10">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-white text-primary hover:bg-white/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm text-white/90">Automated AI Bookkeeping — Try It Free (3 uploads)</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Asenay Tech
            <br />
            <span className="gradient-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
              AI Bookkeeper
            </span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload a receipt or CSV. Get categorized entries, dashboards, and AI-driven recommendations instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-2xl hover-scale"
            >
              <Upload className="mr-2 h-5 w-5" />
              Try it Free — No Sign-Up Required
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="glass-card p-8 rounded-2xl hover-scale hover-glow animate-fade-up">
            <div className="inline-flex p-4 bg-primary/20 rounded-xl mb-4 animate-pulse-glow">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">Smart OCR</h3>
            <p className="text-white/70 leading-relaxed">
              Extract data from PDF receipts, images, and CSV files automatically with AI-powered recognition
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover-scale hover-glow animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex p-4 bg-primary/20 rounded-xl mb-4 animate-pulse-glow">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">Live Dashboards</h3>
            <p className="text-white/70 leading-relaxed">
              Real-time charts and KPIs updated with every upload. Track your spending at a glance.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover-scale hover-glow animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="inline-flex p-4 bg-primary/20 rounded-xl mb-4 animate-pulse-glow">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">AI Insights</h3>
            <p className="text-white/70 leading-relaxed">
              Smart predictions, spending patterns, and personalized cost-saving recommendations
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="glass-card p-12 rounded-3xl max-w-4xl mx-auto animate-scale-in">
            <h2 className="text-4xl font-bold mb-4 text-white">Ready to Transform Your Bookkeeping?</h2>
            <p className="text-xl text-white/70 mb-8">
              Start uploading receipts and let AI handle the rest. No credit card required.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-2xl hover-scale"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-sm py-8 text-center text-sm text-white/60 mt-20">
        <p>© 2025 AI Bookkeeper. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
