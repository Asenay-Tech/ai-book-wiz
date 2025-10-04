import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Crown } from "lucide-react";

export const ProfileTab = ({ user, fullName, setFullName, companyName, setCompanyName, handleUpdate, updating }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Profile Information</CardTitle>
      <CardDescription>Update your personal and company details</CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user?.email || ""} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e: any) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name (Optional)</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e: any) => setCompanyName(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={updating}>
          {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </CardContent>
  </Card>
);

export const BusinessTypeTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Business Type</CardTitle>
      <CardDescription>Select your business type to customize features</CardDescription>
    </CardHeader>
    <CardContent>
      <RadioGroup defaultValue="small" className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="personal" id="personal" />
          <Label htmlFor="personal" className="cursor-pointer">
            <div>
              <p className="font-medium">Personal</p>
              <p className="text-sm text-muted-foreground">
                Individual expense tracking, budgets, personal insights
              </p>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="small" id="small" />
          <Label htmlFor="small" className="cursor-pointer">
            <div>
              <p className="font-medium">Small Business</p>
              <p className="text-sm text-muted-foreground">
                Invoices, reconciliation, team access, reports, industry features
              </p>
            </div>
          </Label>
        </div>
      </RadioGroup>
      <p className="text-sm text-muted-foreground mt-4">
        <strong>TODO:</strong> Update profiles.business_type; adjust feature visibility
      </p>
    </CardContent>
  </Card>
);

export const AuditTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Team & Audit</CardTitle>
      <CardDescription>Activity logs, locked periods, and approval workflows</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Activity Log</h4>
          <p className="text-sm text-muted-foreground">
            <strong>TODO:</strong> Table showing who/what/when for all changes
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Locked Periods</h4>
          <p className="text-sm text-muted-foreground">
            <strong>TODO:</strong> Prevent edits post-close; manage locked date ranges
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Change Approvals</h4>
          <p className="text-sm text-muted-foreground">
            <strong>TODO:</strong> Approve/decline category change requests from team
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const IntegrationsTab = () => {
  const integrationCategories = [
    {
      title: "📚 Accounting Tools",
      integrations: [
        { name: "QuickBooks", description: "Auto-sync transactions & reports", icon: "💼", aiPowered: true },
        { name: "Xero", description: "Real-time bookkeeping sync", icon: "📊", aiPowered: false },
        { name: "Zoho Books", description: "Automated accounting workflows", icon: "📗", aiPowered: true },
      ]
    },
    {
      title: "🛒 POS Systems",
      integrations: [
        { name: "Square POS", description: "Auto-sync sales transactions", icon: "◼️", aiPowered: false },
        { name: "Toast POS", description: "Restaurant sales & tips import", icon: "🍞", aiPowered: false },
        { name: "Clover", description: "Retail & payment data sync", icon: "🍀", aiPowered: false },
        { name: "Shopify", description: "E-commerce sales & inventory", icon: "🛍️", aiPowered: false },
      ]
    },
    {
      title: "💼 Payroll & HR",
      integrations: [
        { name: "Gusto", description: "Payroll & benefits integration", icon: "💰", aiPowered: false },
        { name: "ADP", description: "Enterprise payroll sync", icon: "🏢", aiPowered: false },
        { name: "Paychex", description: "HR & payroll automation", icon: "💵", aiPowered: false },
      ]
    },
    {
      title: "📂 Receipts & Cloud Storage",
      integrations: [
        { name: "Google Drive", description: "Auto-import receipts from folders", icon: "📁", aiPowered: true },
        { name: "Dropbox", description: "Sync documents automatically", icon: "📦", aiPowered: false },
        { name: "Gmail", description: "Auto-import receipts from inbox", icon: "📧", aiPowered: true },
        { name: "Outlook", description: "Email receipt extraction", icon: "📨", aiPowered: false },
      ]
    },
    {
      title: "🏢 Business Ops / ERP",
      integrations: [
        { name: "SAP Business One", description: "Enterprise resource planning", icon: "🔷", aiPowered: false },
        { name: "Oracle NetSuite", description: "Cloud ERP & financials", icon: "🔶", aiPowered: false },
        { name: "Zoho Inventory", description: "Inventory & order management", icon: "📦", aiPowered: true },
        { name: "Zoho CRM", description: "Customer relationship data", icon: "🤝", aiPowered: true },
      ]
    },
    {
      title: "📣 Owner Notifications",
      integrations: [
        { name: "WhatsApp Business", description: "Weekly insights & alerts", icon: "💬", aiPowered: false },
        { name: "Slack", description: "Team notifications & updates", icon: "💼", aiPowered: false },
        { name: "Email (SMTP)", description: "Custom email notifications", icon: "✉️", aiPowered: false },
      ]
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">🧩 Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect to your accounting tools, POS systems, cloud storage, payroll, and more — automate your workflow and gain full visibility.
        </p>
      </div>

      {integrationCategories.map((category, idx) => (
        <div key={idx} className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <h4 className="text-base font-semibold text-foreground">
              {category.title}
            </h4>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {category.integrations.map((integration, intIdx) => (
              <Card key={intIdx} className="hover-lift border-border/50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">{integration.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-semibold text-sm">{integration.name}</h5>
                          {integration.aiPowered && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                              🧠 AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0 h-8">
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const PlanTab = ({ profile, plans }: any) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>Your subscription details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold capitalize">{profile?.subscription_tier || "Free"}</p>
            <p className="text-sm text-muted-foreground">
              {profile?.monthly_uploads_used || 0} uploads used this month
            </p>
          </div>
          <Badge variant="secondary">
            <Crown className="mr-1 h-3 w-3" />
            Active
          </Badge>
        </div>
      </CardContent>
    </Card>

    <Card className="border-primary bg-gradient-to-r from-primary/10 to-accent/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Upgrade Your Plan
        </CardTitle>
        <CardDescription>
          Unlock more features and increase your upload limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
          {plans.map((plan: any) => (
            <Card key={plan.name} className={plan.name === profile?.subscription_tier ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-muted-foreground">/month</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-sm">
                    {typeof plan.uploads === "number" ? `${plan.uploads} uploads` : plan.uploads}
                  </p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.name === profile?.subscription_tier ? "secondary" : "default"}
                  disabled={plan.name === profile?.subscription_tier}
                >
                  {plan.name === profile?.subscription_tier ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
