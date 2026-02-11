
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnifiedProfileSettings } from "@/components/settings/UnifiedProfileSettings";
import { UnifiedThemeSettings } from "@/components/settings/UnifiedThemeSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { User, Palette, Shield, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsSection = "profile" | "theme" | "security" | "notifications";

const Settings = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  const tabs = [
    { id: "profile" as const, label: "Perfil", icon: User },
    { id: "theme" as const, label: "Tema", icon: Palette },
    { id: "security" as const, label: "Segurança", icon: Shield },
    { id: "notifications" as const, label: "Alertas", icon: Bell },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile": return <UnifiedProfileSettings />;
      case "theme": return <UnifiedThemeSettings />;
      case "security": return <SecuritySettings />;
      case "notifications": return <NotificationSettings />;
    }
  };

  return (
    <div className="w-full space-y-3 max-w-7xl mx-auto">
      <h1 className="text-lg font-bold text-foreground">Configurações</h1>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeSection === tab.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-8 text-xs gap-1.5 shrink-0",
              activeSection === tab.id && "shadow-sm"
            )}
            onClick={() => setActiveSection(tab.id)}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </Button>
        ))}
      </div>

      <Card className="rounded-lg border-border bg-card">
        <CardContent className="p-3 sm:p-4">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
