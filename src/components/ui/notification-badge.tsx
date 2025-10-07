import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { Button } from "./button";

type NotificationBadgeProps = {
  count?: number;
  onClick?: () => void;
};

export function NotificationBadge({ count = 0, onClick }: NotificationBadgeProps) {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {count > 9 ? "9+" : count}
        </Badge>
      )}
    </Button>
  );
}
