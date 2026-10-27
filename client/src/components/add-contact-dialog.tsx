import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type InsertContact, type Contact } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { SmartPhoneInput } from "./smart-phone-input";
import { ObjectUploader } from "./ObjectUploader";
import { Camera, Lock } from "lucide-react";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingContact?: Contact | null;
}

export default function AddContactDialog({
  open,
  onOpenChange,
  editingContact,
}: AddContactDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [birthdayMonth, setBirthdayMonth] = useState("");
  const [birthdayDay, setBirthdayDay] = useState("");
  const [birthdayYear, setBirthdayYear] = useState("");
  const [anniversaryMonth, setAnniversaryMonth] = useState("");
  const [anniversaryDay, setAnniversaryDay] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const hasActiveSubscription = user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing';

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema.extend({
      name: z.string().min(1, "Name is required"),
    })),
    defaultValues: editingContact ? {
      name: editingContact.name,
      age: editingContact.age || undefined,
      birthday: editingContact.birthday ? new Date(editingContact.birthday).toISOString().split('T')[0] : undefined,
      email: editingContact.email || "",
      phone: editingContact.phone || "",
      location: editingContact.location || "",
      relationshipStatus: editingContact.relationshipStatus,
      datingStatus: editingContact.datingStatus,
      priority: editingContact.priority,
      isPriority: editingContact.isPriority,
      notes: editingContact.notes || "",
    } : {
      name: "",
      relationshipStatus: "dating",
      datingStatus: "active",
      priority: "normal",
      isPriority: false,
    },
  });

  // Update birthday field when month/day/year changes
  useEffect(() => {
    if (birthdayMonth && birthdayDay) {
      const year = (birthdayYear && birthdayYear !== "none") ? birthdayYear : new Date().getFullYear();
      const dateStr = `${year}-${birthdayMonth}-${birthdayDay}`;
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        form.setValue('birthday', date.toISOString());
      }
    } else {
      form.setValue('birthday', undefined);
    }
  }, [birthdayMonth, birthdayDay, birthdayYear, form]);

  // Reset form when dialog opens or editing contact changes
  useEffect(() => {
    if (!open) return; // Only reset when dialog is open
    
    if (editingContact) {
      form.reset({
        name: editingContact.name,
        age: editingContact.age || undefined,
        email: editingContact.email || "",
        phone: editingContact.phone || "",
        location: editingContact.location || "",
        job: editingContact.job || "",
        instagram: editingContact.instagram || "",
        whereYouMet: editingContact.whereYouMet || "",
        relationshipStatus: editingContact.relationshipStatus,
        isPriority: editingContact.isPriority,
        notes: editingContact.notes || "",
      });
      
      // Parse birthday into separate fields
      if (editingContact.birthday) {
        const birthDate = new Date(editingContact.birthday);
        setBirthdayMonth((birthDate.getMonth() + 1).toString().padStart(2, '0'));
        setBirthdayDay(birthDate.getDate().toString().padStart(2, '0'));
        
        // If year is 1900, treat it as "N/A" (placeholder for partial birthday)
        const year = birthDate.getFullYear();
        setBirthdayYear(year === 1900 ? "none" : year.toString());
      } else {
        setBirthdayMonth("");
        setBirthdayDay("");
        setBirthdayYear("none");
      }

      // Parse anniversary date into separate fields
      if (editingContact.anniversaryDate) {
        const anniversaryDate = new Date(editingContact.anniversaryDate);
        setAnniversaryMonth((anniversaryDate.getMonth() + 1).toString().padStart(2, '0'));
        setAnniversaryDay(anniversaryDate.getDate().toString().padStart(2, '0'));
      } else {
        setAnniversaryMonth("");
        setAnniversaryDay("");
      }
      
      // Set photo URL from existing contact
      setPhotoUrl(editingContact.photoUrl || null);
    } else {
      form.reset({
        name: "",
        age: undefined,
        email: "",
        phone: "",
        location: "",
        job: "",
        instagram: "",
        whereYouMet: "",
        relationshipStatus: "dating",
        isPriority: false,
        notes: "",
      });
      setTags([]);
      setBirthdayMonth("");
      setBirthdayDay("");
      setBirthdayYear("none");
      setAnniversaryMonth("");
      setAnniversaryDay("");
      setPhotoUrl(null);
    }
  }, [open, editingContact, form]);

  const saveContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = editingContact 
        ? await apiRequest("PUT", `/api/contacts/${editingContact.id}`, data)
        : await apiRequest("POST", "/api/contacts", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${response.status}: ${JSON.stringify(errorData)}`);
      }
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: editingContact ? "Connection updated" : "Connection created",
        description: editingContact 
          ? "The connection has been updated successfully."
          : "The connection has been added successfully.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    const cleanedData: any = {
      name: data.name,
      relationshipStatus: data.relationshipStatus || "dating",
      isPriority: data.isPriority || false,
    };
    
    if (data.age && data.age !== '' && !isNaN(Number(data.age))) {
      cleanedData.age = Number(data.age);
    }
    
    // Handle birthday from the three separate dropdowns
    if (birthdayMonth && birthdayDay) {
      const month = parseInt(birthdayMonth) - 1; // JS months are 0-indexed
      const day = parseInt(birthdayDay);
      
      if (birthdayYear !== "none" && birthdayYear) {
        // Full birthday with year
        const year = parseInt(birthdayYear);
        const dateValue = new Date(year, month, day);
        if (!isNaN(dateValue.getTime())) {
          cleanedData.birthday = dateValue.toISOString();
        }
      } else {
        // Partial birthday without year - use placeholder year 1900
        const dateValue = new Date(1900, month, day);
        if (!isNaN(dateValue.getTime())) {
          cleanedData.birthday = dateValue.toISOString();
        }
      }
    } else {
      // No birthday information provided
      cleanedData.birthday = null;
    }

    // Handle anniversary date from the two separate dropdowns (month/day only)
    if (anniversaryMonth && anniversaryDay) {
      const month = parseInt(anniversaryMonth) - 1; // JS months are 0-indexed
      const day = parseInt(anniversaryDay);
      // Use a placeholder year (2000) for anniversary dates since we only track month/day
      const dateValue = new Date(2000, month, day);
      if (!isNaN(dateValue.getTime())) {
        cleanedData.anniversaryDate = dateValue.toISOString();
      }
    } else {
      cleanedData.anniversaryDate = null;
    }
    
    if (data.email && data.email !== '') {
      cleanedData.email = data.email;
    }
    
    if (data.phone && data.phone !== '') {
      cleanedData.phone = data.phone;
    }
    
    if (data.location && data.location !== '') {
      cleanedData.location = data.location;
    }
    
    if (data.job && data.job !== '') {
      cleanedData.job = data.job;
    }
    
    if (data.instagram && data.instagram !== '') {
      cleanedData.instagram = data.instagram;
    }
    
    if (data.whereYouMet && data.whereYouMet !== '') {
      cleanedData.whereYouMet = data.whereYouMet;
    }
    
    if (data.notes && data.notes !== '') {
      cleanedData.notes = data.notes;
    }
    
    cleanedData.tags = tags;
    
    // Include photo URL if set
    if (photoUrl) {
      cleanedData.photoUrl = photoUrl;
    }
    
    saveContactMutation.mutate(cleanedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingContact ? "Edit Connection" : "Add New Connection"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex justify-center">
              <div className="relative">
                {hasActiveSubscription ? (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5242880}
                    buttonVariant="ghost"
                    onGetUploadParameters={async () => {
                      const response = await apiRequest("POST", "/api/objects/upload", {});
                      const data = await response.json();
                      return { method: "PUT" as const, url: data.uploadURL };
                    }}
                    onComplete={async (result) => {
                      if (result.successful.length > 0) {
                        const file = result.successful[0];
                        try {
                          const aclResponse = await apiRequest("PUT", "/api/contact-attachments", {
                            attachmentURL: file.uploadURL,
                          });
                          const aclData = await aclResponse.json();
                          setPhotoUrl(aclData.objectPath);
                          toast({
                            title: "Photo uploaded",
                            description: "Profile photo has been set.",
                          });
                        } catch (error) {
                          toast({
                            title: "Upload failed",
                            description: "Failed to process uploaded photo",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                    buttonClassName="!bg-transparent hover:!bg-transparent p-0 h-auto !border-none !shadow-none !ring-0 !outline-none rounded-full"
                    acceptedFileTypes="image/*"
                  >
                    <Avatar className="h-20 w-20 cursor-pointer ring-2 ring-gray-200 hover:ring-pink-300 transition-all">
                      <AvatarImage 
                        src={photoUrl && localStorage.getItem('velvetlog_token') 
                          ? `${photoUrl}?token=${localStorage.getItem('velvetlog_token')}` 
                          : photoUrl || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-pink-50 text-gray-400">
                        <Camera className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                  </ObjectUploader>
                ) : (
                  <div 
                    className="cursor-pointer"
                    onClick={() => {
                      toast({
                        title: "Membership required",
                        description: "Upgrade to Membership to upload photos.",
                        variant: "destructive",
                      });
                    }}
                  >
                    <Avatar className="h-20 w-20 ring-2 ring-gray-200">
                      <AvatarFallback className="bg-gray-100 text-gray-400">
                        <Lock className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center mt-2">
                  {hasActiveSubscription ? "Add photo" : "Photo (Members only)"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Age" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone <span className="text-gray-400 font-normal">(begin with country code)</span>
                    </FormLabel>
                    <FormControl>
                      <SmartPhoneInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Enter phone number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="contact@example.com" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="relationshipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dating">Dating</SelectItem>
                        <SelectItem value="exclusive">Exclusive</SelectItem>
                        <SelectItem value="open-relationship">Open Relationship</SelectItem>
                        <SelectItem value="friends-with-benefits">Friends with Benefits</SelectItem>
                        <SelectItem value="long-distance">Long Distance</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="no-longer-talking">Ended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anniversaryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anniversary</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <Select 
                        value={anniversaryMonth} 
                        onValueChange={setAnniversaryMonth}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">January</SelectItem>
                          <SelectItem value="02">February</SelectItem>
                          <SelectItem value="03">March</SelectItem>
                          <SelectItem value="04">April</SelectItem>
                          <SelectItem value="05">May</SelectItem>
                          <SelectItem value="06">June</SelectItem>
                          <SelectItem value="07">July</SelectItem>
                          <SelectItem value="08">August</SelectItem>
                          <SelectItem value="09">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={anniversaryDay} 
                        onValueChange={setAnniversaryDay}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-gray-500">When did you first meet?</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Birthday</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <Select 
                  value={birthdayMonth} 
                  onValueChange={setBirthdayMonth}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">January</SelectItem>
                    <SelectItem value="02">February</SelectItem>
                    <SelectItem value="03">March</SelectItem>
                    <SelectItem value="04">April</SelectItem>
                    <SelectItem value="05">May</SelectItem>
                    <SelectItem value="06">June</SelectItem>
                    <SelectItem value="07">July</SelectItem>
                    <SelectItem value="08">August</SelectItem>
                    <SelectItem value="09">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={birthdayDay} 
                  onValueChange={setBirthdayDay}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={birthdayYear} 
                  onValueChange={setBirthdayYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">N/A</SelectItem>
                    {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Los Angeles, CA or Venice, Italy" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Teacher, Finance, Digital Marketing" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500 text-sm">@</span>
                        <Input 
                          placeholder="username" 
                          className="pl-8"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            // Remove @ symbol if user types it
                            const value = e.target.value.replace(/^@/, '');
                            field.onChange(value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whereYouMet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where You Met</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Coffee Shop, Dating App, Work, Bar" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPriority"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>High Priority</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this contact..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saveContactMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveContactMutation.isPending}
              >
                {saveContactMutation.isPending 
                  ? (editingContact ? "Updating..." : "Creating...") 
                  : (editingContact ? "Update Connection" : "Create Connection")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}