import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, ChevronDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/sidebar";
import ContactCard from "@/components/contact-card";
import AddContactDialog from "@/components/add-contact-dialog";
import ContactDetailDialog from "@/components/contact-detail-dialog";
import UpcomingReminders from "@/components/upcoming-reminders";
import type { Contact } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("lastContact");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      
      const response = await fetch(`/api/contacts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  const { data: upcomingReminders = [] } = useQuery({
    queryKey: ["/api/reminders", { upcoming: true }],
    queryFn: async () => {
      const response = await fetch("/api/reminders?upcoming=true");
      if (!response.ok) throw new Error("Failed to fetch reminders");
      return response.json();
    },
  });

  const sortedContacts = contacts.slice().sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "lastContact":
        if (!a.lastContactDate && !b.lastContactDate) return 0;
        if (!a.lastContactDate) return 1;
        if (!b.lastContactDate) return -1;
        return new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime();
      case "priority":
        if (a.isPriority === b.isPriority) return 0;
        return a.isPriority ? -1 : 1;
      case "dateAdded":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {upcomingReminders.length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                  {upcomingReminders.length}
                </Badge>
              )}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/api/placeholder/32/32" alt="User" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-900">John Smith</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar 
          contacts={contacts}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategoryFilter}
          upcomingReminders={upcomingReminders}
          onAddContact={() => setIsAddDialogOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Contacts` : "All Contacts"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your professional and personal network
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastContact">Sort by: Last Contact</SelectItem>
                    <SelectItem value="name">Sort by: Name</SelectItem>
                    <SelectItem value="priority">Sort by: Priority</SelectItem>
                    <SelectItem value="dateAdded">Sort by: Date Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Grid */}
          <div className="p-6 overflow-y-auto h-full">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedContacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onClick={() => handleContactClick(contact)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No contacts found" : "No contacts yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms or filters."
                    : "Get started by adding your first contact."
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                )}
              </div>
            )}

            {/* Upcoming Reminders */}
            {sortedContacts.length > 0 && (
              <UpcomingReminders
                reminders={upcomingReminders}
                contacts={contacts}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialogs */}
      <AddContactDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <ContactDetailDialog
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      />
    </div>
  );
}
