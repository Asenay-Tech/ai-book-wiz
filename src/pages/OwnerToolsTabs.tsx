import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Lock, Eye, FileText, AlertTriangle, Bell, 
  LineChart, TrendingDown, Sparkles, Package, 
  DollarSign, Users, Calendar, PieChart,
  ClipboardCheck, Settings, Mail, MessageSquare,
  BarChart3, ArrowUpRight, Target, Lightbulb
} from "lucide-react";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  status = "active",
  onClick 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  status?: "active" | "coming-soon";
  onClick?: () => void;
}) => (
  <Card 
    className={`gradient-card hover-glow cursor-pointer transition-all ${onClick ? 'hover:scale-105' : ''}`}
    onClick={onClick}
  >
    <CardContent className="pt-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{title}</h3>
            {status === "coming-soon" && (
              <Badge variant="outline" className="text-xs">Soon</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ControlPanelTab = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        Owner Control Center
      </h2>
      <p className="text-sm text-muted-foreground">
        Lock fields, approve entries, and maintain control over your financial data
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <FeatureCard
        icon={Lock}
        title="Lock Financial Periods"
        description="Prevent any changes to closed months or quarters. Lock books after review to maintain audit integrity."
      />
      <FeatureCard
        icon={ClipboardCheck}
        title="Approval Workflow"
        description="Require owner approval for transactions above a certain amount or specific categories."
      />
      <FeatureCard
        icon={Eye}
        title="Change Log with AI Notes"
        description="Track every edit with who, what, when, and AI-generated explanations of why changes matter."
      />
      <FeatureCard
        icon={Bell}
        title="Real-Time Alerts"
        description="Get instant notifications for high-value transactions, unusual activity, or pending approvals."
      />
    </div>

    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Shield className="h-8 w-8 text-primary animate-pulse-glow" />
          <div>
            <h3 className="font-semibold mb-2">Your Business is Protected</h3>
            <p className="text-sm text-muted-foreground">
              These controls ensure no unauthorized changes can slip through. You have full visibility 
              and authority over every financial decision.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const TransparencyTab = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        Complete Financial Transparency
      </h2>
      <p className="text-sm text-muted-foreground">
        Understand your finances in plain English with AI-powered insights and explanations
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <FeatureCard
        icon={BarChart3}
        title="Owner Dashboard View"
        description="Plain-English snapshot of cash flow, spending, and alerts. See what matters most at a glance."
      />
      <FeatureCard
        icon={FileText}
        title="Explainable AI Reports"
        description='Every report item has a clickable "why" button. No more guessing what numbers mean.'
      />
      <FeatureCard
        icon={PieChart}
        title="Simple P&L with Visuals"
        description="Profit & Loss statements with emoji indicators and color-coded status. Easy to understand for non-accountants."
      />
      <FeatureCard
        icon={MessageSquare}
        title="Weekly Insights Digest"
        description="Get a human-readable summary via email or WhatsApp every week. Stay informed without logging in."
        status="coming-soon"
      />
    </div>

    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          This Week's Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="text-sm">💰 Revenue</span>
            <span className="font-semibold text-green-500">↑ $24,500</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="text-sm">💸 Expenses</span>
            <span className="font-semibold text-amber-500">$18,200</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="text-sm">📊 Net Profit</span>
            <span className="font-semibold text-primary">$6,300 (26%)</span>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm">
              <strong>AI Insight:</strong> Your profit margin improved by 3% this week. 
              Labor costs are down while sales remained steady.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const FraudDetectionTab = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        Fraud Prevention & Detection
      </h2>
      <p className="text-sm text-muted-foreground">
        AI-powered anomaly detection to catch suspicious activity before it becomes a problem
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <FeatureCard
        icon={AlertTriangle}
        title="Flag Suspicious Activity"
        description="Detect unusual vendors, odd transaction timing, unexpected spending spikes, or duplicate charges."
      />
      <FeatureCard
        icon={Eye}
        title="POS & Cash Drawer AI Check"
        description="Match register totals with actual transactions. Catch cash handling discrepancies automatically."
        status="coming-soon"
      />
      <FeatureCard
        icon={Package}
        title="Inventory Shrinkage Estimator"
        description="Compare purchase records against sales to detect missing inventory or theft patterns."
        status="coming-soon"
      />
      <FeatureCard
        icon={Shield}
        title="Vendor Behavior Analysis"
        description="Track vendor billing patterns and flag price increases, duplicate invoices, or suspicious changes."
      />
    </div>

    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Recent Alerts
        </CardTitle>
        <CardDescription>Potential issues detected by AI</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-destructive/20 bg-background">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Unusual Vendor Transaction</p>
              <p className="text-xs text-muted-foreground">
                "ABC Supplies" charged $3,450 on Sunday at 2am. This vendor typically bills on weekdays.
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline">Investigate</Button>
                <Button size="sm" variant="ghost">Dismiss</Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
            <DollarSign className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Spending Spike Detected</p>
              <p className="text-xs text-muted-foreground">
                Office supplies spending is up 140% this month. Review purchases?
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline">Review</Button>
                <Button size="sm" variant="ghost">Ignore</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const CostControlTab = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-primary" />
        Cut Costs & Save Money
      </h2>
      <p className="text-sm text-muted-foreground">
        AI-powered recommendations to reduce expenses and improve profitability
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <FeatureCard
        icon={Sparkles}
        title="Cost-Saving Suggestions AI"
        description="Get proactive recommendations on where you can cut costs without impacting operations."
      />
      <FeatureCard
        icon={LineChart}
        title="Smart Vendor Comparison"
        description="Automatically compare supplier pricing and identify opportunities to negotiate or switch."
      />
      <FeatureCard
        icon={Bell}
        title="Spend Change Alerts"
        description="Get notified when labor costs, materials, or other categories spike unexpectedly."
      />
      <FeatureCard
        icon={Target}
        title="Budget vs Actual Tracking"
        description="Set budgets per category and see real-time variance alerts when you're off track."
      />
    </div>

    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Cost-Saving Opportunities
        </CardTitle>
        <CardDescription>Potential monthly savings: $1,240</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-semibold text-sm">Switch Office Supply Vendor</span>
              </div>
              <Badge variant="secondary">Save $420/mo</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              "ABC Office Depot" is 32% more expensive than "XYZ Supplies" for similar items. 
              Consider switching for significant savings.
            </p>
            <Button size="sm" variant="outline" className="mt-3">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              View Analysis
            </Button>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-semibold text-sm">Reduce Food Waste</span>
              </div>
              <Badge variant="secondary">Save $380/mo</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Inventory analysis shows 12% waste rate in produce. Adjust ordering quantities 
              or improve rotation practices.
            </p>
            <Button size="sm" variant="outline" className="mt-3">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              See Details
            </Button>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-semibold text-sm">Optimize Staff Scheduling</span>
              </div>
              <Badge variant="secondary">Save $440/mo</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Labor costs are 8% higher on Mondays & Tuesdays when traffic is lower. 
              Adjust schedules to match demand.
            </p>
            <Button size="sm" variant="outline" className="mt-3">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Review Schedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const AutomationTab = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Save Time with Automation
      </h2>
      <p className="text-sm text-muted-foreground">
        Let AI handle repetitive tasks so you can focus on growing your business
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <FeatureCard
        icon={FileText}
        title="Tax Summary Generator"
        description="One-click quarterly and yearly tax reports. Export-ready for your accountant."
      />
      <FeatureCard
        icon={Mail}
        title="Weekly Insights via Email"
        description="Automatic digest of key metrics, changes, and AI recommendations sent to your inbox."
        status="coming-soon"
      />
      <FeatureCard
        icon={Calendar}
        title="Recurring Expense Tracking"
        description="Auto-detect and track subscriptions, rent, utilities. Get alerts when payments are due."
      />
      <FeatureCard
        icon={ClipboardCheck}
        title="Auto-Categorization"
        description="AI learns your spending patterns and automatically categorizes new transactions."
      />
    </div>

    <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
            <div>
              <h3 className="font-semibold mb-2">Time Saved This Month</h3>
              <p className="text-3xl font-bold text-primary">14.5 hours</p>
              <p className="text-sm text-muted-foreground mt-1">
                Through automatic categorization, reconciliation, and report generation
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Auto-categorized</p>
              <p className="text-lg font-semibold">248 items</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reconciled</p>
              <p className="text-lg font-semibold">$42,580</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reports</p>
              <p className="text-lg font-semibold">12 created</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const GrowthTab = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-primary" />
        Growth Forecast & Planning
      </h2>
      <p className="text-sm text-muted-foreground">
        Understand what you can afford and make confident decisions about expansion
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <FeatureCard
        icon={LineChart}
        title="Growth Forecast"
        description="AI projects your revenue and cash flow for the next 3-12 months based on trends and seasonality."
      />
      <FeatureCard
        icon={Users}
        title="Hiring Budget Calculator"
        description="See if you can afford to hire. AI shows how new staff would impact cash flow and profitability."
        status="coming-soon"
      />
      <FeatureCard
        icon={Target}
        title="Profitability Analysis"
        description="Understand which products, services, or locations are most profitable. Double down on winners."
      />
      <FeatureCard
        icon={Calendar}
        title="Scenario Planning"
        description='Model "what if" scenarios: new location, equipment purchase, marketing campaign investment.'
        status="coming-soon"
      />
    </div>

    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          Financial Runway
        </CardTitle>
        <CardDescription>How long can you operate at current burn rate?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-5xl font-bold text-primary mb-2">8.4 months</p>
            <p className="text-sm text-muted-foreground">
              Based on current cash reserves ($68,500) and average monthly burn ($8,150)
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cash on Hand</span>
                <span className="text-sm font-semibold text-green-500">$68,500</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg Monthly Revenue</span>
                <span className="text-sm font-semibold">$24,300</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg Monthly Expenses</span>
                <span className="text-sm font-semibold text-destructive">$18,200</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Net Monthly Profit</span>
                <span className="text-sm font-semibold text-primary">$6,100</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              AI Recommendation
            </p>
            <p className="text-xs text-muted-foreground">
              Your financial health is strong. You could comfortably hire 1 additional 
              full-time employee ($3,500/mo) while maintaining 6+ months runway.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
