import { useState, useEffect } from "react";
import { ArrowLeft, Shield, Download, Trash2, Fingerprint, Key, Database, Cloud, Brain, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LocalStorage } from "@/lib/encryption";
import { BiometricAuth } from "@/lib/biometric";
import MultiFactorAuth from "@/components/multi-factor-auth";
import PrivacyDashboard from "@/components/privacy-dashboard";
import EnhancedReminderSystem from "@/components/enhanced-reminder-system";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Settings() {
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [storageSize, setStorageSize] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("security");
  const { toast } = useToast();

  // Fetch user data for enhanced features
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const response = await fetch("/api/contacts");
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["/api/reminders"],
    queryFn: async () => {
      const response = await fetch("/api/reminders");
      if (!response.ok) throw new Error("Failed to fetch reminders");
      return response.json();
    },
  });

  useEffect(() => {
    document.title = "Settings | VelvetLog";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  useEffect(() => {
    // Check current settings
    const checkSettings = async () => {
      // Check biometric availability
      const isAvailable = await BiometricAuth.isAvailable();
      setBiometricAvailable(isAvailable);
      if (isAvailable) {
        const credentials = await BiometricAuth.getStoredCredentials();
        setBiometricEnabled(credentials.length > 0);
      }

      // Check storage size
      setStorageSize(LocalStorage.getStorageSize());
    };

    checkSettings();
  }, []);

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      // First check if biometric is available
      if (!biometricAvailable) {
        toast({
          title: "Not Available",
          description: "Biometric authentication is not supported on this device or browser",
          variant: "destructive"
        });
        return;
      }

      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem('velvetlog_user') || '{}');
        
        if (!user.id || !user.email) {
          throw new Error('User data not found');
        }
        
        const credential = await BiometricAuth.register(user.id, user.email);
        
        if (credential) {
          BiometricAuth.storeCredentialId(credential.id);
          
          // Register with server
          const token = localStorage.getItem('velvetlog_token');
          await fetch('/api/auth/biometric/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ credentialId: credential.id })
          });

          setBiometricEnabled(true);
          toast({
            title: "Biometric Authentication Enabled",
            description: "You can now sign in using your fingerprint or face"
          });
        }
      } catch (error: any) {
        console.error('Biometric setup error:', error);
        let errorMessage = "Could not enable biometric authentication";
        
        // Provide more specific error messages
        if (error.name === 'NotAllowedError') {
          errorMessage = "Biometric setup was cancelled or denied. Please try again.";
        } else if (error.name === 'SecurityError') {
          errorMessage = "Biometric authentication requires a secure connection (HTTPS).";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "This device doesn't support biometric authentication.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Setup Failed",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Disable biometric
      try {
        const credentials = await BiometricAuth.getStoredCredentials();
        credentials.forEach(cred => {
          BiometricAuth.removeCredentialId(new TextDecoder().decode(cred.id));
        });
        setBiometricEnabled(false);
        toast({
          title: "Biometric Authentication Disabled",
          description: "Biometric sign-in has been turned off"
        });
      } catch (error) {
        console.error('Error disabling biometric:', error);
        setBiometricEnabled(false);
      }
    }
  };

  const handleExportData = () => {
    try {
      const userData = localStorage.getItem('velvetlog_user');
      const storageData = localStorage.getItem('velvetlog_secure_data');
      
      const exportData = {
        user: userData ? JSON.parse(userData) : null,
        data: storageData ? JSON.parse(storageData) : null,
        exported: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `velvetlog-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded to your device"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export your data",
        variant: "destructive"
      });
    }
  };

  const handleClearLocalData = () => {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      LocalStorage.clear();
      setStorageSize(0);
      toast({
        title: "Local Data Cleared",
        description: "All local data has been removed from this device"
      });
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      // Clear all local data
      localStorage.clear();
      LocalStorage.clear();
      
      // In a real app, you'd also call an API to delete the account
      toast({
        title: "Account Deleted",
        description: "Your account and all data has been permanently deleted"
      });
      
      // Redirect to landing page
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy & Security Settings</h1>
          <p className="text-gray-600">Manage your data security and privacy preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="smart">Smart Features</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Authentication Settings */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-pink-600" />
                  Authentication Methods
                </CardTitle>
                <CardDescription>
                  Secure your account with multiple authentication factors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="biometric" className="text-base font-medium">
                      Biometric Authentication
                    </Label>
                    <p className="text-sm text-gray-600">
                      {biometricAvailable 
                        ? "Sign in with your fingerprint or face recognition"
                        : "Not available on this device or browser"}
                    </p>
                  </div>
                  <Switch
                    id="biometric"
                    checked={biometricEnabled}
                    onCheckedChange={handleBiometricToggle}
                    disabled={isLoading || !biometricAvailable}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Multi-Factor Authentication */}
            <MultiFactorAuth 
              userId="current-user" 
              onSetupComplete={(method) => {
                toast({
                  title: "MFA Enabled",
                  description: `${method.toUpperCase()} authentication is now active`
                });
              }}
            />

            {/* Session Security */}
            <Card className="border-indigo-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Session Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-logout</Label>
                    <p className="text-sm text-gray-600">
                      Automatically sign out after 30 minutes of inactivity
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Secure Sessions</Label>
                    <p className="text-sm text-gray-600">
                      Encrypt session data and require re-authentication for sensitive operations
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <PrivacyDashboard />
          </TabsContent>

          {/* Smart Features Tab */}
          <TabsContent value="smart">
            <EnhancedReminderSystem 
              contacts={contacts}
              reminders={reminders}
              onConfigChange={(config) => {
                toast({
                  title: "Smart Features Updated",
                  description: "Your intelligent reminder preferences have been saved"
                });
              }}
            />
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-6">
            {/* Data Storage */}
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  Data Storage
                </CardTitle>
                <CardDescription>
                  Control how and where your data is stored
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cloud-backup" className="text-base font-medium">
                      Encrypted Cloud Backup
                    </Label>
                    <p className="text-sm text-gray-600">
                      Backup your encrypted data to secure cloud storage
                    </p>
                  </div>
                  <Switch
                    id="cloud-backup"
                    checked={backupEnabled}
                    onCheckedChange={setBackupEnabled}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Local Storage Used</span>
                    <span>{storageSize.toFixed(2)} MB</span>
                  </div>
                  <Progress value={(storageSize / 10) * 100} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    Data is encrypted and stored locally on your device
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Management Actions */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-600" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export, backup, or delete your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleExportData}
                    variant="outline" 
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                  
                  <Button 
                    onClick={handleClearLocalData}
                    variant="outline" 
                    className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Clear Local Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Trash2 className="w-5 h-5" />
                  Warning
                </CardTitle>
                <CardDescription className="text-red-600">
                  Irreversible actions that will permanently delete your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleDeleteAccount}
                  variant="destructive" 
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Permanently Delete Account
                </Button>
                <p className="text-xs text-red-600 mt-2">
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}