import { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Reminder } from "@shared/schema";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  upcomingReminders: Reminder[];
  onNotificationClick?: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  upcomingReminders,
  onNotificationClick,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">ContactFlow</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={onNotificationClick}
              >
                <Bell className="h-4 w-4" />
                {upcomingReminders.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                    {upcomingReminders.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 border-b">
                <h4 className="font-semibold text-sm">Upcoming Reminders</h4>
              </div>
              {upcomingReminders.length > 0 ? (
                upcomingReminders.slice(0, 5).map((reminder) => (
                  <DropdownMenuItem key={reminder.id} className="px-3 py-3">
                    <div className="flex flex-col space-y-1 w-full">
                      <span className="font-medium text-sm">{reminder.title}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(reminder.dueDate).toLocaleDateString()} at{" "}
                        {new Date(reminder.dueDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="px-3 py-3">
                  <span className="text-sm text-gray-500">No upcoming reminders</span>
                </DropdownMenuItem>
              )}
              {upcomingReminders.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="px-3 py-2 text-center text-primary">
                    View all reminders
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="User profile" />
                  <AvatarFallback className="bg-gray-100 text-gray-600">JS</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900">John Smith</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Privacy & Security</DropdownMenuItem>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
