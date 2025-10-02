import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, PieChart, DollarSign, TrendingUpIcon, FileBarChart, Store } from "lucide-react";

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

export const AnalyticsTab = () => (
  <div className="space-y-4 md:space-y-6">
    <div className="grid gap-4 md:gap-6 md:grid-cols-2">
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
  </div>
);

export const BudgetsTab = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <CardTitle>Budgets & Alerts</CardTitle>
      </div>
      <CardDescription>Set spending limits and receive notifications</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <strong>TODO:</strong> Budget management interface
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
          <li>Per-category monthly budgets with progress bars</li>
          <li>Alert thresholds (e.g., 90%, 100%)</li>
          <li>Push/email notification settings</li>
          <li>Recurring expense detection</li>
          <li>Subscription report</li>
        </ul>
      </div>
    </CardContent>
  </Card>
);

export const ForecastTab = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <TrendingUpIcon className="h-5 w-5 text-accent" />
        <CardTitle>Forecasting & Planning</CardTitle>
      </div>
      <CardDescription>30/60/90-day cash projections and scenarios</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">30-Day</p>
            <p className="text-2xl font-bold text-accent">$8,200</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">60-Day</p>
            <p className="text-2xl font-bold text-accent">$15,400</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">90-Day</p>
            <p className="text-2xl font-bold text-accent">$22,100</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>TODO:</strong> Seasonality-aware projections, scenario planner ("what if ads ↑ 20%?"), tax estimate tracker
        </p>
      </div>
    </CardContent>
  </Card>
);

export const ReportsTab = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <FileBarChart className="h-5 w-5 text-primary" />
        <CardTitle>Reports & Exports</CardTitle>
      </div>
      <CardDescription>Generate financial reports and export data</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <p className="font-semibold">P&L Statement</p>
            <p className="text-xs text-muted-foreground">Profit & Loss report</p>
          </div>
          <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <p className="font-semibold">Balance Sheet</p>
            <p className="text-xs text-muted-foreground">Assets & liabilities</p>
          </div>
          <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <p className="font-semibold">Cash Summary</p>
            <p className="text-xs text-muted-foreground">Month/Quarter/YTD</p>
          </div>
          <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <p className="font-semibold">Category Breakdown</p>
            <p className="text-xs text-muted-foreground">Spend by category + deltas</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>TODO:</strong> Export as CSV/PDF, period selectors, comparison views
        </p>
      </div>
    </CardContent>
  </Card>
);

export const IndustryTab = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5 text-primary" />
        <CardTitle>Industry Packs</CardTitle>
      </div>
      <CardDescription>Specialized features for logistics, restaurants, and retail</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <p className="font-semibold mb-2">🚚 Logistics</p>
          <p className="text-sm text-muted-foreground">Fleet management, cost per mile, fuel tracking, vehicle allocations</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="font-semibold mb-2">🍽️ Restaurants</p>
          <p className="text-sm text-muted-foreground">Prime cost %, POS integration, vendor catalogs, waste tracking</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="font-semibold mb-2">🛍️ Retail</p>
          <p className="text-sm text-muted-foreground">SKU margins, inventory turns, channel splits, low-stock alerts</p>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>TODO:</strong> Implement industry-specific data models and metrics
        </p>
      </div>
    </CardContent>
  </Card>
);
