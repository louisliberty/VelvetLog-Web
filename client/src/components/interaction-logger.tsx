import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, Clock, MessageCircle, Phone, Heart, Gift, Users, Send, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Contact } from "@shared/schema";

interface InteractionLoggerProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const interactionTypes = [
  { value: "call", label: "Phone Call", icon: Phone, color: "bg-blue-500" },
  { value: "text", label: "Text Message", icon: MessageCircle, color: "bg-green-500" },
  { value: "date", label: "Date", icon: Heart, color: "bg-pink-500" },
  { value: "meeting", label: "Meetup", icon: Users, color: "bg-purple-500" },
  { value: "social", label: "Social Media", icon: Share2, color: "bg-indigo-500" },
];

export default function InteractionLogger({ contact, open, onOpenChange }: InteractionLoggerProps) {
  const [type, setType] = useState("call");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeValue, setTimeValue] = useState("12:00");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("minutes");
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState("neutral");
  const [isPositive, setIsPositive] = useState(true);
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createInteractionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/timeline", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", contact.id, "timeline"] });
      
      // If follow-up needed, create reminder
      if (followUpNeeded && followUpDate) {
        createFollowUpReminder();
      }
      
      toast({
        title: "Interaction Logged",
        description: "Your interaction has been recorded successfully.",
      });
      
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log interaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createFollowUpReminder = async () => {
    try {
      await apiRequest("POST", "/api/reminders", {
        contactId: contact.id,
        type: "followup",
        title: `Follow up after ${title}`,
        description: `Follow up regarding the ${type} interaction`,
        dueDate: new Date(followUpDate),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    } catch (error) {
      console.error("Failed to create follow-up reminder:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedDate(new Date());
    setTimeValue("12:00");
    setDatePickerOpen(false);
    setDurationValue("");
    setDurationUnit("minutes");
    setLocation("");
    setMood("neutral");
    setIsPositive(true);
    setFollowUpNeeded(false);
    setFollowUpDate("");
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title for this interaction.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = timeValue.split(':').map(Number);
    const dateWithTime = new Date(selectedDate);
    dateWithTime.setHours(hours, minutes, 0, 0);
    
    const interactionData = {
      contactId: contact.id,
      type,
      title: title.trim(),
      description: [
        description.trim(),
        durationValue && `Duration: ${durationValue} ${durationUnit}`,
        location && `Location: ${location}`,
        `Mood: ${mood}`,
        `Outcome: ${isPositive ? "Positive" : "Needs attention"}`,
      ].filter(Boolean).join('\n'),
      date: dateWithTime,
    };

    createInteractionMutation.mutate(interactionData);
  };

  const selectedType = interactionTypes.find(t => t.value === type);

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-pink-50 to-purple-50 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-pink-600" />
            Log Interaction with {contact.name}
          </DialogTitle>
          <DialogDescription>
            Record your interaction to keep track of your relationship history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Interaction Type */}
          <div className="space-y-2">
            <Label>Interaction Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {interactionTypes.map((interactionType) => (
                  <SelectItem key={interactionType.value} value={interactionType.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${interactionType.color}`} />
                      {interactionType.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Context */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {selectedType && <selectedType.icon className="w-4 h-4" />}
              <span className="font-medium">Quick Details</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <Label className="text-xs">Duration</Label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    placeholder="30"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    className="h-8 flex-1"
                    min="1"
                  />
                  <Select value={durationUnit} onValueChange={setDurationUnit}>
                    <SelectTrigger className="h-8 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">min</SelectItem>
                      <SelectItem value="hours">hrs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="location" className="text-xs">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Coffee shop, Home"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder={`What was the main focus of this ${selectedType?.label.toLowerCase()}?`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Details</Label>
            <Textarea
              id="description"
              placeholder="What happened? What did you talk about? Any important details to remember..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Date & Time</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100]" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                      // Close popover when any date is clicked (including re-selecting the same date)
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                id="time"
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
              />
            </div>
          </div>

          {/* Mood & Outcome */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Overall Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="great">😊 Great</SelectItem>
                  <SelectItem value="good">🙂 Good</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="tense">😬 Tense</SelectItem>
                  <SelectItem value="difficult">😟 Difficult</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Outcome</Label>
              <div className="flex items-center space-x-2 h-10">
                <Switch
                  checked={isPositive}
                  onCheckedChange={setIsPositive}
                />
                <Badge variant={isPositive ? "default" : "secondary"}>
                  {isPositive ? "Positive" : "Needs Attention"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Follow-up */}
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <Label htmlFor="follow-up">Schedule Follow-up?</Label>
              <Switch
                id="follow-up"
                checked={followUpNeeded}
                onCheckedChange={setFollowUpNeeded}
              />
            </div>
            
            {followUpNeeded && (
              <div className="space-y-2">
                <Label htmlFor="follow-up-date">Follow-up Date</Label>
                <Input
                  id="follow-up-date"
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createInteractionMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {createInteractionMutation.isPending ? "Logging..." : "Log Interaction"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}