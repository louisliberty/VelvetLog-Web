import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, MapPin, Clock, ChevronLeft, ChevronRight, Plus, Heart, Users, Coffee, Loader2, History } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, getDay, isSameDay } from "date-fns";
import type { Reminder, Contact } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function CalendarPage() {
  const { isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    document.title = "Calendar | VelvetLog";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("date");
  const [eventDescription, setEventDescription] = useState("");

  // Fetch reminders from API
  const { data: reminders = [], isLoading: remindersLoading } = useQuery<(Reminder & { contactName?: string })[]>({
    queryKey: ["/api/reminders"],
    queryFn: async () => {
      const token = localStorage.getItem('velvetlog_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch("/api/reminders", {
        headers,
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch contacts for avatar display
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const token = localStorage.getItem('velvetlog_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch("/api/contacts", {
        headers,
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Get current date at start of day for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Transform reminders into meetings format for display
  // Show future reminders sorted by date (upcoming)
  const upcomingReminders = reminders
    .filter(r => !r.isCompleted && new Date(r.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 10); // Show up to 10 upcoming reminders

  // Show past reminders (completed or past due date)
  const pastReminders = reminders
    .filter(r => r.isCompleted || new Date(r.dueDate) < today)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 10); // Show up to 10 past reminders

  // Get contact info for a reminder
  const getContactForReminder = (reminder: Reminder & { contactName?: string }) => {
    if (reminder.contactName) {
      const contact = contacts.find(c => c.id === reminder.contactId);
      return {
        name: reminder.contactName,
        avatar: contact?.photoUrl || null
      };
    }
    const contact = contacts.find(c => c.id === reminder.contactId);
    return {
      name: contact?.name || "Unknown",
      avatar: contact?.photoUrl || null
    };
  };
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add empty cells for days before the month starts
  const startDay = getDay(monthStart);
  const emptyCells = Array.from({ length: startDay }, (_, i) => i);
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const handleAddEvent = () => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
    setShowEventDialog(true);
  };

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) return;
    
    // Here you would normally save to your database
    console.log('Saving event:', {
      title: eventTitle,
      date: selectedDate,
      time: eventTime,
      location: eventLocation,
      type: eventType,
      description: eventDescription
    });

    // Reset form
    setEventTitle("");
    setEventTime("");
    setEventLocation("");
    setEventType("date");
    setEventDescription("");
    setShowEventDialog(false);
  };

  const eventTypes = [
    { value: "date", label: "Date", icon: Heart },
    { value: "meeting", label: "Meeting", icon: Users },
    { value: "coffee", label: "Coffee", icon: Coffee },
    { value: "dinner", label: "Dinner", icon: MapPin },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                VelvetLog
              </h1>
            </a>
            <nav className="hidden md:flex items-center space-x-6">
              <a 
                href="/" 
                className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
              >
                Home
              </a>
              {!isAuthenticated && (
                <>
                  <a 
                    href="/about" 
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    About
                  </a>
                  <a 
                    href="/solutions" 
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    Solutions
                  </a>
                  <a 
                    href="/pricing" 
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    Pricing
                  </a>
                  <a 
                    href="/faq" 
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    FAQ
                  </a>
                  <a 
                    href="/contact" 
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    Contact
                  </a>
                </>
              )}
              <a 
                href="/calendar" 
                className="text-pink-600 font-medium border-b-2 border-pink-600"
              >
                Calendar
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your upcoming dates and meetings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Meetings - shows second on mobile, first on desktop */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pink-500" />
                  Upcoming Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {remindersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                  </div>
                ) : upcomingReminders.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No reminders scheduled</p>
                ) : (
                  upcomingReminders.map((reminder) => {
                    const contact = getContactForReminder(reminder);
                    const token = localStorage.getItem('velvetlog_token');
                    const avatarUrl = contact.avatar 
                      ? `${contact.avatar}${contact.avatar.includes('?') ? '&' : '?'}token=${token}`
                      : null;
                    
                    return (
                      <div key={reminder.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" data-testid={`reminder-card-${reminder.id}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {reminder.title}
                          </h3>
                          <p className="text-sm text-pink-600 dark:text-pink-400">
                            {contact.name}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(reminder.dueDate), "MMMM do, yyyy 'at' h:mm a")}
                          </div>
                          {reminder.description && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                              <MapPin className="h-3 w-3" />
                              {reminder.description}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge 
                              variant="secondary" 
                              className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                            >
                              {reminder.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Past Reminders */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0 mt-6">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-gray-400" />
                  Past Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {remindersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                  </div>
                ) : pastReminders.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No past reminders</p>
                ) : (
                  pastReminders.map((reminder) => {
                    const contact = getContactForReminder(reminder);
                    const token = localStorage.getItem('velvetlog_token');
                    const avatarUrl = contact.avatar 
                      ? `${contact.avatar}${contact.avatar.includes('?') ? '&' : '?'}token=${token}`
                      : null;
                    
                    return (
                      <div key={reminder.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors opacity-70" data-testid={`past-reminder-card-${reminder.id}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            {reminder.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.name}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(reminder.dueDate), "MMMM do, yyyy 'at' h:mm a")}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge 
                              variant="secondary" 
                              className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            >
                              {reminder.type}
                            </Badge>
                            {reminder.isCompleted && (
                              <Badge 
                                variant="secondary" 
                                className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              >
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calendar - shows first on mobile, second on desktop */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 dark:text-white">
                    {format(currentDate, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="hover:bg-pink-100 dark:hover:bg-pink-900/30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="hover:bg-pink-100 dark:hover:bg-pink-900/30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {/* Day headers */}
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days before month starts */}
                  {emptyCells.map((_, index) => (
                    <div key={`empty-${index}`} className="p-2 h-10" />
                  ))}
                  
                  {/* Calendar days */}
                  {daysInMonth.map((day) => {
                    const dayNumber = format(day, 'd');
                    const isCurrentDay = isToday(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    
                    // Check if there are any reminders on this day
                    const hasReminders = reminders.some(r => 
                      !r.isCompleted && isSameDay(new Date(r.dueDate), day)
                    );
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        className={`
                          p-2 h-10 text-sm rounded-lg transition-colors relative hover:scale-105
                          ${isCurrentDay 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold' 
                            : isSelected
                              ? 'bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-purple-100 ring-2 ring-purple-400'
                            : isCurrentMonth 
                              ? 'text-gray-900 dark:text-white hover:bg-pink-100 dark:hover:bg-pink-900/30' 
                              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        {dayNumber}
                        {/* Reminder indicator */}
                        {hasReminders && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Selected Date Display */}
                {selectedDate && (() => {
                  const dayReminders = reminders.filter(r => 
                    !r.isCompleted && isSameDay(new Date(r.dueDate), selectedDate)
                  );
                  
                  return (
                    <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </h3>
                      {dayReminders.length > 0 ? (
                        <div className="space-y-2 mb-3">
                          {dayReminders.map(reminder => {
                            const contact = getContactForReminder(reminder);
                            return (
                              <div key={reminder.id} className="text-sm bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                <span className="font-medium text-gray-900 dark:text-white">{reminder.title}</span>
                                <span className="text-pink-600 dark:text-pink-400 ml-2">({contact.name})</span>
                                <span className="text-gray-500 ml-2">
                                  {format(new Date(reminder.dueDate), 'h:mm a')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          No reminders scheduled for this day
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDate(null)}
                        >
                          Clear Selection
                        </Button>
                      </div>
                    </div>
                  );
                })()}

                {/* Add Event Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3"
                  size="lg"
                  onClick={handleAddEvent}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {selectedDate ? 'Add Event to Selected Date' : 'Add Event'}
                </Button>

                {/* Event Creation Dialog */}
                <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white">
                        Add New Event
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {selectedDate && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 bg-pink-50 dark:bg-pink-900/20 p-2 rounded">
                          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input
                          id="title"
                          placeholder="Dinner with..."
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Select value={eventType} onValueChange={setEventType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {eventTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="Restaurant name or address"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Notes (Optional)</Label>
                        <Textarea
                          id="description"
                          placeholder="Any additional details..."
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowEventDialog(false);
                            setEventTitle("");
                            setEventTime("");
                            setEventLocation("");
                            setEventType("date");
                            setEventDescription("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveEvent}
                          disabled={!eventTitle.trim()}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                        >
                          Save Event
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}