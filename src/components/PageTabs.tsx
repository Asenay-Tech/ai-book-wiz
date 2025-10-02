import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface PageTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
}

const PageTabs = ({ tabs, defaultTab }: PageTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentTab = params.get('tab') || defaultTab || tabs[0]?.value;

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', value);
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full justify-start">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PageTabs;
