import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageTabs from "@/components/PageTabs";
import { 
  ControlPanelTab, 
  TransparencyTab, 
  FraudDetectionTab, 
  CostControlTab, 
  AutomationTab,
  GrowthTab 
} from "./OwnerToolsTabs";

const OwnerTools = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-0 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Owner Control & Insights</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gain full transparency, prevent fraud, and stay in control of your business finances
            </p>
          </div>
        </div>

        <Card className="stat-card neon-border animate-fade-up">
          <CardContent className="pt-6">
            <PageTabs
              defaultTab="control"
              tabs={[
                {
                  value: "control",
                  label: "Control Panel",
                  content: <ControlPanelTab />
                },
                {
                  value: "transparency",
                  label: "Transparency",
                  content: <TransparencyTab />
                },
                {
                  value: "fraud",
                  label: "Fraud Detection",
                  content: <FraudDetectionTab />
                },
                {
                  value: "costs",
                  label: "Cost Control",
                  content: <CostControlTab />
                },
                {
                  value: "automation",
                  label: "Automation",
                  content: <AutomationTab />
                },
                {
                  value: "growth",
                  label: "Growth & Planning",
                  content: <GrowthTab />
                }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OwnerTools;
