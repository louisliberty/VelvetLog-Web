import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Clock, 
  Plus, 
  Edit,
  Trash2,
  Star,
  Heart,
  MapPin,
  Upload,
  Lock
} from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  formatLastContact, 
  getStatusColor,
  formatRelationshipStatus,
  getReminderTypeIcon,
  getReminderTypeColor,
  getCountryFlagFromPhone,
  formatPhoneNumber
} from "@/lib/utils";
import { FileAttachment } from "./FileAttachment";
import { ObjectUploader } from "./ObjectUploader";
import type { Contact, TimelineEntry, Reminder } from "@shared/schema";

interface ContactDetailDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "timeline" | "reminders" | "attachments";
}

export default function ContactDetailDialog({
  contact,
  open,
  onOpenChange,
  initialTab = "timeline",
}: ContactDetailDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  
  // Check if user has a paid subscription (can upload photos)
  const hasActiveSubscription = user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing';
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderType, setNewReminderType] = useState("call");
  const [newReminderDate, setNewReminderDate] = useState("");
  const [hideCompletedReminders, setHideCompletedReminders] = useState(false);
  
  // New improved date/time picker state
  const [dateOption, setDateOption] = useState("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [reminderCalendarOpen, setReminderCalendarOpen] = useState(false);
  const [reminderHour, setReminderHour] = useState("12");
  const [reminderMinute, setReminderMinute] = useState("00");
  const [reminderAmPm, setReminderAmPm] = useState("PM");
  
  // Completion dialog state
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [reminderToComplete, setReminderToComplete] = useState<Reminder | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [scheduleNextReminder, setScheduleNextReminder] = useState("no");

  const { data: timelineEntries = [] } = useQuery<TimelineEntry[]>({
    queryKey: ["/api/contacts", contact?.id, "timeline"],
    queryFn: async () => {
      if (!contact) return [];
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('velvetlog_token');
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/contacts/${contact.id}/timeline`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch timeline");
      return response.json();
    },
    enabled: !!contact,
  });

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/contacts", contact?.id, "reminders"],
    queryFn: async () => {
      if (!contact) return [];
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('velvetlog_token');
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/contacts/${contact.id}/reminders`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch reminders");
      return response.json();
    },
    enabled: !!contact,
  });

  const addTimelineEntryMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; type: string; date: Date; contactId: number }) => {
      const response = await apiRequest("POST", "/api/timeline", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", contact?.id, "timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setNewNote("");
      toast({
        title: "Note added",
        description: "Timeline entry has been added successfully.",
      });
    },
  });

  const addReminderMutation = useMutation({
    mutationFn: async (data: { title: string; type: string; dueDate: Date; contactId: number }) => {
      const response = await apiRequest("POST", "/api/reminders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", contact?.id, "reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setNewReminderTitle("");
      setNewReminderDate("");
      setNewReminderType("call");
      toast({
        title: "Reminder added",
        description: "Reminder has been set successfully.",
      });
    },
    onError: (error: Error) => {
      console.error("Reminder creation error:", error);
      toast({
        title: "Failed to add reminder",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTimelineEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await apiRequest("DELETE", `/api/timeline/${entryId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", contact?.id, "timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Note deleted",
        description: "Timeline entry has been removed successfully.",
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

  const completeReminderMutation = useMutation({
    mutationFn: async ({ reminderId, notes, scheduleNext }: { reminderId: number; notes?: string; scheduleNext: boolean }) => {
      await apiRequest("PUT", `/api/reminders/${reminderId}/complete`, { notes });
      return { scheduleNext };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", contact?.id, "reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", contact?.id, "timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Reminder completed",
        description: completionNotes.trim()
          ? "Reminder completed and notes added to timeline."
          : "Reminder has been marked as completed.",
      });
      setCompletionDialogOpen(false);
      setReminderToComplete(null);
      setCompletionNotes("");
      setScheduleNextReminder("no");
      
      if (data.scheduleNext) {
        // Reset form fields for new reminder and show message
        setNewReminderTitle("");
        setNewReminderType("call");
        setDateOption("today");
        setSelectedDate(new Date());
        setReminderHour("12");
        setReminderMinute("00");
        setReminderAmPm("PM");
        
        // Brief delay, then show a prompt
        setTimeout(() => {
          toast({
            title: "Ready to schedule",
            description: "Use the 'Add Reminder' form above to create your next reminder.",
          });
        }, 300);
      }
    },
  });

  const handleCompleteReminderClick = (reminder: Reminder) => {
    setReminderToComplete(reminder);
    setCompletionNotes("");
    setScheduleNextReminder("no");
    setCompletionDialogOpen(true);
  };

  const handleCompleteReminderSubmit = () => {
    if (reminderToComplete) {
      completeReminderMutation.mutate({
        reminderId: reminderToComplete.id,
        notes: completionNotes.trim() || undefined,
        scheduleNext: scheduleNextReminder === "yes",
      });
    }
  };

  const updateContactMutation = useMutation({
    mutationFn: async (data: { id: number; [key: string]: any }) => {
      return await apiRequest("PUT", `/api/contacts/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", contact?.id] });
      toast({
        title: "Contact updated",
        description: "Contact has been updated successfully.",
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

  if (!contact) return null;

  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    addTimelineEntryMutation.mutate({
      contactId: contact.id,
      type: "note",
      title: "", // Empty title for notes
      description: newNote,
      date: new Date(),
    });
  };

  const getFinalReminderDate = () => {
    let finalDate = new Date();
    
    if (dateOption === "today") {
      finalDate = new Date();
    } else if (dateOption === "tomorrow") {
      finalDate = new Date();
      finalDate.setDate(finalDate.getDate() + 1);
    } else if (dateOption === "choose" && selectedDate) {
      finalDate = new Date(selectedDate);
    }
    
    // Set the time based on hour, minute, and AM/PM
    let hour = parseInt(reminderHour || "12");
    if (reminderAmPm === "PM" && hour !== 12) {
      hour += 12;
    } else if (reminderAmPm === "AM" && hour === 12) {
      hour = 0;
    }
    
    finalDate.setHours(hour, parseInt(reminderMinute || "00"), 0, 0);
    return finalDate;
  };

  const handleAddReminder = () => {
    if (!newReminderTitle.trim()) return;

    const finalDate = getFinalReminderDate();
    
    addReminderMutation.mutate({
      contactId: contact.id,
      type: newReminderType,
      title: newReminderTitle,
      dueDate: finalDate,
    });
    
    // Reset form
    setNewReminderTitle("");
    setNewReminderType("call");
    setDateOption("today");
    setSelectedDate(new Date());
    setReminderHour("12");
    setReminderMinute("00");
    setReminderAmPm("PM");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Connection Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="text-center pt-4">
              <div className="relative inline-block mb-6">
                {hasActiveSubscription ? (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5242880} // 5MB
                    buttonVariant="ghost"
                    onGetUploadParameters={async () => {
                      const response = await apiRequest("POST", "/api/objects/upload", {});
                      const data = await response.json();
                      return {
                        method: "PUT" as const,
                        url: data.uploadURL,
                      };
                    }}
                    onComplete={async (result) => {
                      if (result.successful.length > 0) {
                        const file = result.successful[0];
                        try {
                          // Set ACL policy for the uploaded photo
                          const aclResponse = await apiRequest("PUT", "/api/contact-attachments", {
                            attachmentURL: file.uploadURL,
                          });
                          const aclData = await aclResponse.json();
                          
                          // Update contact with new photo URL
                          updateContactMutation.mutate({
                            id: contact.id,
                            photoUrl: aclData.objectPath,
                          });
                          
                          // Force refetch to update the UI immediately
                          queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
                          
                          toast({
                            title: "Photo uploaded",
                            description: "Profile photo has been updated successfully.",
                          });
                        } catch (error) {
                          console.error("Failed to set photo ACL:", error);
                          toast({
                            title: "Upload failed", 
                            description: "Failed to process uploaded photo",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                    buttonClassName="relative inline-block cursor-pointer group !bg-transparent hover:!bg-transparent p-0 h-auto !border-none !shadow-none !ring-0 !outline-none rounded-full"
                  >
                    <Avatar className="h-20 w-20 ring-2 ring-transparent group-hover:ring-pink-300 transition-all">
                      <AvatarImage 
                        src={contact.photoUrl && localStorage.getItem('velvetlog_token') 
                          ? `${contact.photoUrl}?token=${localStorage.getItem('velvetlog_token')}` 
                          : contact.photoUrl || undefined} 
                        alt={contact.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-pink-50 text-gray-600 text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gray-500 group-hover:bg-pink-500 text-white border-2 border-white shadow-sm flex items-center justify-center transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </ObjectUploader>
                ) : (
                  <div 
                    className="relative inline-block cursor-pointer"
                    onClick={() => {
                      toast({
                        title: "Membership required",
                        description: "Upgrade to Membership to upload photos.",
                        variant: "destructive",
                      });
                    }}
                  >
                    <Avatar className="h-20 w-20">
                      <AvatarImage 
                        src={contact.photoUrl && localStorage.getItem('velvetlog_token') 
                          ? `${contact.photoUrl}?token=${localStorage.getItem('velvetlog_token')}` 
                          : contact.photoUrl || undefined} 
                        alt={contact.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-pink-50 text-gray-600 text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gray-400 text-white border-2 border-white shadow-sm flex items-center justify-center"
                      title="Upgrade to Membership to upload photos"
                    >
                      <Lock className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{contact.name}</h3>
              {contact.age && (
                <p className="text-gray-600">Age {contact.age}</p>
              )}
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Badge className={getStatusColor(contact.relationshipStatus || "dating")}>
                  {formatRelationshipStatus(contact.relationshipStatus || "dating")}
                </Badge>
                {contact.isPriority && (
                  <Badge variant="outline" className="text-pink-600 border-pink-300">
                    <Heart className="w-3 h-3 mr-1" />
                    Priority
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center space-x-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="flex-shrink-0">
                    <path fill="#4F46E5" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span className="text-sm">{formatPhoneNumber(contact.phone)}</span>
                  {getCountryFlagFromPhone(contact.phone) && (
                    <span className="text-sm">{getCountryFlagFromPhone(contact.phone)}</span>
                  )}
                </div>
              )}
              {contact.location && (
                <div className="flex items-center space-x-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="flex-shrink-0">
                    <path fill="#4F46E5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="text-sm">{contact.location}</span>
                </div>
              )}
              {contact.job && (
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{contact.job}</span>
                </div>
              )}
              {contact.instagram && (
                <div className="flex items-center space-x-3">
                  <SiInstagram className="w-4 h-4 text-gray-400" />
                  <span 
                    className="text-sm hover:text-pink-500 cursor-pointer"
                    onClick={() => window.open(`https://instagram.com/${contact.instagram}`, '_blank')}
                  >
                    {contact.instagram}
                  </span>
                </div>
              )}
              {contact.birthday && (
                <div className="flex items-center space-x-3">
                  <span className="w-4 h-4 text-gray-400 text-center">🎂</span>
                  <span className="text-sm">
                    {new Date(contact.birthday).getFullYear() === 1900 
                      ? format(new Date(contact.birthday), "MMMM d")
                      : format(new Date(contact.birthday), "MMMM d, yyyy")
                    }
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  Last contact: {formatLastContact(contact.lastContactDate)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  Added: {format(new Date(contact.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            {contact.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {contact.notes}
                </p>
              </div>
            )}
          </div>

          {/* Timeline, Reminders, and Attachments */}
          <div className="md:col-span-2">
            <Tabs defaultValue={initialTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="reminders">Reminders</TabsTrigger>
                <TabsTrigger value="attachments">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                {/* Add Note */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label htmlFor="new-note" className="text-sm font-medium">
                    Add details to remember
                  </Label>
                  <Textarea
                    id="new-note"
                    placeholder="Add a note about your interaction..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addTimelineEntryMutation.isPending}
                    className="mt-2"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                {/* Timeline Entries */}
                <div className="space-y-3">
                  {timelineEntries.length > 0 ? (
                    timelineEntries.map((entry) => (
                      <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {entry.title && entry.title.trim() && (
                              <h4 className="text-sm font-medium text-gray-900">
                                {entry.title}
                              </h4>
                            )}
                            {entry.description && (
                              <div className={`${!entry.title || !entry.title.trim() ? '' : 'mt-1'}`}>
                                {entry.description.split('\n').map((line, idx) => {
                                  const isMetadata = line.startsWith('Mood:') || line.startsWith('Outcome:') || line.startsWith('Duration:') || line.startsWith('Location:');
                                  return (
                                    <p key={idx} className={isMetadata ? 'text-xs text-gray-500' : 'text-sm text-black'}>
                                      {line}
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {format(new Date(entry.date), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {entry.type}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTimelineEntryMutation.mutate(entry.id)}
                              disabled={deleteTimelineEntryMutation.isPending}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No timeline entries yet. Add a note to get started.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reminders" className="space-y-4">
                {/* Add Reminder */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <Label className="text-sm font-medium">Add Reminder</Label>
                  <Input
                    placeholder="Add reminder details here"
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                  />
                  <div className="space-y-3">
                    <Select value={newReminderType} onValueChange={setNewReminderType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="date">Hot Date</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">When</Label>
                      <Select value={dateOption} onValueChange={setDateOption}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="tomorrow">Tomorrow</SelectItem>
                          <SelectItem value="choose">Choose Date</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {dateOption === "choose" && (
                        <Popover open={reminderCalendarOpen} onOpenChange={setReminderCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-auto p-0" 
                            align="start"
                            onEscapeKeyDown={(e) => {
                              e.preventDefault();
                              setReminderCalendarOpen(false);
                              onOpenChange(false);
                            }}
                          >
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                // If clicking same date or any date, keep/set it and close
                                if (date) {
                                  setSelectedDate(date);
                                } 
                                // If date is undefined (clicked same date), just close without clearing
                                setReminderCalendarOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    
                    {/* Time Selection */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Time</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="12"
                          value={reminderHour}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                              setReminderHour(value);
                            }
                          }}
                          maxLength={2}
                        />
                        <Input
                          placeholder="00"
                          value={reminderMinute}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                              setReminderMinute(value);
                            }
                          }}
                          maxLength={2}
                        />
                        <Select value={reminderAmPm} onValueChange={setReminderAmPm}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddReminder}
                    disabled={!newReminderTitle.trim() || !reminderHour || !reminderMinute || addReminderMutation.isPending}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reminder
                  </Button>
                </div>

                {/* Reminders List Header */}
                {reminders.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Reminders</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHideCompletedReminders(!hideCompletedReminders)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {hideCompletedReminders ? "Show Completed" : "Hide Completed"}
                    </Button>
                  </div>
                )}

                {/* Reminders List */}
                <div className="space-y-3">
                  {(() => {
                    const filteredReminders = reminders.filter(reminder => !hideCompletedReminders || !reminder.isCompleted);
                    
                    if (reminders.length === 0) {
                      return (
                        <p className="text-center text-gray-500 py-8">
                          No reminders set. Add a reminder to stay organized.
                        </p>
                      );
                    }
                    
                    if (filteredReminders.length === 0 && hideCompletedReminders) {
                      return (
                        <p className="text-center text-gray-500 py-8">
                          All reminders are completed and hidden.
                        </p>
                      );
                    }
                    
                    return filteredReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`border rounded-lg p-4 ${
                          reminder.isCompleted
                            ? "bg-gray-50 border-gray-200"
                            : getReminderTypeColor(reminder.type)
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <span className="text-sm">{getReminderTypeIcon(reminder.type)}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                reminder.isCompleted
                                  ? "text-gray-500 line-through"
                                  : "text-gray-900"
                              }`}>
                                {reminder.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {format(new Date(reminder.dueDate), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                          {!reminder.isCompleted && (
                            <Button
                              onClick={() => handleCompleteReminderClick(reminder)}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-800"
                              data-testid={`button-complete-detail-reminder-${reminder.id}`}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4">
                {hasActiveSubscription ? (
                  <FileAttachment
                    contactId={contact.id}
                    attachments={(contact.attachments as any) || []}
                    onAttachmentsUpdate={(attachments) => {
                      // Update contact with new attachments
                      updateContactMutation.mutate({
                        id: contact.id,
                        attachments: attachments,
                      });
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Lock className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">File uploads require Membership</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Upgrade to Membership to upload photos, documents, and other files to your connections.
                    </p>
                    <Button
                      variant="default"
                      className="mt-4 bg-pink-500 hover:bg-pink-600"
                      onClick={() => window.location.href = "/billing"}
                    >
                      Upgrade to Membership
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>

      {/* Complete Reminder Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Reminder</DialogTitle>
            <DialogDescription>
              {reminderToComplete && (
                <span className="block mt-1">
                  {reminderToComplete.title} • {contact?.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="detail-completion-notes">Notes (optional)</Label>
              <Textarea
                id="detail-completion-notes"
                data-testid="input-detail-completion-notes"
                placeholder="Add any notes about this interaction..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-gray-500">
                Notes will be added to the contact's timeline.
              </p>
            </div>
            
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-base font-medium">Schedule Your Next Reminder?</Label>
              <RadioGroup 
                value={scheduleNextReminder} 
                onValueChange={setScheduleNextReminder}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="detail-schedule-yes" />
                  <Label htmlFor="detail-schedule-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="detail-schedule-no" />
                  <Label htmlFor="detail-schedule-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setCompletionDialogOpen(false)}
              data-testid="button-cancel-detail-complete"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteReminderSubmit}
              disabled={completeReminderMutation.isPending}
              data-testid="button-confirm-detail-complete"
              className="bg-pink-600 hover:bg-pink-700"
            >
              {completeReminderMutation.isPending ? "Completing..." : "Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
