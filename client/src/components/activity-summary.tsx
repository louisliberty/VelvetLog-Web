import { useState, useEffect } from "react";
import { Calendar, Clock, MessageCircle, Phone, Heart, Gift, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatLastContact, formatReminderDate } from "@/lib/utils";
import type { Contact, TimelineEntry, Reminder } from "@shared/schema";

interface ActivitySummaryProps {
  contact: Contact;
  recentEntries: TimelineEntry[];
  upcomingReminders: Reminder[];
  onClose: () => void;
  onProceed: () => void;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "call": return <Phone className="w-4 h-4" />;
    case "text": return <MessageCircle className="w-4 h-4" />;
    case "date": return <Heart className="w-4 h-4" />;
    case "meeting": return <Users className="w-4 h-4" />;
    case "gift": return <Gift className="w-4 h-4" />;
    default: return <Calendar className="w-4 h-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "call": return "text-blue-600 bg-blue-50";
    case "text": return "text-green-600 bg-green-50";
    case "date": return "text-pink-600 bg-pink-50";
    case "meeting": return "text-purple-600 bg-purple-50";
    case "gift": return "text-yellow-600 bg-yellow-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

export default function ActivitySummary({
  contact,
  recentEntries,
  upcomingReminders,
  onClose,
  onProceed
}: ActivitySummaryProps) {
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const lastInteraction = recentEntries[0];
  const daysSinceLastContact = contact.lastContactDate 
    ? Math.floor((new Date().getTime() - new Date(contact.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-t-lg">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 ring-2 ring-pink-200">
              <AvatarImage 
                src={contact.photoUrl && localStorage.getItem('velvetlog_token') 
                  ? `${contact.photoUrl}?token=${localStorage.getItem('velvetlog_token')}` 
                  : contact.photoUrl || undefined} 
                alt={contact.name} 
              />
              <AvatarFallback className="bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl text-gray-900">{contact.name}</CardTitle>
              <CardDescription className="text-base">
                Activity Summary & Interaction Prep
              </CardDescription>
              {daysSinceLastContact !== null && (
                <Badge 
                  variant={daysSinceLastContact > 7 ? "destructive" : daysSinceLastContact > 3 ? "secondary" : "default"}
                  className="mt-2"
                >
                  {daysSinceLastContact === 0 ? "Last contact today" : 
                   daysSinceLastContact === 1 ? "Last contact yesterday" :
                   `${daysSinceLastContact} days since last contact`}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Personal Details Quick Reference */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-600" />
              Quick Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {contact.age && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Age:</span>
                  <span className="font-medium">{contact.age}</span>
                </div>
              )}
              {contact.birthday && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Birthday:</span>
                  <span className="font-medium">
                    {new Date(contact.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </span>
                </div>
              )}
              {contact.favoriteFood && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Favorite Food:</span>
                  <span className="font-medium">{contact.favoriteFood}</span>
                </div>
              )}
              {contact.lastVacationLocation && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Last Vacation:</span>
                  <span className="font-medium">{contact.lastVacationLocation}</span>
                </div>
              )}
              {contact.siblingsNames && contact.siblingsNames.length > 0 && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <span className="text-gray-500">Siblings:</span>
                  <span className="font-medium">{contact.siblingsNames.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Recent Activity
            </h3>
            {recentEntries.length > 0 ? (
              <div className="space-y-3">
                {recentEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${getActivityColor(entry.type)}`}>
                      {getActivityIcon(entry.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{entry.title}</p>
                      {entry.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatLastContact(entry.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No recent activity recorded</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Upcoming Reminders */}
          {upcomingReminders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-600" />
                Upcoming Reminders
              </h3>
              <div className="space-y-2">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">{reminder.title}</p>
                      <p className="text-sm text-gray-600">
                        {formatReminderDate(reminder.dueDate)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                      {reminder.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contact.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  Important Notes
                </h3>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              Review time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close Summary
              </Button>
              <Button 
                onClick={onProceed}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Ready to Interact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}