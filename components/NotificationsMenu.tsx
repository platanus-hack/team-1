'use client';

import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface NotificationsMenuProps {
  onOpen?: () => void;
}

export function NotificationsMenu({ onOpen, ...props }: NotificationsMenuProps) {
  const { notifications } = useNotifications();
  const hasUnreadNotifications = notifications.some(notification => !notification.read);

  return (
    <Popover onOpenChange={(open) => {
      if (open && onOpen) {
        onOpen();
      }
    }}>
      <PopoverTrigger className="relative h-8 w-8 flex items-center justify-center">
        <Bell size={20} />
        {hasUnreadNotifications && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="space-y-2 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-accent rounded-md transition-colors ${
                    !notification.read ? 'bg-accent/50' : ''
                  }`}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {notification.timestamp}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No hay notificaciones
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 