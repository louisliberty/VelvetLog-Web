import { Users, Star, Calendar, Clock, Plus, Heart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getStatusDotColor } from "@/lib/utils";
import type { Contact, Reminder } from "@shared/schema";

interface SidebarProps {
  contacts: Contact[];
  selectedCategory: string | null;
  selectedFilter: string | null;
  onCategorySelect: (category: string | null) => void;
  onSpecialFilter: (filter: string | null) => void;
  upcomingReminders: Reminder[];
  onAddContact: () => void;
  onImportContacts: () => void;
}

export default function Sidebar({
  contacts,
  selectedCategory,
  selectedFilter,
  onCategorySelect,
  onSpecialFilter,
  upcomingReminders,
  onAddContact,
  onImportContacts,
}: SidebarProps) {
  const totalContacts = contacts.length;
  const priorityContacts = contacts.filter(c => c.isPriority).length;
  const datingCount = contacts.filter(c => c.relationshipStatus === "dating").length;
  const exclusiveCount = contacts.filter(c => c.relationshipStatus === "exclusive").length;
  const openCount = contacts.filter(c => c.relationshipStatus === "open-relationship").length;
  const fwbCount = contacts.filter(c => c.relationshipStatus === "friends-with-benefits").length;
  const longDistanceCount = contacts.filter(c => c.relationshipStatus === "long-distance").length;
  const friendsCount = contacts.filter(c => c.relationshipStatus === "friends").length;
  const endedCount = contacts.filter(c => c.relationshipStatus === "no-longer-talking").length;

  const navigationItems = [
    {
      icon: Users,
      label: "All Connections",
      count: totalContacts,
      active: selectedCategory === null && selectedFilter === null,
      onClick: () => {
        onCategorySelect(null);
        onSpecialFilter(null);
      },
    },
    {
      icon: Heart,
      label: "Priority",
      count: priorityContacts,
      active: selectedFilter === "priority",
      onClick: () => onSpecialFilter("priority"),
    },
    {
      icon: Calendar,
      label: "Recent Activity",
      active: selectedFilter === "recentActivity",
      onClick: () => onSpecialFilter("recentActivity"),
    },
    {
      icon: Clock,
      label: "Upcoming Reminders",
      count: upcomingReminders.length,
      active: selectedFilter === "upcomingReminders",
      onClick: () => onSpecialFilter("upcomingReminders"),
    },
  ];

  const categories = [
    {
      name: "Dating",
      value: "dating",
      count: datingCount,
      color: getStatusDotColor("dating"),
    },
    {
      name: "Exclusive",
      value: "exclusive",
      count: exclusiveCount,
      color: getStatusDotColor("exclusive"),
    },
    {
      name: "Open Relationship",
      value: "open-relationship",
      count: openCount,
      color: getStatusDotColor("open-relationship"),
    },
    {
      name: "Friends w/ Benefits",
      value: "friends-with-benefits",
      count: fwbCount,
      color: getStatusDotColor("friends-with-benefits"),
    },
    {
      name: "Long Distance",
      value: "long-distance",
      count: longDistanceCount,
      color: getStatusDotColor("long-distance"),
    },
    {
      name: "Friends",
      value: "friends",
      count: friendsCount,
      color: getStatusDotColor("friends"),
    },
    {
      name: "Ended",
      value: "no-longer-talking",
      count: endedCount,
      color: getStatusDotColor("no-longer-talking"),
    },
  ];

  return (
    <aside className="w-64 h-full bg-white/80 backdrop-blur-md border-r border-pink-100 flex flex-col">
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left",
              item.active
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                : "text-gray-700 hover:bg-pink-50"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {item.count !== undefined && (
              <Badge
                variant={item.active ? "secondary" : "outline"}
                className={cn(
                  "ml-auto text-xs",
                  item.active
                    ? "bg-white bg-opacity-20 text-white border-white border-opacity-20"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {item.count}
              </Badge>
            )}
          </button>
        ))}

        <div className="pt-4 border-t border-pink-100 mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Relationship Status
          </h3>

          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => onCategorySelect(category.value)}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left",
                selectedCategory === category.value
                  ? "bg-pink-50 text-pink-700"
                  : "text-gray-700 hover:bg-pink-50"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", category.color)}></div>
              <span>{category.name}</span>
              <span className="ml-auto text-gray-400 text-sm">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-pink-100 space-y-2">
        <Button 
          onClick={onAddContact} 
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" 
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Connection
        </Button>
        
        <Button 
          onClick={onImportContacts} 
          variant="outline"
          className="w-full border-pink-200 text-pink-600 hover:bg-pink-50" 
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Import Contacts
        </Button>
      </div>
    </aside>
  );
}
