import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Crown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setCompanyName(data.company_name || "");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        company_name: companyName,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
      loadProfile(user.id);
    }
    setUpdating(false);
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      uploads: 2,
      features: ["2 uploads per month", "Basic OCR", "Manual entry"]
    },
    {
      name: "Starter",
      price: "$5",
      uploads: 50,
      features: ["50 uploads per month", "AI summaries", "Chat assistant", "Priority support"]
    },
    {
      name: "Pro",
      price: "$15",
      uploads: 200,
      features: ["200 uploads per month", "Reconciliation", "AI predictions", "Insights", "Export data"]
    },
    {
      name: "Business",
      price: "$39",
      uploads: "Unlimited",
      features: ["Unlimited uploads", "Team accounts", "Admin panel", "API access", "White label"]
    }
  ];

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your account and subscription</p>
        </div>

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
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

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
              {plans.map((plan) => (
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
                      {plan.features.map((feature, index) => (
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
    </DashboardLayout>
  );
};

export default Settings;