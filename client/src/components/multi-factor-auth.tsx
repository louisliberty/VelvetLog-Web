import { useState, useEffect } from "react";
import { Shield, Smartphone, Key, QrCode, Copy, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface MFASetupProps {
  userId: string;
  onSetupComplete?: (method: string) => void;
}

interface BackupCode {
  code: string;
  used: boolean;
}

export default function MultiFactorAuth({ userId, onSetupComplete }: MFASetupProps) {
  const [totpSecret, setTotpSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkMFAStatus();
  }, [userId]);

  const checkMFAStatus = async () => {
    try {
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/auth/mfa/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMfaEnabled(data.enabled);
        setActiveMethod(data.method);
      }
    } catch (error) {
      console.error('Failed to check MFA status:', error);
    }
  };

  const generateTOTPSecret = async () => {
    try {
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/auth/mfa/setup-totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to generate TOTP secret');

      const data = await response.json();
      setTotpSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      
      toast({
        title: "TOTP Setup Ready",
        description: "Scan the QR code with your authenticator app"
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Could not generate authenticator setup",
        variant: "destructive"
      });
    }
  };

  const verifyTOTPSetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/auth/mfa/verify-totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: verificationCode,
          secret: totpSecret
        })
      });

      if (!response.ok) throw new Error('Verification failed');

      const data = await response.json();
      setBackupCodes(data.backupCodes);
      setMfaEnabled(true);
      setActiveMethod('totp');
      
      toast({
        title: "MFA Enabled Successfully",
        description: "Your account is now protected with two-factor authentication"
      });

      onSetupComplete?.('totp');
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const generateBackupCodes = async () => {
    try {
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/auth/mfa/backup-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to generate backup codes');

      const data = await response.json();
      setBackupCodes(data.codes);
      
      toast({
        title: "New Backup Codes Generated",
        description: "Previous backup codes have been invalidated"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate backup codes",
        variant: "destructive"
      });
    }
  };

  const disableMFA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    try {
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to disable MFA');

      setMfaEnabled(false);
      setActiveMethod(null);
      setTotpSecret("");
      setQrCodeUrl("");
      setBackupCodes([]);
      
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been turned off"
      });
    } catch (error) {
      toast({
        title: "Disable Failed",
        description: "Could not disable MFA. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard"
    });
  };

  if (mfaEnabled) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication Enabled
          </CardTitle>
          <CardDescription>
            Your account is protected with {activeMethod?.toUpperCase()} authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">MFA is active and protecting your account</span>
          </div>

          {/* Backup Codes Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Backup Recovery Codes</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateBackupCodes}
                className="text-blue-600"
              >
                Generate New Codes
              </Button>
            </div>
            
            {backupCodes.length > 0 && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded border">
                {backupCodes.map((backup, index) => (
                  <div
                    key={index}
                    className={`text-sm font-mono p-2 rounded border cursor-pointer hover:bg-gray-100 ${
                      backup.used ? 'line-through text-gray-400 bg-gray-200' : 'bg-white'
                    }`}
                    onClick={() => !backup.used && copyToClipboard(backup.code)}
                  >
                    {backup.code}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-600">
              Save these codes securely. Each can only be used once to access your account if you lose your authenticator.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={disableMFA}
              className="w-full"
            >
              Disable Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to protect your sensitive relationship data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="totp" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp">Authenticator App</TabsTrigger>
            <TabsTrigger value="sms" disabled>SMS (Coming Soon)</TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-4">
            <div className="space-y-4">
              {/* Step 1: Generate Secret */}
              {!totpSecret && (
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center">
                    <Smartphone className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Setup Authenticator App</h3>
                  <p className="text-sm text-gray-600">
                    Use Google Authenticator, Authy, or any compatible TOTP app
                  </p>
                  <Button onClick={generateTOTPSecret} className="w-full">
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate Setup Code
                  </Button>
                </div>
              )}

              {/* Step 2: Show QR Code */}
              {totpSecret && !mfaEnabled && (
                <div className="space-y-4">
                  <div className="text-center space-y-3">
                    <h3 className="font-medium">Scan QR Code</h3>
                    <div className="bg-white p-4 rounded border inline-block">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                          <QrCode className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>

                  {/* Manual Entry Option */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Or enter manually:</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={totpSecret}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(totpSecret)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Verification */}
                  <div className="space-y-3">
                    <Label htmlFor="verification">Enter verification code from your app:</Label>
                    <Input
                      id="verification"
                      type="text"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-lg font-mono"
                      maxLength={6}
                    />
                    <Button
                      onClick={verifyTOTPSetup}
                      disabled={isVerifying || verificationCode.length !== 6}
                      className="w-full"
                    >
                      {isVerifying ? "Verifying..." : "Enable Two-Factor Authentication"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded border border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Important Security Notes:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Keep your authenticator app secure and backed up</li>
                    <li>• Save backup codes in a secure location</li>
                    <li>• Never share your verification codes with anyone</li>
                    <li>• MFA significantly increases account security</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sms">
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h3 className="font-medium">SMS Authentication</h3>
              <p className="text-sm">SMS-based two-factor authentication coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}