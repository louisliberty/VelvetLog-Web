import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Heart, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Download, 
  Trash2,
  Camera,
  Crown,
  Shield,
  BarChart3,
  Calendar,
  Users,
  MessageSquare,
  Bell,
  Clock,
  ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ObjectUploader } from "@/components/ObjectUploader";
import ContactDetailDialog from "@/components/contact-detail-dialog";
import type { Contact } from "@shared/schema";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";

interface UserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  subscription: {
    plan: "Starter" | "Pro" | "Elite";
    status: "active" | "cancelled" | "past_due";
    nextBillingDate: string;
    storageUsed: number;
    storageLimit: number;
  };
  stats: {
    totalContacts: number;
    totalInteractions: number;
    activeReminders: number;
    accountAge: number;
  };
}

export default function ProfilePage() {
  useEffect(() => {
    document.title = "Profile | VelvetLog";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [showRemindersDialog, setShowRemindersDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Get authenticated user data
  const { user: authUser, isAuthenticated, refreshUser } = useAuth();

  // Fetch contacts for looking up contact details when clicking a reminder
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('velvetlog_token');
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch("/api/contacts", {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Handle clicking a reminder to open contact details
  const handleReminderClick = (reminder: any) => {
    const contact = contacts.find(c => c.id === reminder.contactId);
    if (contact) {
      setSelectedContact(contact);
      setShowRemindersDialog(false);
    }
  };

  // Fetch upcoming reminders
  const { data: upcomingReminders = [] } = useQuery<any[]>({
    queryKey: ["/api/reminders", { upcoming: true }],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('velvetlog_token');
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/reminders?upcoming=true", {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch reminders");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch real user stats from API
  const { data: userStats, isLoading: statsLoading } = useQuery<{
    totalContacts: number;
    totalInteractions: number;
    activeReminders: number;
    accountAge: number;
  }>({
    queryKey: ['/api/user/stats'],
    enabled: isAuthenticated
  });

  // Initialize form fields with actual user data
  useEffect(() => {
    if (authUser) {
      setFirstName(authUser.firstName || "");
      setLastName(authUser.lastName || "");
      setEmail(authUser.email || "");
      setPhone(authUser.phone || "");
      setProfileImageUrl(authUser.profileImageUrl);
    }
  }, [authUser]);

  // Default stats for loading state
  const defaultStats = {
    totalContacts: 0,
    totalInteractions: 0,
    activeReminders: 0,
    accountAge: 0
  };

  // Show loading if not authenticated yet
  if (!isAuthenticated || !authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 bg-white rounded"></div>
          </div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Combine real user data with stats
  const user: UserProfile = {
    id: authUser.id,
    firstName: authUser.firstName || "",
    lastName: authUser.lastName || "",
    email: authUser.email || "",
    phone: authUser.phone || "",
    profileImageUrl: authUser.profileImageUrl,
    subscription: {
      plan: "Pro" as const, // TODO: Get from actual subscription data
      status: "active" as const,
      nextBillingDate: "2025-09-12",
      storageUsed: 0.0, // New users start with 0GB used
      storageLimit: 2.0
    },
    stats: userStats || defaultStats
  };
  const storagePercentage = (user.subscription.storageUsed / user.subscription.storageLimit) * 100;

  const handleDirectPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG)');
      return;
    }

    try {
      setIsUploading(true);
      
      // Get upload parameters
      const uploadParams = await getUploadParameters();
      
      // Upload file to object storage
      const uploadResponse = await fetch(uploadParams.uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadURL = uploadParams.uploadURL;
      
      // Set ACL policy and get the correct object path  
      const token = localStorage.getItem('velvetlog_token');
      const aclResponse = await fetch('/api/contact-attachments', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attachmentURL: uploadURL
        })
      });
      
      const aclData = await aclResponse.json();
      const objectPath = aclData.objectPath;

      // Update profile with the correct object path
      await handlePhotoUpload([{ name: file.name, uploadURL: objectPath, size: file.size }]);
      
      // Reset the input so the same file can be selected again
      event.target.value = '';
      
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert(`Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoUpload = async (files: { name: string; uploadURL: string; size: number }[]) => {
    try {
      if (files.length === 0) return;
      
      const uploadedFile = files[0];
      console.log("🔧 Photo uploaded:", uploadedFile);
      
      // Update the profile with the new photo URL
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          profileImageUrl: uploadedFile.uploadURL
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile photo: ${response.status}`);
      }
      
      const updatedUser = await response.json();
      console.log("✅ Profile photo updated successfully");
      
      // Use the uploadedFile.uploadURL which is now the correct object path
      
      // Update localStorage and refresh user data  
      const userWithObjectPath = { ...updatedUser, profileImageUrl: uploadedFile.uploadURL };
      localStorage.setItem('velvetlog_user', JSON.stringify(userWithObjectPath));
      refreshUser();
      setProfileImageUrl(uploadedFile.uploadURL);
    } catch (error) {
      console.error("❌ Failed to update profile photo:", error);
      alert("Failed to update profile photo. Please try again.");
    }
  };

  const getUploadParameters = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('velvetlog_token')}`,
        },
        body: JSON.stringify({
          fileName: 'profile-photo.jpg',
          directory: '.private',
          isPublic: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get upload parameters');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      throw error;
    }
  };

  const handleManageBilling = async () => {
    try {
      console.log("🔧 Opening Stripe customer portal...");
      
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/create-billing-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create billing portal: ${response.status}`);
      }
      
      const { url } = await response.json();
      console.log("✅ Redirecting to billing portal:", url);
      
      // Open the billing portal in a new window
      window.open(url, '_blank');
    } catch (error) {
      console.error("❌ Failed to open billing portal:", error);
      alert("Failed to open billing management. Please try again.");
    }
  };

  const handleUpgradePlan = () => {
    // Navigate to the plan selection page for upgrades
    window.location.href = '/onboarding/plan';
  };

  // Format phone number using libphonenumber-js for proper international formatting
  const formatPhoneNumber = (phoneInput: string): string => {
    if (!phoneInput) return '';
    
    // Try to parse the phone number
    const phoneNumber = parsePhoneNumberFromString(phoneInput, 'US');
    
    if (phoneNumber && phoneNumber.isValid()) {
      // Use international format for display
      return phoneNumber.formatInternational();
    }
    
    // If parsing fails, try adding + if it looks like it's missing
    if (!phoneInput.startsWith('+')) {
      const withPlus = '+' + phoneInput.replace(/[^\d]/g, '');
      const phoneNumberWithPlus = parsePhoneNumberFromString(withPlus);
      if (phoneNumberWithPlus && phoneNumberWithPlus.isValid()) {
        return phoneNumberWithPlus.formatInternational();
      }
    }
    
    // Return as-is if we can't parse it
    return phoneInput;
  };

  const handleSave = async () => {
    try {
      // Format the phone number before saving
      const formattedPhone = formatPhoneNumber(phone);
      
      console.log("🔧 Saving profile changes...", { firstName, lastName, email, phone: formattedPhone });
      
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: formattedPhone
        })
      });
      
      if (!response.ok) {
        throw new Error(`Save failed: ${response.status} ${response.statusText}`);
      }
      
      const updatedUser = await response.json();
      console.log("🔧 API Response after schema fix:", updatedUser);
      console.log("🔧 Phone field in response:", updatedUser.phone);
      
      // Update localStorage with the new user data
      localStorage.setItem('velvetlog_user', JSON.stringify(updatedUser));
      
      // Refresh the auth context to show updated data
      refreshUser();
      
      // Update form state with the saved data immediately
      setFirstName(updatedUser.firstName || "");
      setLastName(updatedUser.lastName || "");
      setEmail(updatedUser.email || "");
      setPhone(updatedUser.phone || ""); // This will now be the formatted phone number
      
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Failed to save profile:", error);
      alert("Failed to save profile changes. Please try again.");
    }
  };

  const handleExportData = async () => {
    try {
      console.log("🔧 Starting data export...");
      
      // Use authenticated fetch to get the export data
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/user/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }
      
      // Get the JSON data
      const exportData = await response.json();
      
      // Create a blob with the JSON data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `velvetlog-data-export-${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      console.log("✅ Data export completed successfully");
    } catch (error) {
      console.error("❌ Failed to export data:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    // Show confirmation dialog and API call to delete account
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Deleting account...");
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "Starter": return <User className="h-4 w-4" />;
      case "Pro": return <Crown className="h-4 w-4" />;
      case "Elite": return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Starter": return "bg-green-100 text-green-800";
      case "Pro": return "bg-purple-100 text-purple-800";
      case "Elite": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
              <a href="/" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                Dashboard
              </a>
              <a href="/calendar" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                Calendar
              </a>
              <a href="/profile" className="text-pink-600 font-medium border-b-2 border-pink-600">
                Profile
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your account settings and subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-pink-500" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={profileImageUrl 
                        ? `${profileImageUrl}?token=${localStorage.getItem('velvetlog_token')}` 
                        : undefined
                      } 
                    />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xl">
                      {user.firstName[0]}{user.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDirectPhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm px-3 py-1.5 mb-2 rounded-md font-medium flex items-center disabled:opacity-50"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-400 rounded-full border-t-transparent" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Change Photo
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">JPG, PNG up to 5MB</p>
                  </div>
                </div>


                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={isEditing ? firstName : user.firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={isEditing ? lastName : user.lastName || ""}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? email : user.email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={isEditing ? phone : formatPhoneNumber(phone)}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>

                <div className="flex gap-3">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => {
                        // When canceling, reset to auth user values
                        if (authUser) {
                          setFirstName(authUser.firstName || "");
                          setLastName(authUser.lastName || "");
                          setEmail(authUser.email || "");
                          setPhone(authUser.phone || "");
                        }
                        setIsEditing(false);
                      }}>
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-pink-500" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                    <Users className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.totalContacts}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Contacts</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.totalInteractions}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Interactions</div>
                  </div>
                  <div 
                    className="text-center p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                    onClick={() => setShowRemindersDialog(true)}
                    data-testid="stat-reminders"
                  >
                    <Calendar className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.activeReminders}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Reminders</div>
                    <div className="text-xs text-indigo-500 mt-1">Click to view</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <Heart className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.accountAge}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Days Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Download className="h-5 w-5 text-pink-500" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Export Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Download all your relationship data</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-300">Delete Account</h4>
                    <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Subscription Info */}
          <div className="space-y-6">
            {/* Subscription Plan */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-pink-500" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${getPlanColor(user.subscription.plan)} flex items-center gap-1`}>
                    {getPlanIcon(user.subscription.plan)}
                    {user.subscription.plan} Plan
                  </Badge>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      ${user.subscription.plan === "Starter" ? "19.99" : user.subscription.plan === "Pro" ? "49.99" : "99.99"}/mo
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.subscription.status === "active" ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Next billing date</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {new Date(user.subscription.nextBillingDate).toLocaleDateString()}
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={handleManageBilling}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Billing
                </Button>

                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  onClick={handleUpgradePlan}
                >
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            {/* Storage Usage */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-pink-500" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Photos & Videos</span>
                    <span className="text-gray-900 dark:text-white">
                      {user.subscription.storageUsed}GB / {user.subscription.storageLimit}GB
                    </span>
                  </div>
                  <Progress value={storagePercentage} className="h-2" />
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {storagePercentage > 80 && (
                    <p className="text-amber-600 dark:text-amber-400">
                      ⚠️ Storage is {Math.round(storagePercentage)}% full. Consider upgrading your plan.
                    </p>
                  )}
                  {storagePercentage <= 80 && (
                    <p>You have {(user.subscription.storageLimit - user.subscription.storageUsed).toFixed(1)}GB of storage remaining.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reminders Dialog */}
      <Dialog open={showRemindersDialog} onOpenChange={setShowRemindersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-500" />
              Upcoming Reminders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming reminders</p>
                <p className="text-sm text-gray-400">Reminders due within 7 days will appear here</p>
              </div>
            ) : (
              upcomingReminders.map((reminder: any) => (
                <div 
                  key={reminder.id} 
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleReminderClick(reminder)}
                  data-testid={`reminder-${reminder.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {reminder.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {reminder.type}
                        </Badge>
                      </div>
                      {reminder.contactName && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-pink-600 dark:text-pink-400">
                          <User className="h-3 w-3" />
                          <span>{reminder.contactName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(reminder.dueDate).toLocaleDateString()}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  {reminder.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {reminder.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowRemindersDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Detail Dialog */}
      <ContactDetailDialog
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      />
    </div>
  );
}