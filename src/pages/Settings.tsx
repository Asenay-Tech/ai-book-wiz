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
import PageTabs from "@/components/PageTabs";
import { ProfileTab, BusinessTypeTab, AuditTab, IntegrationsTab, PlanTab } from "./SettingsTabs";

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

        <Card className="stat-card neon-border">
          <CardContent className="pt-6">
            <PageTabs
              defaultTab="profile"
              tabs={[
                {
                  value: "profile",
                  label: "Profile",
                  content: <ProfileTab 
                    user={user}
                    fullName={fullName}
                    setFullName={setFullName}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    handleUpdate={handleUpdate}
                    updating={updating}
                  />
                },
                {
                  value: "business-type",
                  label: "Business Type",
                  content: <BusinessTypeTab />
                },
                {
                  value: "audit",
                  label: "Team & Audit",
                  content: <AuditTab />
                },
                {
                  value: "integrations",
                  label: "Integrations",
                  content: <IntegrationsTab />
                },
                {
                  value: "plan",
                  label: "Plan & Usage",
                  content: <PlanTab profile={profile} plans={plans} />
                }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;