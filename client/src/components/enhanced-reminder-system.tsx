import { useState, useEffect } from "react";
import { Calendar, Clock, Bell, Brain, TrendingUp, AlertTriangle, Check, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatReminderDate } from "@/lib/utils";
import type { Contact, Reminder } from "@shared/schema";

interface SmartReminderConfig {
  enableAI: boolean;
  communicationFrequency: number; // days
  priorityBased: boolean;
  relationshipStageAware: boolean;
  moodTracking: boolean;
  locationBased: boolean;
}

interface EnhancedReminderSystemProps {
  contacts: Contact[];
  reminders: Reminder[];
  onConfigChange?: (config: SmartReminderConfig) => void;
}

export default function EnhancedReminderSystem({ 
  contacts, 
  reminders, 
  onConfigChange 
}: EnhancedReminderSystemProps) {
  const [config, setConfig] = useState<SmartReminderConfig>({
    enableAI: true,
    communicationFrequency: 7,
    priorityBased: true,
    relationshipStageAware: true,
    moodTracking: true,
    locationBased: false
  });

  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    generateSmartSuggestions();
  }, [contacts, config]);

  const generateSmartSuggestions = () => {
    const suggestions = [];
    const now = new Date();

    contacts.forEach(contact => {
      // Analyze communication patterns
      const daysSinceLastContact = contact.lastContactDate 
        ? Math.floor((now.getTime() - new Date(contact.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Birthday reminders with relationship context
      if (contact.birthday) {
        const birthday = new Date(contact.birthday);
        const nextBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
        if (nextBirthday < now) {
          nextBirthday.setFullYear(now.getFullYear() + 1);
        }
        
        const daysUntilBirthday = Math.floor((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilBirthday <= 14 && daysUntilBirthday >= 0) {
          const urgency = contact.relationshipStatus === 'serious' ? 'high' : 
                         contact.relationshipStatus === 'dating' ? 'medium' : 'low';
          
          suggestions.push({
            type: 'birthday',
            contact,
            title: `${contact.name}'s Birthday in ${daysUntilBirthday} days`,
            description: `Plan something special based on their relationship status: ${contact.relationshipStatus}`,
            urgency,
            daysUntilBirthday,
            suggestions: generateBirthdayIdeas(contact)
          });
        }
      }

      // Communication frequency analysis
      if (daysSinceLastContact && daysSinceLastContact >= config.communicationFrequency) {
        const urgency = contact.isPriority ? 'high' : 
                       daysSinceLastContact > 14 ? 'medium' : 'low';
        
        suggestions.push({
          type: 'communication',
          contact,
          title: `Reconnect with ${contact.name}`,
          description: `${daysSinceLastContact} days since last contact`,
          urgency,
          daysSinceLastContact,
          suggestions: generateCommunicationIdeas(contact, daysSinceLastContact)
        });
      }

      // Relationship milestone tracking
      if (contact.relationshipStatus === 'dating') {
        suggestions.push({
          type: 'milestone',
          contact,
          title: `Consider relationship progression with ${contact.name}`,
          description: 'Evaluate where things are heading',
          urgency: 'low',
          suggestions: ['Plan a deeper conversation', 'Introduce to friends', 'Weekend getaway']
        });
      }
    });

    // Sort by urgency and proximity
    suggestions.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });

    setSmartSuggestions(suggestions.slice(0, 8));
  };

  const generateBirthdayIdeas = (contact: Contact): string[] => {
    const baseIdeas = ['Send birthday message', 'Plan birthday celebration'];
    
    if (contact.favoriteFood) {
      baseIdeas.push(`Cook/order ${contact.favoriteFood}`);
    }
    
    if (contact.relationshipStatus === 'serious') {
      baseIdeas.push('Thoughtful personalized gift', 'Surprise party with friends');
    } else if (contact.relationshipStatus === 'casual') {
      baseIdeas.push('Fun activity together', 'Small thoughtful gift');
    }
    
    return baseIdeas;
  };

  const generateCommunicationIdeas = (contact: Contact, daysSince: number): string[] => {
    const ideas = [];
    
    if (daysSince < 7) {
      ideas.push('Quick check-in text', 'Share something funny');
    } else if (daysSince < 14) {
      ideas.push('Plan coffee meetup', 'Video call catch-up');
    } else {
      ideas.push('Thoughtful message about missing them', 'Plan special reunion activity');
    }
    
    if (contact.lastVacationLocation) {
      ideas.push(`Ask about their trip to ${contact.lastVacationLocation}`);
    }
    
    return ideas;
  };

  const updateConfig = (updates: Partial<SmartReminderConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const createReminderFromSuggestion = async (suggestion: any) => {
    try {
      // Create reminder based on suggestion
      const reminderData = {
        contactId: suggestion.contact.id,
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      };

      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reminderData)
      });

      if (!response.ok) throw new Error('Failed to create reminder');

      toast({
        title: "Smart Reminder Created",
        description: `Added reminder for ${suggestion.contact.name}`
      });

      // Remove from suggestions
      setSmartSuggestions(prev => prev.filter(s => s !== suggestion));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive"
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Smart Configuration */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Smart Reminder System
          </CardTitle>
          <CardDescription>
            AI-powered insights to optimize your relationship management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enable AI Suggestions</Label>
              <p className="text-sm text-gray-600">Get intelligent reminders based on patterns</p>
            </div>
            <Switch
              checked={config.enableAI}
              onCheckedChange={(checked) => updateConfig({ enableAI: checked })}
            />
          </div>

          {/* Communication Frequency */}
          <div className="space-y-2">
            <Label className="font-medium">
              Communication Frequency: {config.communicationFrequency} days
            </Label>
            <Slider
              value={[config.communicationFrequency]}
              onValueChange={([value]) => updateConfig({ communicationFrequency: value })}
              min={1}
              max={30}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-600">
              Get reminders if no contact for this many days
            </p>
          </div>

          {/* Advanced Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.priorityBased}
                onCheckedChange={(checked) => updateConfig({ priorityBased: checked })}
              />
              <Label className="text-sm">Priority-based alerts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.relationshipStageAware}
                onCheckedChange={(checked) => updateConfig({ relationshipStageAware: checked })}
              />
              <Label className="text-sm">Stage-aware suggestions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.moodTracking}
                onCheckedChange={(checked) => updateConfig({ moodTracking: checked })}
              />
              <Label className="text-sm">Mood-based timing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.locationBased}
                onCheckedChange={(checked) => updateConfig({ locationBased: checked })}
              />
              <Label className="text-sm">Location reminders</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      {config.enableAI && smartSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Smart Suggestions ({smartSuggestions.length})
            </CardTitle>
            <CardDescription>
              AI-generated insights to strengthen your relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smartSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getUrgencyColor(suggestion.urgency)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getUrgencyIcon(suggestion.urgency)}
                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.urgency} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                      
                      {/* Action Suggestions */}
                      {suggestion.suggestions && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-600">Suggested actions:</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.suggestions.slice(0, 3).map((action: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => createReminderFromSuggestion(suggestion)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Bell className="w-3 h-3 mr-1" />
                        Set Reminder
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSmartSuggestions(prev => prev.filter(s => s !== suggestion))}
                        className="text-gray-500"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Overview */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Relationship Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{contacts.length}</div>
              <div className="text-sm text-gray-600">Total Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {contacts.filter(c => c.isPriority).length}
              </div>
              <div className="text-sm text-gray-600">Priority Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reminders.filter(r => !r.isCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Active Reminders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {smartSuggestions.filter(s => s.urgency === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority Items</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}