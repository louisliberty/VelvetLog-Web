import { Mail, Phone, Calendar, Star, MoreHorizontal, Heart, Cake, MessageCircle, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  formatLastContact, 
  getStatusColor, 
  getStatusDotColor,
  formatRelationshipStatus,
  getCountryFlagFromPhone,
  formatPhoneNumber
} from "@/lib/utils";
import type { Contact } from "@shared/schema";

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
  onQuickLog?: () => void;
  onViewSummary?: () => void;
  onDelete?: () => void;
}

export default function ContactCard({ contact, onClick, onQuickLog, onViewSummary, onDelete }: ContactCardProps) {
  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all cursor-pointer ${
        contact.relationshipStatus === 'ended' 
          ? 'bg-gray-100 border-gray-200 hover:border-gray-300' 
          : 'bg-white border-pink-100 hover:border-pink-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 ring-2 ring-pink-100">
            <AvatarImage 
              src={contact.photoUrl && localStorage.getItem('velvetlog_token') 
                ? `${contact.photoUrl}?token=${localStorage.getItem('velvetlog_token')}` 
                : contact.photoUrl || undefined} 
              alt={contact.name} 
            />
            <AvatarFallback className="bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">
              {contact.name}
              {contact.age && (
                <span className="text-sm text-gray-600 font-normal ml-2">{contact.age}</span>
              )}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-full ${getStatusDotColor(contact.relationshipStatus || "dating")}`}></div>
          {contact.isPriority && (
            <Heart className="w-4 h-4 text-pink-400 fill-current" />
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {contact.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" className="mr-2 flex-shrink-0">
              <path fill="#4F46E5" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span className="truncate">{formatPhoneNumber(contact.phone)}</span>
            {getCountryFlagFromPhone(contact.phone) && (
              <span className="ml-1">{getCountryFlagFromPhone(contact.phone)}</span>
            )}
          </div>
        )}
        {contact.location && (
          <div className="flex items-center text-sm text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" className="mr-2 flex-shrink-0">
              <path fill="#4F46E5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="truncate">{contact.location}</span>
          </div>
        )}
        {contact.birthday && (
          <div className="flex items-center text-sm text-gray-600">
            <Cake className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{new Date(contact.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Last contact: {formatLastContact(contact.lastContactDate)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(contact.relationshipStatus || "dating")}>
            {formatRelationshipStatus(contact.relationshipStatus || "dating")}
          </Badge>
          {contact.isPriority && (
            <Badge variant="outline" className="text-xs border-pink-200 text-pink-600">
              Priority
            </Badge>
          )}
          {contact.tags && contact.tags.length > 0 && (
            <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
              +{contact.tags.length} tag{contact.tags.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {onViewSummary && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-blue-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewSummary();
              }}
              title="View activity summary"
            >
              <Clock className="w-4 h-4" />
            </Button>
          )}
          {onQuickLog && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-green-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                onQuickLog();
              }}
              title="Quick log interaction"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-pink-600 p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(); // Open contact details
                }}
                className="cursor-pointer"
              >
                View Details
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Contact
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
