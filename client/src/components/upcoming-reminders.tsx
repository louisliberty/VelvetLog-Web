import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  formatReminderDate,
  getReminderTypeIcon, 
  getReminderTypeColor,
  getReminderIconColor
} from "@/lib/utils";
import type { Contact, Reminder } from "@shared/schema";

interface UpcomingRemindersProps {
  reminders: Reminder[];
  contacts: Contact[];
  onViewAll?: () => void;
  onContactClick?: (contact: Contact, tab?: "timeline" | "reminders") => void;
}

export default function UpcomingReminders({ 
  reminders, 
  contacts,
  onViewAll,
  onContactClick
}: UpcomingRemindersProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [scheduleNextReminder, setScheduleNextReminder] = useState("no");
  
  // New reminder dialog state
  const [newReminderDialogOpen, setNewReminderDialogOpen] = useState(false);
  const [newReminderContactId, setNewReminderContactId] = useState<number | null>(null);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderType, setNewReminderType] = useState("call");
  const [newReminderDateOption, setNewReminderDateOption] = useState("today");
  const [newReminderSelectedDate, setNewReminderSelectedDate] = useState<Date | undefined>(new Date());
  const [newReminderCalendarOpen, setNewReminderCalendarOpen] = useState(false);
  const [newReminderHour, setNewReminderHour] = useState("12");
  const [newReminderMinute, setNewReminderMinute] = useState("00");
  const [newReminderAmPm, setNewReminderAmPm] = useState("PM");

  const completeReminderMutation = useMutation({
    mutationFn: async ({ reminderId, notes, scheduleNext, contactId }: { reminderId: number; notes?: string; scheduleNext: boolean; contactId: number }) => {
      await apiRequest("PUT", `/api/reminders/${reminderId}/complete`, { notes });
      return { scheduleNext, contactId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeline"] });
      toast({
        title: "Reminder completed",
        description: completionNotes.trim() 
          ? "Reminder completed and notes added to timeline." 
          : "Reminder has been marked as completed.",
      });
      setCompletionDialogOpen(false);
      setCompletionNotes("");
      setScheduleNextReminder("no");
      setSelectedReminder(null);
      
      if (data.scheduleNext && data.contactId) {
        // Open new reminder dialog after a brief delay to allow the completion dialog to fully close
        setTimeout(() => {
          setNewReminderContactId(data.contactId);
          setNewReminderTitle("");
          setNewReminderType("call");
          setNewReminderDateOption("today");
          setNewReminderSelectedDate(new Date());
          setNewReminderHour("12");
          setNewReminderMinute("00");
          setNewReminderAmPm("PM");
          setNewReminderDialogOpen(true);
        }, 150);
      }
    },
  });

  const addReminderMutation = useMutation({
    mutationFn: async (reminderData: { contactId: number; title: string; type: string; dueDate: string }) => {
      await apiRequest("POST", "/api/reminders", reminderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Reminder scheduled",
        description: "Your next reminder has been created.",
      });
      setNewReminderDialogOpen(false);
      setNewReminderContactId(null);
    },
  });

  const handleCompleteClick = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setCompletionNotes("");
    setScheduleNextReminder("no");
    setCompletionDialogOpen(true);
  };

  const handleCompleteSubmit = () => {
    if (selectedReminder) {
      completeReminderMutation.mutate({
        reminderId: selectedReminder.id,
        notes: completionNotes.trim() || undefined,
        scheduleNext: scheduleNextReminder === "yes",
        contactId: selectedReminder.contactId,
      });
    }
  };

  const handleAddNewReminder = () => {
    if (!newReminderContactId || !newReminderTitle.trim()) return;
    
    let dueDate = new Date();
    
    if (newReminderDateOption === "today") {
      dueDate = new Date();
    } else if (newReminderDateOption === "tomorrow") {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
    } else if (newReminderDateOption === "choose" && newReminderSelectedDate) {
      dueDate = new Date(newReminderSelectedDate);
    }
    
    // Set the time
    let hour = parseInt(newReminderHour) || 12;
    if (newReminderAmPm === "PM" && hour !== 12) hour += 12;
    if (newReminderAmPm === "AM" && hour === 12) hour = 0;
    dueDate.setHours(hour, parseInt(newReminderMinute) || 0, 0, 0);
    
    addReminderMutation.mutate({
      contactId: newReminderContactId,
      title: newReminderTitle.trim(),
      type: newReminderType,
      dueDate: dueDate.toISOString(),
    });
  };

  const getContactName = (contactId: number): string => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || "Unknown Contact";
  };

  if (reminders.length === 0) return null;

  return (
    <>
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Reminder</DialogTitle>
            <DialogDescription>
              {selectedReminder && (
                <span className="block mt-1">
                  {selectedReminder.title} • {getContactName(selectedReminder.contactId)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completion-notes">Details to remember (optional)</Label>
              <Textarea
                id="completion-notes"
                data-testid="input-completion-notes"
                placeholder="Add any details about this interaction..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-gray-500">
                Details will be added to the contact's timeline.
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
                  <RadioGroupItem value="yes" id="schedule-yes" />
                  <Label htmlFor="schedule-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="schedule-no" />
                  <Label htmlFor="schedule-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setCompletionDialogOpen(false)}
              data-testid="button-cancel-complete"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteSubmit}
              disabled={completeReminderMutation.isPending}
              data-testid="button-confirm-complete"
              className="bg-pink-600 hover:bg-pink-700"
            >
              {completeReminderMutation.isPending ? "Completing..." : "Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Reminders</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-pink-600 hover:text-pink-700"
            onClick={onViewAll}
          >
            View All
          </Button>
        </div>

        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center space-x-4 p-3 rounded-lg border ${getReminderTypeColor(reminder.type)}`}
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-lg">{getReminderTypeIcon(reminder.type)}</span>
                </div>
              </div>
              <div className="flex-1">
                <p 
                  className="font-medium text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                  onClick={() => {
                    const contact = contacts.find(c => c.id === reminder.contactId);
                    if (contact && onContactClick) {
                      onContactClick(contact, "timeline");
                    }
                  }}
                >
                  {reminder.title}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-purple-600">{getContactName(reminder.contactId)}</span> • {formatReminderDate(reminder.dueDate)}
                </p>
              </div>
              <Button
                onClick={() => handleCompleteClick(reminder)}
                variant="ghost"
                size="sm"
                className={`${getReminderIconColor(reminder.type)} hover:bg-opacity-10`}
                disabled={completeReminderMutation.isPending}
                data-testid={`button-complete-reminder-${reminder.id}`}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* New Reminder Dialog */}
      <Dialog open={newReminderDialogOpen} onOpenChange={setNewReminderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Next Reminder</DialogTitle>
            <DialogDescription>
              {newReminderContactId && (
                <span className="block mt-1">
                  Create a follow-up reminder for {getContactName(newReminderContactId)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Reminder Title</Label>
              <Input
                placeholder="What do you want to remember?"
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
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
            </div>
            
            <div className="space-y-2">
              <Label>When</Label>
              <Select value={newReminderDateOption} onValueChange={setNewReminderDateOption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="choose">Choose Date</SelectItem>
                </SelectContent>
              </Select>
              
              {newReminderDateOption === "choose" && (
                <Popover open={newReminderCalendarOpen} onOpenChange={setNewReminderCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {newReminderSelectedDate ? format(newReminderSelectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newReminderSelectedDate}
                      onSelect={(date) => {
                        // Only update if a new date is selected, keep current if clicking same date
                        if (date) {
                          setNewReminderSelectedDate(date);
                        }
                        setNewReminderCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Time</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="12"
                  value={newReminderHour}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                      setNewReminderHour(value);
                    }
                  }}
                  maxLength={2}
                />
                <Input
                  placeholder="00"
                  value={newReminderMinute}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                      setNewReminderMinute(value);
                    }
                  }}
                  maxLength={2}
                />
                <Select value={newReminderAmPm} onValueChange={setNewReminderAmPm}>
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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setNewReminderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddNewReminder}
              disabled={!newReminderTitle.trim() || addReminderMutation.isPending}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {addReminderMutation.isPending ? "Saving..." : "Create Reminder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
