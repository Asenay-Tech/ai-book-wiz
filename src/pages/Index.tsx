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
          
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-2xl"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload a File
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
            <div className="inline-flex p-4 bg-primary/20 rounded-xl mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">Smart OCR</h3>
            <p className="text-white/70 leading-relaxed">
              Extract data from PDF receipts, images, and CSV files automatically
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
            <div className="inline-flex p-4 bg-primary/20 rounded-xl mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">Live Dashboards</h3>
            <p className="text-white/70 leading-relaxed">
              Real-time charts and KPIs updated with every upload
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
            <div className="inline-flex p-4 bg-primary/20 rounded-xl mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">AI Insights</h3>
            <p className="text-white/70 leading-relaxed">
              Smart predictions and cost-saving recommendations
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Choose Your Plan</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { 
                name: "Free", 
                price: "$0", 
                uploads: "2", 
                features: ["2 uploads/month", "Basic OCR", "Manual entry"],
                highlight: false
              },
              { 
                name: "Starter", 
                price: "$5", 
                uploads: "50", 
                features: ["50 uploads/month", "AI summaries", "Chat assistant", "Priority support"],
                highlight: false
              },
              { 
                name: "Pro", 
                price: "$15", 
                uploads: "200", 
                features: ["200 uploads/month", "Reconciliation", "AI predictions", "Insights", "Export data"],
                highlight: true
              },
              { 
                name: "Business", 
                price: "$39", 
                uploads: "∞", 
                features: ["Unlimited uploads", "Team accounts", "Admin panel", "API access"],
                highlight: false
              }
            ].map((plan) => (
              <div 
                key={plan.name} 
                className={`glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300 ${
                  plan.highlight ? 'ring-2 ring-primary shadow-2xl shadow-primary/20' : ''
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-white/60">/mo</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.highlight 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
              </div>
            ))}
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
