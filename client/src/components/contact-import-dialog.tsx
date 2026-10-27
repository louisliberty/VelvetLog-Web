import { useState, useRef } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  Smartphone, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContactImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  birthday?: string;
  notes?: string;
  location?: string;
  job?: string;
  photoBase64?: string;
  photoType?: string;
  selected: boolean;
}

interface WebContact {
  name?: string[];
  tel?: string[];
  email?: string[];
  address?: any[];
  icon?: Blob[];
}

export default function ContactImportDialog({ isOpen, onClose }: ContactImportDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importType, setImportType] = useState<'picker' | 'file'>('picker');
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [supportsPicker, setSupportsPicker] = useState(false);

  // Check Contact Picker API support
  React.useEffect(() => {
    const checkSupport = () => {
      const hasContacts = 'contacts' in navigator;
      const hasContactsManager = 'ContactsManager' in window;
      setSupportsPicker(hasContacts && hasContactsManager);
    };
    
    checkSupport();
  }, []);

  const addContactMutation = useMutation({
    mutationFn: (contactData: any) => 
      apiRequest("POST", `/api/contacts`, contactData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
  });

  const handleContactPicker = async () => {
    if (!supportsPicker) {
      toast({
        title: "Not Supported",
        description: "Contact Picker API is not supported on this browser. Try using Chrome on Android or import a vCard file instead.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Check available properties
      const properties = await (navigator as any).contacts.getProperties();
      console.log("Available contact properties:", properties);

      // Select contacts with all available properties
      const requestProps = ['name', 'email', 'tel'].filter(prop => properties.includes(prop));
      
      const contacts: WebContact[] = await (navigator as any).contacts.select(requestProps, { 
        multiple: true 
      });

      // Parse contacts into our format
      const parsed: ParsedContact[] = contacts.map((contact, index) => ({
        id: `picker_${index}`,
        name: contact.name?.[0] || 'Unknown Contact',
        phone: contact.tel?.[0],
        email: contact.email?.[0],
        selected: true,
      }));

      setParsedContacts(parsed);
      setImportType('picker');
      
      toast({
        title: "Contacts Selected",
        description: `${parsed.length} contacts ready to import`,
      });
      
    } catch (error: any) {
      console.error("Contact picker error:", error);
      toast({
        title: "Import Failed",
        description: error.name === 'NotAllowedError' 
          ? "Contact access was denied. Please try again and allow access to your contacts."
          : "Failed to access contacts. Please try importing a vCard file instead.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseVCardFile = (content: string): ParsedContact[] => {
    const contacts: ParsedContact[] = [];
    const vcardBlocks = content.split('BEGIN:VCARD');
    
    vcardBlocks.forEach((block, index) => {
      if (index === 0 && !block.includes('VERSION:')) return; // Skip empty first block
      
      // First, unfold continuation lines (lines starting with space or tab are continuations)
      const unfoldedBlock = block.replace(/\r?\n[ \t]/g, '');
      const lines = unfoldedBlock.split(/\r?\n/).filter(line => line.trim());
      
      const contact: ParsedContact = {
        id: `file_${index}`,
        name: '',
        selected: true,
      };

      lines.forEach(line => {
        const [property, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        
        if (property.startsWith('FN')) {
          contact.name = value;
        } else if (property.startsWith('N') && !property.startsWith('NOTE')) {
          // N:Last;First;Middle;Prefix;Suffix
          const nameParts = value.split(';');
          if (!contact.name && nameParts.length >= 2) {
            contact.name = `${nameParts[1]} ${nameParts[0]}`.trim();
          }
        } else if (property.startsWith('TEL')) {
          // Clean phone number and add US country code if needed
          let phone = value.replace(/[\s\-\(\)\.]/g, '');
          // If it's a 10-digit number without country code, assume US (+1)
          if (/^\d{10}$/.test(phone)) {
            phone = '+1' + phone;
          } else if (/^1\d{10}$/.test(phone)) {
            // Has 1 prefix but no +, add +
            phone = '+' + phone;
          } else if (!phone.startsWith('+') && phone.length > 0) {
            // For other numbers without +, try to preserve as-is with +
            phone = '+' + phone;
          }
          contact.phone = phone;
        } else if (property.startsWith('EMAIL')) {
          contact.email = value;
        } else if (property.startsWith('BDAY')) {
          // BDAY:1985-10-15 or BDAY:19851015
          contact.birthday = value;
        } else if (property.startsWith('NOTE')) {
          contact.notes = value;
        } else if (property.startsWith('ADR')) {
          // ADR:;;123 Main St;City;State;12345;Country
          const addressParts = value.split(';');
          if (addressParts.length >= 4) {
            const city = addressParts[3];
            const state = addressParts[4];
            const country = addressParts[6];
            contact.location = [city, state, country].filter(Boolean).join(', ');
          }
        } else if (property.startsWith('TITLE') || property.startsWith('ORG')) {
          contact.job = value;
        } else if (property.startsWith('PHOTO')) {
          // Parse PHOTO property - can be base64 or URL
          // Formats: PHOTO;ENCODING=BASE64;TYPE=JPEG:data or PHOTO;ENCODING=b;TYPE=image/jpeg:data
          const propLower = property.toLowerCase();
          
          // Check if it's a URL (no encoding specified or explicit VALUE=URI)
          if (propLower.includes('value=uri') || (!propLower.includes('encoding') && value.startsWith('http'))) {
            // URL-based photo - we could fetch it but skip for now
            return;
          }
          
          // Extract image type from property
          let photoType = 'jpeg'; // default
          const typeMatch = property.match(/TYPE=([^;:]+)/i);
          if (typeMatch) {
            photoType = typeMatch[1].toLowerCase().replace('image/', '');
          }
          
          // Check if it's base64 encoded
          if (propLower.includes('encoding=base64') || propLower.includes('encoding=b')) {
            // The value is base64 data
            const base64Data = value.replace(/\s/g, ''); // Remove any whitespace
            if (base64Data.length > 100) { // Minimum viable image size
              contact.photoBase64 = base64Data;
              contact.photoType = photoType;
            }
          }
        }
      });

      if (contact.name) {
        contacts.push(contact);
      }
    });

    return contacts;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.vcf')) {
      toast({
        title: "Invalid File",
        description: "Please select a vCard (.vcf) file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = parseVCardFile(content);
        
        setParsedContacts(parsed);
        setImportType('file');
        
        toast({
          title: "File Parsed",
          description: `${parsed.length} contacts found in file`,
        });
        
      } catch (error) {
        console.error("vCard parsing error:", error);
        toast({
          title: "Parse Error",
          description: "Failed to parse vCard file. Please check the file format.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const toggleContactSelection = (id: string) => {
    setParsedContacts(prev => 
      prev.map(contact => 
        contact.id === id 
          ? { ...contact, selected: !contact.selected }
          : contact
      )
    );
  };

  const selectAll = () => {
    setParsedContacts(prev => prev.map(contact => ({ ...contact, selected: true })));
  };

  const deselectAll = () => {
    setParsedContacts(prev => prev.map(contact => ({ ...contact, selected: false })));
  };

  const uploadPhotoFromBase64 = async (base64Data: string, imageType: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/upload-base64-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          base64Data,
          imageType,
        }),
      });

      if (!response.ok) {
        console.error('Failed to upload photo:', response.statusText);
        return null;
      }

      const result = await response.json();
      return result.objectPath || null;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleImportSelected = async () => {
    const selectedContacts = parsedContacts.filter(contact => contact.selected);
    
    if (selectedContacts.length === 0) {
      toast({
        title: "No Contacts Selected",
        description: "Please select at least one contact to import",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Import contacts one by one
      const results = await Promise.allSettled(
        selectedContacts.map(async (contact) => {
          // Upload photo if present
          let photoUrl: string | null = null;
          if (contact.photoBase64 && contact.photoType) {
            photoUrl = await uploadPhotoFromBase64(contact.photoBase64, contact.photoType);
          }

          const contactData = {
            name: contact.name,
            phone: contact.phone || null,
            email: contact.email || null,
            birthday: contact.birthday ? new Date(contact.birthday).toISOString() : null,
            notes: contact.notes || null,
            location: contact.location || null,
            job: contact.job || null,
            relationshipStatus: 'dating',
            isPriority: false,
            photoUrl,
          };

          return await addContactMutation.mutateAsync(contactData);
        })
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successful} contact${successful !== 1 ? 's' : ''}${failed > 0 ? `. ${failed} failed to import.` : ''}`,
        });
      }

      if (failed > 0 && successful === 0) {
        toast({
          title: "Import Failed",
          description: "Failed to import any contacts. Please try again.",
          variant: "destructive"
        });
      }

      // Close dialog and reset state on success
      if (successful > 0) {
        onClose();
        setParsedContacts([]);
      }

    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Error",
        description: "An error occurred during import. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setParsedContacts([]);
    setImportType('picker');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-pink-600" />
            <span>Import Contacts</span>
          </DialogTitle>
          <DialogDescription>
            Import contacts from your phone or vCard file. All imported contacts will be added to your VelvetLog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {parsedContacts.length === 0 ? (
            <Tabs defaultValue="picker" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="picker" className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Phone Contacts</span>
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>vCard File</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="picker" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      <span>Import from Phone</span>
                    </CardTitle>
                    <CardDescription>
                      Select contacts directly from your phone's address book. Works on Android Chrome.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!supportsPicker && (
                      <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-800">
                          Use Chrome on <strong>Android</strong> or import a vCard file. Contact Picker not supported on this browser.
                        </span>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleContactPicker} 
                      disabled={!supportsPicker || isProcessing}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      {isProcessing ? "Accessing Contacts..." : "Select Contacts from Phone"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-green-600" />
                      <span>Import vCard File</span>
                    </CardTitle>
                    <CardDescription>
                      Upload a .vcf file containing your contacts. Compatible with iPhone and Android exports.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-6 text-sm">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" />
                          📱 iPhone Export (Detailed Steps):
                        </h4>
                        <ol className="list-decimal list-inside space-y-2 text-blue-800">
                          <li><strong>Open Contacts app</strong> (green icon with silhouette)</li>
                          <li><strong>Tap "Lists"</strong> in top-left corner, then tap "All Contacts"</li>
                          <li><strong>Tap "Select"</strong> in top-right corner</li>
                          <li><strong>Choose contacts</strong> by tapping each person you want to import</li>
                          <li><strong>Tap "Share"</strong> button (square with up arrow) at bottom</li>
                          <li><strong>Choose "Mail"</strong> or "Files" or "AirDrop"</li>
                          <li><strong>Email to yourself</strong> or save to Files, then download on computer</li>
                          <li><strong>Look for .vcf file</strong> in your email/downloads</li>
                        </ol>
                        <p className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                          💡 <strong>Tip:</strong> If you don't see "Share" option, try selecting fewer contacts at once (max 20-30).
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-3 flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" />
                          🤖 Android Export (Detailed Steps):
                        </h4>
                        <ol className="list-decimal list-inside space-y-2 text-green-800">
                          <li><strong>Open Contacts app</strong> (usually called "Contacts" or "People")</li>
                          <li><strong>Tap the ⋮ menu</strong> (three dots) in top-right corner</li>
                          <li><strong>Look for "Import/Export"</strong>, "Manage contacts", or "Settings"</li>
                          <li><strong>Tap "Export"</strong> or "Export contacts"</li>
                          <li><strong>Choose "Export to .vcf file"</strong> (vCard format)</li>
                          <li><strong>Select "All contacts"</strong> or choose specific ones</li>
                          <li><strong>Choose save location</strong> (Downloads folder recommended)</li>
                          <li><strong>Tap "Export"</strong> - you'll get a confirmation message</li>
                        </ol>
                        <p className="mt-3 text-xs text-green-600 bg-green-100 p-2 rounded">
                          💡 <strong>Tip:</strong> Different Android phones have slightly different menus, but look for "Export" or "Backup" options.
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">🔍 Can't find the export option?</h4>
                        <ul className="text-gray-700 space-y-1 text-xs">
                          <li>• Try looking in <strong>Settings</strong> within your contacts app</li>
                          <li>• Search for <strong>"Backup"</strong> or <strong>"Sync"</strong> options</li>
                          <li>• On Samsung: Settings → Import/Export contacts</li>
                          <li>• On Google Pixel: Menu → Settings → Export</li>
                          <li>• Alternative: Use your computer to export from Google Contacts or iCloud</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="vcf-upload" className="cursor-pointer">
                          <span className="text-lg font-medium text-gray-900">
                            Click to upload vCard file
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Supports .vcf files from iPhone and Android
                          </p>
                        </Label>
                        <Input
                          ref={fileInputRef}
                          id="vcf-upload"
                          type="file"
                          accept=".vcf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">
                    {parsedContacts.length} contacts found
                  </span>
                  <Badge variant="outline">
                    {parsedContacts.filter(c => c.selected).length} selected
                  </Badge>
                  {parsedContacts.filter(c => c.photoBase64).length > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {parsedContacts.filter(c => c.photoBase64).length} with photos
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Deselect All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetImport}>
                    Start Over
                  </Button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 border rounded-lg p-4">
                {parsedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                      contact.selected 
                        ? 'border-pink-200 bg-pink-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Checkbox
                      checked={contact.selected}
                      onCheckedChange={() => toggleContactSelection(contact.id)}
                    />
                    
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        {contact.photoBase64 && (
                          <AvatarImage 
                            src={`data:image/${contact.photoType || 'jpeg'};base64,${contact.photoBase64}`} 
                            alt={contact.name}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {contact.photoBase64 && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                          <ImageIcon className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {contact.name}
                      </h4>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                        {contact.phone && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {contact.phone}
                          </span>
                        )}
                        {contact.email && (
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {contact.email}
                          </span>
                        )}
                        {contact.birthday && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Birthday
                          </span>
                        )}
                        {contact.location && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {contact.location}
                          </span>
                        )}
                        {contact.job && (
                          <span className="flex items-center">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {contact.job}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {parsedContacts.length > 0 ? (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImportSelected}
                disabled={isProcessing || parsedContacts.filter(c => c.selected).length === 0}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {isProcessing ? "Importing..." : `Import ${parsedContacts.filter(c => c.selected).length} Contacts`}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}