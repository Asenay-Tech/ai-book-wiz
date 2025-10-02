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

export const IntegrationsTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Integrations</CardTitle>
      <CardDescription>Connect to POS systems, marketplaces, and cloud storage</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <p className="font-semibold mb-1">Square POS</p>
            <p className="text-xs text-muted-foreground mb-2">Import daily sales</p>
            <Button size="sm" variant="outline">Connect</Button>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="font-semibold mb-1">Shopify</p>
            <p className="text-xs text-muted-foreground mb-2">E-commerce orders</p>
            <Button size="sm" variant="outline">Connect</Button>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="font-semibold mb-1">Google Drive</p>
            <p className="text-xs text-muted-foreground mb-2">Auto-import receipts</p>
            <Button size="sm" variant="outline">Connect</Button>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="font-semibold mb-1">Dropbox</p>
            <p className="text-xs text-muted-foreground mb-2">Cloud storage sync</p>
            <Button size="sm" variant="outline">Connect</Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>TODO:</strong> OAuth flows, CSV template mappings
        </p>
      </div>
    </CardContent>
  </Card>
);

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
