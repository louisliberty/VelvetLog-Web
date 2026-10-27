import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatReminderDate, getReminderTypeIcon } from "@/lib/utils";
import { Search, Bell, ChevronDown, Plus, Heart, Calendar, Users, Filter, MoreHorizontal, Trash2, Edit, Clock, Check, Download, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatRelationshipStatus, getCountryFlagFromPhone, formatPhoneNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Sidebar from "@/components/sidebar";
import ContactCard from "@/components/contact-card";
import AddContactDialog from "@/components/add-contact-dialog";
import ContactDetailDialog from "@/components/contact-detail-dialog";
import UpcomingReminders from "@/components/upcoming-reminders";
import SmartSuggestionsWidget from "@/components/smart-suggestions-widget";
import ActivitySummary from "@/components/activity-summary";
import InteractionLogger from "@/components/interaction-logger";
import EmergencyButton from "@/components/emergency-button";
import ContactImportDialog from "@/components/contact-import-dialog";
import WelcomeTutorialDialog from "@/components/welcome-tutorial-dialog";
import { useAuth } from "@/hooks/use-auth";
import type { Contact, TimelineEntry, Reminder } from "@shared/schema";

export default function Home() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    document.title = "VelvetLog | Personal Relationship Management";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState<"name" | "location" | "datingStatus">("name");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("name");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [summaryContact, setSummaryContact] = useState<Contact | null>(null);
  const [loggerContact, setLoggerContact] = useState<Contact | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any | null>(null);
  const [selectedContactTab, setSelectedContactTab] = useState<"timeline" | "reminders">("timeline");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [reminderToComplete, setReminderToComplete] = useState<any | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Only show welcome popup if user has completed onboarding
    // This prevents the popup from showing when user presses back during signup
    const onboardingComplete = localStorage.getItem('velvetlog_onboarding_complete') === 'true';
    if (user && user.hasSeenWelcome === false && onboardingComplete) {
      setShowWelcome(true);
    }
  }, [user]);

  const markWelcomeSeenMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ hasSeenWelcome: true })
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: async () => {
      await refreshUser();
    }
  });

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    markWelcomeSeenMutation.mutate();
  };

  // Fetch all contacts for sidebar counts (unfiltered)
  const { data: allContacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('velvetlog_token');
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/contacts", {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  // Fetch filtered contacts for main display
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", searchQuery, searchCriteria, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
        params.append("searchBy", searchCriteria);
      }
      if (selectedStatus) params.append("status", selectedStatus);
      
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('velvetlog_token');
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/contacts?${params}`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  const { data: upcomingReminders = [] } = useQuery({
    queryKey: ["/api/reminders", { upcoming: true }],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('velvetlog_token');
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/reminders?upcoming=true", {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch reminders");
      return response.json();
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await apiRequest("DELETE", `/api/contacts/${contactId}`);
      return response;
    },
    onSuccess: () => {
      // Invalidate contacts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch timeline entries for summary contact
  const { data: summaryTimeline = [] } = useQuery<TimelineEntry[]>({
    queryKey: ["/api/contacts", summaryContact?.id, "timeline"],
    queryFn: async () => {
      if (!summaryContact) return [];
      
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('velvetlog_token');
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/contacts/${summaryContact.id}/timeline`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch timeline");
      return response.json();
    },
    enabled: !!summaryContact,
  });

  // Fetch reminders for summary contact
  const { data: summaryReminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/contacts", summaryContact?.id, "reminders"],
    queryFn: async () => {
      if (!summaryContact) return [];
      const response = await fetch(`/api/contacts/${summaryContact.id}/reminders`);
      if (!response.ok) throw new Error("Failed to fetch reminders");
      return response.json();
    },
    enabled: !!summaryContact,
  });

  // Complete reminder mutation
  const completeReminderMutation = useMutation({
    mutationFn: async ({ reminderId, notes }: { reminderId: number; notes?: string }) => {
      const response = await apiRequest("PUT", `/api/reminders/${reminderId}/complete`, { notes });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeline"] });
      toast({
        title: "Reminder completed",
        description: completionNotes.trim() 
          ? "Reminder completed and notes added to timeline." 
          : "Reminder has been marked as completed.",
      });
      setCompletionDialogOpen(false);
      setReminderToComplete(null);
      setCompletionNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Complete failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCompleteReminderClick = (reminder: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReminderToComplete(reminder);
    setCompletionNotes("");
    setCompletionDialogOpen(true);
  };

  const handleCompleteReminderSubmit = () => {
    if (reminderToComplete) {
      completeReminderMutation.mutate({
        reminderId: reminderToComplete.id,
        notes: completionNotes.trim() || undefined,
      });
    }
  };

  // Update reminder mutation
  const updateReminderMutation = useMutation({
    mutationFn: async (data: { id: number; title: string; type: string; dueDate: string }) => {
      const response = await apiRequest("PUT", `/api/reminders/${data.id}`, {
        title: data.title,
        type: data.type,
        dueDate: data.dueDate,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setEditingReminder(null);
      toast({
        title: "Reminder updated",
        description: "Reminder has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter contacts based on selected filters
  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    // Filter by status if selected
    if (selectedStatus) {
      filtered = filtered.filter(contact => contact.relationshipStatus === selectedStatus);
    }

    // Filter by special filters
    if (selectedFilter === "priority") {
      filtered = filtered.filter(contact => contact.isPriority);
    } else if (selectedFilter === "recentActivity") {
      // Show contacts with recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(contact => 
        contact.lastContactDate && new Date(contact.lastContactDate) > sevenDaysAgo
      );
    } else if (selectedFilter === "upcomingReminders") {
      // Show contacts with upcoming reminders
      // For now, return empty array since we'll show the reminders view instead
      filtered = [];
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => {
        if (searchCriteria === "name") {
          return contact.name.toLowerCase().includes(query);
        } else if (searchCriteria === "location") {
          return contact.location?.toLowerCase().includes(query) || false;
        } else if (searchCriteria === "datingStatus") {
          return contact.datingStatus?.toLowerCase().includes(query) || false;
        }
        return false;
      });
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(contact => 
        selectedTags.some(tag => contact.tags?.includes(tag))
      );
    }

    return filtered;
  }, [contacts, selectedStatus, selectedFilter, searchQuery, searchCriteria, selectedTags]);

  const sortedContacts = filteredContacts.slice().sort((a, b) => {
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
    setSelectedContactTab("timeline");
    setSelectedContact(contact);
  };

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
    setSelectedFilter(null); // Clear special filters when selecting status
  };

  const handleSpecialFilter = (filter: string | null) => {
    setSelectedFilter(filter);
    setSelectedStatus(null); // Clear status filter when selecting special filter
  };

  const handleViewSummary = (contact: Contact) => {
    setSummaryContact(contact);
  };

  const handleQuickLog = (contact: Contact) => {
    setLoggerContact(contact);
  };

  const handleDeleteContact = (contact: Contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}? This action cannot be undone.`)) {
      deleteContactMutation.mutate(contact.id);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedStatus(null);
    setSelectedFilter(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="button-toggle-sidebar"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                VelvetLog
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 hidden md:flex">
              <Select value={searchCriteria} onValueChange={(value: "name" | "location" | "datingStatus") => setSearchCriteria(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="datingStatus">Status</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={`Search by ${searchCriteria}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 border-pink-200 focus:border-pink-300 focus:ring-pink-200"
                />
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {upcomingReminders.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0">
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
                  upcomingReminders.slice(0, 5).map((reminder: any) => {
                    const contactName = allContacts.find(c => c.id === reminder.contactId)?.name || "Unknown Contact";
                    return (
                      <DropdownMenuItem 
                        key={reminder.id} 
                        className="px-3 py-3 cursor-pointer"
                        onClick={() => {
                          const contact = allContacts.find(c => c.id === reminder.contactId);
                          if (contact) {
                            setSelectedContactTab("timeline");
                            setSelectedContact(contact);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col space-y-1 flex-1">
                            <span className="font-medium text-sm">{reminder.title}</span>
                            <span className="text-xs text-gray-500">
                              {contactName} • {new Date(reminder.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            onClick={(e) => handleCompleteReminderClick(reminder, e)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50 ml-2 p-1"
                            disabled={completeReminderMutation.isPending}
                            data-testid={`button-complete-reminder-${reminder.id}`}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                ) : (
                  <DropdownMenuItem className="px-3 py-3">
                    <span className="text-sm text-gray-500">No upcoming reminders</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-pink-100 text-pink-600">
                      {user?.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900 hidden md:block">
                    {user?.firstName || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/calendar')}>
                  Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/refer')}>
                  Refer A Friend
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings')}>
                  Security Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  localStorage.removeItem('velvetlog_token');
                  localStorage.removeItem('velvetlog_user');
                  window.location.href = '/';
                }}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - hidden on mobile by default, shown when sidebarOpen is true */}
        <div className={`
          fixed md:relative top-[73px] md:top-0 bottom-0 left-0 z-50 md:z-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:block
        `}>
          <Sidebar 
            contacts={allContacts}
            selectedCategory={selectedStatus}
            selectedFilter={selectedFilter}
            onCategorySelect={(category) => {
              handleStatusFilter(category);
              setSidebarOpen(false);
            }}
            onSpecialFilter={(filter) => {
              handleSpecialFilter(filter);
              setSidebarOpen(false);
            }}
            upcomingReminders={upcomingReminders}
            onAddContact={() => {
              setIsAddDialogOpen(true);
              setSidebarOpen(false);
            }}
            onImportContacts={() => {
              setIsImportDialogOpen(true);
              setSidebarOpen(false);
            }}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Mobile Search */}
          <div className="md:hidden p-4 bg-white border-b border-pink-100 flex-shrink-0">
            <div className="flex flex-col space-y-3">
              <Select value={searchCriteria} onValueChange={(value: "name" | "location" | "datingStatus") => setSearchCriteria(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Search by Name</SelectItem>
                  <SelectItem value="location">Search by Location</SelectItem>
                  <SelectItem value="datingStatus">Search by Status</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={`Search by ${searchCriteria}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border-pink-200 focus:border-pink-300 focus:ring-pink-200"
                />
              </div>
            </div>
          </div>

          {/* Content Header */}
          <div className="bg-white/50 backdrop-blur-sm border-b border-pink-100 px-6 py-4 flex-shrink-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedStatus 
                    ? `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Connections`
                    : selectedFilter === "priority"
                    ? "Priority Connections"
                    : selectedFilter === "recentActivity" 
                    ? "Recent Activity"
                    : selectedFilter === "upcomingReminders"
                    ? "Upcoming Reminders"
                    : "All Connections"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your personal relationships with care and privacy
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Connection</span>
                </Button>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by: Name (A-Z)</SelectItem>
                    <SelectItem value="lastContact">Sort by: Last Contact</SelectItem>
                    <SelectItem value="priority">Sort by: Priority</SelectItem>
                    <SelectItem value="dateAdded">Sort by: Date Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact List / Reminders View */}
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            {selectedFilter === "upcomingReminders" ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-pink-100 p-6">
                  {upcomingReminders.length === 0 ? (
                    <div className="text-center">
                      <Clock className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Reminders</h3>
                      <p className="text-gray-600 mb-6">You're all caught up! No reminders are scheduled at the moment.</p>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                          Set reminders for birthdays, anniversaries, or follow-ups by editing your contacts.
                        </p>
                        <Button 
                          onClick={() => {
                            setSelectedFilter(null);
                            setSelectedStatus(null);
                          }}
                          variant="outline"
                          className="text-pink-600 border-pink-200 hover:bg-pink-50"
                        >
                          View All Connections
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="space-y-3">
                        {upcomingReminders
                          .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                          .map((reminder: any) => {
                          const contactName = allContacts.find(c => c.id === reminder.contactId)?.name || "Unknown Contact";
                          return (
                            <div key={reminder.id} className="bg-pink-50 rounded-lg p-4 text-left border border-pink-100 relative">
                              <Button
                                onClick={() => handleCompleteReminderClick(reminder)}
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 h-8 w-8 p-0 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-full"
                                disabled={completeReminderMutation.isPending}
                                data-testid={`button-mark-complete-${reminder.id}`}
                                title="Mark Complete"
                              >
                                <Check className="h-5 w-5" />
                              </Button>
                              <h4 
                                className="font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors pr-10"
                                onClick={() => {
                                  const contact = allContacts.find(c => c.id === reminder.contactId);
                                  if (contact) {
                                    setSelectedContactTab("timeline");
                                    setSelectedContact(contact);
                                  }
                                }}
                              >
                                {reminder.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  {getReminderTypeIcon(reminder.type)} {reminder.type} | {contactName}
                                </span> • {formatReminderDate(reminder.dueDate)}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <Button
                                  onClick={() => {
                                    const contact = allContacts.find(c => c.id === reminder.contactId);
                                    if (contact) {
                                      setSelectedContact(contact);
                                    }
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-pink-600 hover:bg-pink-50 text-xs h-8"
                                >
                                  View Timeline
                                </Button>
                                <Button
                                  onClick={() => setEditingReminder(reminder)}
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-8"
                                >
                                  Update Reminder
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-pink-100 p-4 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-pink-100 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-pink-100 rounded mb-2 w-1/3"></div>
                        <div className="h-3 bg-pink-100 rounded w-1/2"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-6 w-16 bg-pink-100 rounded"></div>
                        <div className="h-6 w-20 bg-pink-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedContacts.length > 0 ? (
              <div className="space-y-6">
                {/* Upcoming Reminders */}
                <UpcomingReminders 
                  reminders={upcomingReminders} 
                  contacts={allContacts} 
                  onViewAll={() => setSelectedFilter("upcomingReminders")}
                  onContactClick={(contact, tab) => {
                    setSelectedContactTab("timeline");
                    setSelectedContact(contact);
                  }}
                />
                
                {/* Smart Suggestions */}
                <SmartSuggestionsWidget 
                  contacts={allContacts}
                  onLogInteraction={(contact) => setLoggerContact(contact)}
                  onEditContact={(contact) => {
                    setEditingContact(contact);
                  }}
                  onCreateReminder={(contact, type) => {
                    setSelectedContact(contact);
                    setSelectedContactTab("reminders");
                  }}
                />
                
                <div className="space-y-3">
                {sortedContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className={`rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer ${
                      contact.relationshipStatus === 'ended' 
                        ? 'bg-gray-100 border-gray-200 hover:border-gray-300' 
                        : 'bg-white border-pink-100 hover:border-pink-200'
                    }`}
                    onClick={() => handleContactClick(contact)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage 
                            src={contact.photoUrl && localStorage.getItem('velvetlog_token') 
                              ? `${contact.photoUrl}?token=${localStorage.getItem('velvetlog_token')}` 
                              : contact.photoUrl || undefined} 
                            alt={contact.name} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {contact.name}
                                {contact.age && (
                                  <span className="text-sm text-gray-600 font-normal ml-2">{contact.age}</span>
                                )}
                              </h3>
                              {contact.isPriority && (
                                <Badge className="bg-pink-100 text-pink-700 border-pink-200 text-xs">
                                  High Priority
                                </Badge>
                              )}
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0 flex-shrink-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContactClick(contact);
                                  }}
                                  className="cursor-pointer"
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditContact(contact);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Contact
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteContact(contact);
                                  }}
                                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Contact
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex flex-col mt-1 text-sm text-gray-600 space-y-1">
                            {contact.location && (
                              <span className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" className="mr-1 flex-shrink-0">
                                  <path fill="#4F46E5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                <span className="truncate">{contact.location}</span>
                              </span>
                            )}
                            {contact.phone && (
                              <span className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" className="mr-1 flex-shrink-0">
                                  <path fill="#4F46E5" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                </svg>
                                {formatPhoneNumber(contact.phone)} {getCountryFlagFromPhone(contact.phone)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge variant={contact.relationshipStatus === 'dating' || contact.relationshipStatus === 'long-distance' ? 'default' : 'secondary'}>
                              {formatRelationshipStatus(contact.relationshipStatus)}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSummary(contact);
                              }}
                              className="text-xs h-7"
                            >
                              Summary
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickLog(contact);
                              }}
                              className="text-xs h-7"
                            >
                              Quick Log
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {contact.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">{contact.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {searchQuery ? (
                  // Search results empty state
                  <div>
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No connections found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
                  </div>
                ) : (
                  // First-time user onboarding experience
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to VelvetLog!</h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Your private space to organize dating connections, track interactions, and never miss important moments.
                      </p>
                    </div>

                    {/* Quick Start Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white rounded-xl border border-pink-100 p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                          <Plus className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Add Your First Contact</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Start by adding someone you're dating. Include photos, key details, and where you met.
                        </p>
                        <Button 
                          onClick={() => setIsAddDialogOpen(true)}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        >
                          Add Contact
                        </Button>
                      </div>

                      <div className="bg-white rounded-xl border border-pink-100 p-6">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                          <Clock className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Track Interactions</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Log calls, dates, and messages. Build a complete timeline of your relationship.
                        </p>
                        <Button variant="outline" className="w-full" disabled>
                          <Clock className="h-4 w-4 mr-2" />
                          Add Contact First
                        </Button>
                      </div>

                      <div className="bg-white rounded-xl border border-pink-100 p-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                          <Bell className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Never Miss Dates</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Set reminders for birthdays, anniversaries, and follow-ups. Stay on top of everything.
                        </p>
                        <Button variant="outline" className="w-full" disabled>
                          <Bell className="h-4 w-4 mr-2" />
                          Add Contact First
                        </Button>
                      </div>
                    </div>

                    {/* Value Proposition */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
                      <h3 className="font-semibold text-gray-900 mb-3 text-center">Why VelvetLog Users Love It:</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <strong className="text-gray-900">Remember Everything:</strong>
                            <span className="text-gray-600 ml-1">Never forget their favorite restaurant or important details</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <strong className="text-gray-900">Stay Organized:</strong>
                            <span className="text-gray-600 ml-1">Manage multiple connections without mixing up details</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <strong className="text-gray-900">Build Stronger Bonds:</strong>
                            <span className="text-gray-600 ml-1">Show genuine interest by remembering what matters</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <strong className="text-gray-900">Complete Privacy:</strong>
                            <span className="text-gray-600 ml-1">Your relationship data stays secure and encrypted</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-500">
                        💡 <strong>Pro tip:</strong> Start with just one contact to see how VelvetLog transforms your dating organization
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}


          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialogs */}
      <AddContactDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      
      <AddContactDialog
        open={!!editingContact}
        onOpenChange={(open) => !open && setEditingContact(null)}
        editingContact={editingContact}
      />

      <ContactDetailDialog
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedContact(null);
            setSelectedContactTab("timeline");
          }
        }}
        initialTab={selectedContactTab}
      />

      {/* Activity Summary Dialog */}
      {summaryContact && (
        <ActivitySummary
          contact={summaryContact}
          recentEntries={summaryTimeline}
          upcomingReminders={summaryReminders.filter(r => !r.isCompleted)}
          onClose={() => setSummaryContact(null)}
          onProceed={() => {
            setSummaryContact(null);
            setSelectedContact(summaryContact);
          }}
        />
      )}

      {/* Interaction Logger Dialog */}
      <InteractionLogger
        contact={loggerContact!}
        open={!!loggerContact}
        onOpenChange={(open) => !open && setLoggerContact(null)}
      />

      {/* Edit Reminder Dialog */}
      {editingReminder && (
        <EditReminderDialog
          reminder={editingReminder}
          onClose={() => setEditingReminder(null)}
          onSave={(data) => updateReminderMutation.mutate(data)}
          isLoading={updateReminderMutation.isPending}
        />
      )}

      {/* Complete Reminder Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Reminder</DialogTitle>
            <DialogDescription>
              {reminderToComplete && (
                <span className="block mt-1">
                  {reminderToComplete.title} • {allContacts.find(c => c.id === reminderToComplete.contactId)?.name || "Unknown Contact"}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="home-completion-notes">Notes (optional)</Label>
              <Textarea
                id="home-completion-notes"
                data-testid="input-home-completion-notes"
                placeholder="Add any notes about this interaction..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-gray-500">
                Notes will be added to the contact's timeline.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setCompletionDialogOpen(false)}
              data-testid="button-cancel-home-complete"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteReminderSubmit}
              disabled={completeReminderMutation.isPending}
              data-testid="button-confirm-home-complete"
              className="bg-pink-600 hover:bg-pink-700"
            >
              {completeReminderMutation.isPending ? "Completing..." : "Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Button */}
      <EmergencyButton position="floating" />

      {/* Contact Import Dialog */}
      <ContactImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />

      {/* Welcome Tutorial Dialog */}
      <WelcomeTutorialDialog
        open={showWelcome}
        onComplete={handleWelcomeComplete}
      />
    </div>
  );
}

// Edit Reminder Dialog Component
function EditReminderDialog({ 
  reminder, 
  onClose, 
  onSave, 
  isLoading 
}: { 
  reminder: any; 
  onClose: () => void; 
  onSave: (data: { id: number; title: string; type: string; dueDate: string }) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(reminder.title || "");
  const [type, setType] = useState(reminder.type || "call");
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date(reminder.dueDate);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  });

  const handleSave = () => {
    if (title.trim() && dueDate) {
      onSave({
        id: reminder.id,
        title: title.trim(),
        type,
        dueDate: new Date(dueDate).toISOString(),
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Reminder</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Reminder Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter reminder title..."
            />
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="anniversary">Anniversary</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="gift">Gift</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="dueDate">Due Date & Time</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!title.trim() || !dueDate || isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}