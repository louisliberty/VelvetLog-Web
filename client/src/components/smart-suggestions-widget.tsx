import { useState, useEffect } from "react";
import { Zap, Bell, Check, AlertTriangle, Clock, Gift, MessageCircle, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Contact } from "@shared/schema";

interface SmartSuggestion {
  type: 'birthday' | 'anniversary' | 'communication' | 'milestone';
  contact: Contact;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  daysUntil?: number;
  suggestions: string[];
}

interface SmartSuggestionsWidgetProps {
  contacts: Contact[];
  onLogInteraction?: (contact: Contact) => void;
  onEditContact?: (contact: Contact) => void;
  onCreateReminder?: (contact: Contact, type: string) => void;
}

export default function SmartSuggestionsWidget({ contacts, onLogInteraction, onEditContact, onCreateReminder }: SmartSuggestionsWidgetProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SmartSuggestion | null>(null);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderType, setReminderType] = useState("call");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00");
  const { toast } = useToast();

  const createReminderMutation = useMutation({
    mutationFn: async (data: { contactId: number; title: string; type: string; dueDate: string }) => {
      return apiRequest('POST', '/api/reminders', data);
    },
    onSuccess: () => {
      // Invalidate all reminder-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders', { upcoming: true }] });
      toast({
        title: "Reminder Created",
        description: "Your reminder has been set successfully",
      });
    },
  });

  useEffect(() => {
    generateSuggestions();
  }, [contacts]);

  const generateSuggestions = () => {
    const newSuggestions: SmartSuggestion[] = [];
    const now = new Date();

    contacts.forEach(contact => {
      const suggestionId = `${contact.id}`;
      
      // Skip ended relationships
      if (contact.relationshipStatus === 'ended') return;

      // Birthday suggestions (within 30 days)
      if (contact.birthday) {
        const birthday = new Date(contact.birthday);
        // Skip if year is 1900 (N/A)
        if (birthday.getFullYear() !== 1900 || (birthday.getMonth() !== 0 || birthday.getDate() !== 1)) {
          const nextBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
          if (nextBirthday < now) {
            nextBirthday.setFullYear(now.getFullYear() + 1);
          }
          
          const daysUntilBirthday = Math.floor((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilBirthday <= 30 && daysUntilBirthday >= 0 && !dismissedIds.has(`birthday-${suggestionId}`)) {
            const urgency = daysUntilBirthday <= 7 ? 'high' : daysUntilBirthday <= 14 ? 'medium' : 'low';
            
            newSuggestions.push({
              type: 'birthday',
              contact,
              title: daysUntilBirthday === 0 
                ? `🎂 ${contact.name}'s Birthday is TODAY!`
                : `${contact.name}'s Birthday in ${daysUntilBirthday} days`,
              description: daysUntilBirthday <= 7 
                ? "Time to plan something special!" 
                : "Start thinking about a thoughtful gesture",
              urgency,
              daysUntil: daysUntilBirthday,
              suggestions: generateBirthdayIdeas(contact, daysUntilBirthday),
            });
          }
        }
      }

      // Anniversary suggestions (within 30 days)
      if (contact.anniversaryDate) {
        const anniversary = new Date(contact.anniversaryDate);
        const nextAnniversary = new Date(now.getFullYear(), anniversary.getMonth(), anniversary.getDate());
        if (nextAnniversary < now) {
          nextAnniversary.setFullYear(now.getFullYear() + 1);
        }
        
        const daysUntilAnniversary = Math.floor((nextAnniversary.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilAnniversary <= 30 && daysUntilAnniversary >= 0 && !dismissedIds.has(`anniversary-${suggestionId}`)) {
          const urgency = daysUntilAnniversary <= 7 ? 'high' : daysUntilAnniversary <= 14 ? 'medium' : 'low';
          
          newSuggestions.push({
            type: 'anniversary',
            contact,
            title: daysUntilAnniversary === 0 
              ? `💕 Anniversary with ${contact.name} is TODAY!`
              : `Anniversary with ${contact.name} in ${daysUntilAnniversary} days`,
            description: "Celebrate the milestone of your first date!",
            urgency,
            daysUntil: daysUntilAnniversary,
            suggestions: generateAnniversaryIdeas(contact, daysUntilAnniversary),
          });
        }
      }

      // Communication frequency suggestions
      if (contact.lastContactDate && !dismissedIds.has(`communication-${suggestionId}`)) {
        const lastContact = new Date(contact.lastContactDate);
        const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
        
        // Suggest reconnection based on relationship type
        const thresholds: Record<string, number> = {
          'dating': 5,
          'exclusive': 3,
          'serious': 3,
          'long-distance': 2,
          'open': 7,
          'fwb': 10,
          'friends': 14,
        };
        
        const threshold = thresholds[contact.relationshipStatus || 'dating'] || 7;
        
        if (daysSinceContact >= threshold) {
          const urgency = contact.isPriority ? 'high' : daysSinceContact > threshold * 2 ? 'medium' : 'low';
          
          newSuggestions.push({
            type: 'communication',
            contact,
            title: `Reconnect with ${contact.name}`,
            description: `It's been ${daysSinceContact} days since your last interaction`,
            urgency,
            daysUntil: daysSinceContact,
            suggestions: generateCommunicationIdeas(daysSinceContact),
          });
        }
      }
      
      // New contact suggestions - no interactions logged yet
      if (!contact.lastContactDate && !dismissedIds.has(`new-${suggestionId}`)) {
        const urgency = contact.isPriority ? 'high' : 'medium';
        
        newSuggestions.push({
          type: 'milestone',
          contact,
          title: `Get to know ${contact.name} better`,
          description: "No interactions logged yet - start tracking your connection!",
          urgency,
          daysUntil: 999, // Low priority in sorting
          suggestions: generateNewContactIdeas(contact),
        });
      }
    });

    // Sort by urgency and days until event
    newSuggestions.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      if (urgencyOrder[b.urgency] !== urgencyOrder[a.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return (a.daysUntil || 999) - (b.daysUntil || 999);
    });

    setSuggestions(newSuggestions.slice(0, 5));
  };

  const generateBirthdayIdeas = (contact: Contact, daysUntil: number): string[] => {
    if (daysUntil <= 3) {
      return ['Quick gift shopping', 'Make dinner reservations', 'Plan a surprise'];
    } else if (daysUntil <= 14) {
      return ['Order a thoughtful gift', 'Plan a special date', 'Write a heartfelt card'];
    }
    return ['Start thinking about gift ideas', 'Ask about their birthday wishes', 'Save the date'];
  };

  const generateAnniversaryIdeas = (contact: Contact, daysUntil: number): string[] => {
    if (daysUntil <= 3) {
      return ['Book a special restaurant', 'Plan a surprise evening', 'Get flowers'];
    } else if (daysUntil <= 14) {
      return ['Plan a romantic getaway', 'Create a memory book', 'Book a couples activity'];
    }
    return ['Start planning something memorable', 'Think about meaningful gifts', 'Reflect on your journey'];
  };

  const generateCommunicationIdeas = (daysSince: number): string[] => {
    if (daysSince < 7) {
      return ['Send a sweet text', 'Share something funny', 'Plan next meetup'];
    } else if (daysSince < 14) {
      return ['Schedule a phone call', 'Plan a coffee date', 'Send a thinking of you message'];
    }
    return ['Reach out with a heartfelt message', 'Plan a special reunion', 'Check in on how they are doing'];
  };

  const generateNewContactIdeas = (contact: Contact): string[] => {
    const ideas = ['Log your first interaction'];
    
    // Only suggest adding birthday if not already set (or if it's just the N/A placeholder)
    const hasBirthday = contact.birthday && new Date(contact.birthday).getFullYear() !== 1900;
    if (!hasBirthday) {
      ideas.push('Add their birthday');
    }
    
    ideas.push('Note their interests');
    
    if (!contact.phone) {
      ideas.push('Add their phone number');
    }
    if (!contact.email) {
      ideas.push('Add their email');
    }
    return ideas.slice(0, 3);
  };

  const handleDismiss = (suggestion: SmartSuggestion) => {
    const dismissId = `${suggestion.type}-${suggestion.contact.id}`;
    setDismissedIds(prev => {
      const newSet = new Set(Array.from(prev));
      newSet.add(dismissId);
      return newSet;
    });
    setSuggestions(prev => prev.filter(s => 
      !(s.type === suggestion.type && s.contact.id === suggestion.contact.id)
    ));
  };

  const getDefaultDateTime = () => {
    const now = new Date();
    // Round up to the next full hour
    const minutes = now.getMinutes();
    if (minutes > 0) {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
    }
    now.setSeconds(0);
    now.setMilliseconds(0);
    
    // Use local date format (YYYY-MM-DD) to avoid timezone issues
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const hours = now.getHours();
    const timeStr = `${hours.toString().padStart(2, '0')}:00`;
    
    return { dateStr, timeStr };
  };

  const handleOpenReminderDialog = (suggestion: SmartSuggestion) => {
    // Use today's date with time rounded up to next hour
    const { dateStr, timeStr } = getDefaultDateTime();
    
    // Set default form values
    setSelectedSuggestion(suggestion);
    setReminderTitle(suggestion.title);
    setReminderType(suggestion.type === 'communication' ? 'call' : 
                    suggestion.type === 'milestone' ? 'other' : 
                    suggestion.type);
    setReminderDate(dateStr);
    setReminderTime(timeStr);
    setDialogOpen(true);
  };

  const handleSubmitReminder = () => {
    if (!selectedSuggestion) return;
    
    const dueDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
    
    createReminderMutation.mutate({
      contactId: selectedSuggestion.contact.id,
      title: reminderTitle,
      type: reminderType,
      dueDate: dueDateTime.toISOString(),
    });

    handleDismiss(selectedSuggestion);
    setDialogOpen(false);
    setSelectedSuggestion(null);
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Gift className="w-4 h-4 text-pink-600" />;
      case 'anniversary':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'communication':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'milestone':
        return <UserPlus className="w-4 h-4 text-green-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const handleActionClick = (action: string, suggestion: SmartSuggestion) => {
    const contact = suggestion.contact;
    
    // Handle specific actions
    if (action.toLowerCase().includes('log') && action.toLowerCase().includes('interaction')) {
      onLogInteraction?.(contact);
    } else if (action.toLowerCase().includes('birthday') && action.toLowerCase().includes('add')) {
      onEditContact?.(contact);
    } else if (action.toLowerCase().includes('phone') && action.toLowerCase().includes('add')) {
      onEditContact?.(contact);
    } else if (action.toLowerCase().includes('email') && action.toLowerCase().includes('add')) {
      onEditContact?.(contact);
    } else {
      // All other actions open the reminder dialog with appropriate defaults
      let type = 'call';
      let title = action;
      
      if (action.toLowerCase().includes('gift')) {
        type = 'gift';
        title = `Gift for ${contact.name}`;
      } else if (action.toLowerCase().includes('plan') || action.toLowerCase().includes('memorable')) {
        type = 'date';
        title = `Plan something special for ${contact.name}`;
      } else if (action.toLowerCase().includes('call')) {
        type = 'call';
        title = `Call ${contact.name}`;
      } else if (action.toLowerCase().includes('text') || action.toLowerCase().includes('message')) {
        type = 'text';
        title = `Text ${contact.name}`;
      } else if (action.toLowerCase().includes('date') || action.toLowerCase().includes('restaurant') || action.toLowerCase().includes('reservation')) {
        type = 'date';
        title = `Date with ${contact.name}`;
      } else if (action.toLowerCase().includes('reflect') || action.toLowerCase().includes('journey')) {
        type = 'other';
        title = `Reflect on relationship with ${contact.name}`;
      }
      
      // Set up the dialog with pre-filled values - use today's date with rounded time
      const { dateStr, timeStr } = getDefaultDateTime();
      
      setSelectedSuggestion(suggestion);
      setReminderTitle(title);
      setReminderType(type);
      setReminderDate(dateStr);
      setReminderTime(timeStr);
      setDialogOpen(true);
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 mb-6" data-testid="smart-suggestions-widget">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-yellow-600" />
          Smart Suggestions
          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
            {suggestions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.type}-${suggestion.contact.id}-${index}`}
            className={`p-3 rounded-lg border ${getUrgencyStyles(suggestion.urgency)}`}
            data-testid={`suggestion-${suggestion.type}-${suggestion.contact.id}`}
          >
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(suggestion)}
                className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 h-7 w-7 p-0"
                data-testid={`button-dismiss-${suggestion.contact.id}`}
                title="Dismiss"
              >
                <Check className="w-4 h-4" />
              </Button>
              
              <div className="pr-8">
                <div className="flex items-start gap-2 mb-1">
                  <span className="flex-shrink-0 mt-0.5">{getIcon(suggestion.type)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">{suggestion.title}</h4>
                    {suggestion.urgency === 'high' && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0 mt-1">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenReminderDialog(suggestion)}
                    className="bg-pink-600 hover:bg-pink-700 h-7 px-2 text-xs"
                    data-testid={`button-create-reminder-${suggestion.contact.id}`}
                  >
                    <Bell className="w-3 h-3 mr-1" />
                    Remind
                  </Button>
                  {suggestion.suggestions.slice(0, 2).map((action, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-white h-7 px-2 hover:bg-gray-100"
                      onClick={() => handleActionClick(action, suggestion)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Create Reminder Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Reminder</DialogTitle>
            <DialogDescription>
              {selectedSuggestion && (
                <span>Set a reminder for {selectedSuggestion.contact.name}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-title">Title</Label>
              <Input
                id="reminder-title"
                data-testid="input-reminder-title"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                placeholder="Reminder title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-type">Type</Label>
              <Select value={reminderType} onValueChange={setReminderType}>
                <SelectTrigger data-testid="select-reminder-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="gift">Gift</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-date">Date</Label>
                <Input
                  id="reminder-date"
                  data-testid="input-reminder-date"
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Time</Label>
                <Input
                  id="reminder-time"
                  data-testid="input-reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              data-testid="button-cancel-reminder"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReminder}
              disabled={createReminderMutation.isPending || !reminderTitle || !reminderDate}
              data-testid="button-submit-reminder"
              className="bg-pink-600 hover:bg-pink-700"
            >
              {createReminderMutation.isPending ? "Creating..." : "Create Reminder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
