import { useState, useEffect } from "react";
import { Shield, Eye, Lock, Activity, Download, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LocalStorage } from "@/lib/encryption";

interface PrivacyScore {
  overall: number;
  categories: {
    encryption: number;
    authentication: number;
    dataMinimization: number;
    accessControl: number;
    auditLogging: number;
  };
}

interface DataAuditLog {
  id: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export default function PrivacyDashboard() {
  const [privacyScore, setPrivacyScore] = useState<PrivacyScore>({
    overall: 0,
    categories: {
      encryption: 0,
      authentication: 0,
      dataMinimization: 0,
      accessControl: 0,
      auditLogging: 0
    }
  });
  
  const [auditLogs, setAuditLogs] = useState<DataAuditLog[]>([]);
  const [dataUsage, setDataUsage] = useState({
    localStorageSize: 0,
    cloudBackupSize: 0,
    totalContacts: 0,
    totalInteractions: 0
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    autoEncryption: true,
    auditLogging: true,
    dataMinimization: true,
    secureDelete: true,
    anonymousAnalytics: false,
    locationTracking: false,
    biometricData: true,
    cloudBackup: false
  });

  const { toast } = useToast();

  useEffect(() => {
    loadPrivacyData();
    calculatePrivacyScore();
  }, []);

  const loadPrivacyData = async () => {
    try {
      // Load audit logs
      const token = localStorage.getItem('velvetlog_token');
      if (token) {
        const response = await fetch('/api/audit/logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const logs = await response.json();
          setAuditLogs(logs.slice(0, 10)); // Latest 10 entries
        }
      }

      // Calculate data usage
      const localSize = LocalStorage.getStorageSize();
      const contacts = JSON.parse(localStorage.getItem('velvetlog_contacts') || '[]');
      const interactions = JSON.parse(localStorage.getItem('velvetlog_interactions') || '[]');
      
      setDataUsage({
        localStorageSize: localSize,
        cloudBackupSize: 0, // Would fetch from cloud
        totalContacts: contacts.length,
        totalInteractions: interactions.length
      });
    } catch (error) {
      console.error('Failed to load privacy data:', error);
    }
  };

  const calculatePrivacyScore = () => {
    const scores = {
      encryption: calculateEncryptionScore(),
      authentication: calculateAuthScore(),
      dataMinimization: calculateDataMinScore(),
      accessControl: calculateAccessScore(),
      auditLogging: calculateAuditScore()
    };

    const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / 5;

    setPrivacyScore({
      overall: Math.round(overall),
      categories: scores
    });
  };

  const calculateEncryptionScore = (): number => {
    let score = 0;
    if (privacySettings.autoEncryption) score += 40;
    if (privacySettings.secureDelete) score += 30;
    if (localStorage.getItem('velvetlog_token')) score += 30; // Has encryption key
    return score;
  };

  const calculateAuthScore = (): number => {
    let score = 0;
    if (localStorage.getItem('velvetlog_token')) score += 40; // Basic auth
    if (privacySettings.biometricData) score += 30; // Biometric enabled
    // Check for MFA (would query API)
    score += 30; // Assume MFA for demo
    return score;
  };

  const calculateDataMinScore = (): number => {
    let score = 0;
    if (privacySettings.dataMinimization) score += 50;
    if (!privacySettings.anonymousAnalytics) score += 25;
    if (!privacySettings.locationTracking) score += 25;
    return score;
  };

  const calculateAccessScore = (): number => {
    let score = 0;
    if (privacySettings.auditLogging) score += 50;
    score += 50; // Session management
    return score;
  };

  const calculateAuditScore = (): number => {
    let score = 0;
    if (privacySettings.auditLogging) score += 60;
    if (auditLogs.length > 0) score += 40;
    return score;
  };

  const updatePrivacySetting = async (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    
    try {
      const token = localStorage.getItem('velvetlog_token');
      await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [setting]: value })
      });

      calculatePrivacyScore();
      
      toast({
        title: "Privacy Setting Updated",
        description: `${setting} has been ${value ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update privacy setting",
        variant: "destructive"
      });
    }
  };

  const exportPrivacyReport = async () => {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        privacyScore,
        dataUsage,
        privacySettings,
        recentAuditLogs: auditLogs.slice(0, 5),
        recommendations: getPrivacyRecommendations()
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `velvetlog-privacy-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Privacy Report Exported",
        description: "Your privacy report has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not generate privacy report",
        variant: "destructive"
      });
    }
  };

  const getPrivacyRecommendations = (): string[] => {
    const recommendations = [];
    
    if (privacyScore.categories.encryption < 80) {
      recommendations.push("Enable automatic encryption for all data");
    }
    if (privacyScore.categories.authentication < 80) {
      recommendations.push("Set up multi-factor authentication");
    }
    if (privacySettings.anonymousAnalytics) {
      recommendations.push("Disable anonymous analytics for maximum privacy");
    }
    if (privacySettings.locationTracking) {
      recommendations.push("Turn off location tracking");
    }
    if (!privacySettings.auditLogging) {
      recommendations.push("Enable audit logging to track data access");
    }

    return recommendations;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number): { variant: any; text: string } => {
    if (score >= 80) return { variant: "default", text: "Excellent" };
    if (score >= 60) return { variant: "secondary", text: "Good" };
    return { variant: "destructive", text: "Needs Improvement" };
  };

  return (
    <div className="space-y-6">
      {/* Privacy Score Overview */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Privacy Score
          </CardTitle>
          <CardDescription>
            Your overall privacy and security rating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(privacyScore.overall)}`}>
                {privacyScore.overall}/100
              </div>
              <Badge {...getScoreBadge(privacyScore.overall)} className="mt-2">
                {getScoreBadge(privacyScore.overall).text}
              </Badge>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
              {Object.entries(privacyScore.categories).map(([category, score]) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={getScoreColor(score)}>{score}/100</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            Privacy Controls
          </CardTitle>
          <CardDescription>
            Manage how your data is collected and processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'autoEncryption', label: 'Automatic Data Encryption', description: 'Encrypt all data before storage' },
            { key: 'auditLogging', label: 'Audit Logging', description: 'Track all data access and changes' },
            { key: 'dataMinimization', label: 'Data Minimization', description: 'Collect only necessary information' },
            { key: 'secureDelete', label: 'Secure Deletion', description: 'Permanently wipe deleted data' },
            { key: 'biometricData', label: 'Biometric Authentication', description: 'Use fingerprint/face recognition' },
            { key: 'cloudBackup', label: 'Encrypted Cloud Backup', description: 'Store encrypted backups in cloud' },
            { key: 'anonymousAnalytics', label: 'Anonymous Analytics', description: 'Share usage statistics anonymously' },
            { key: 'locationTracking', label: 'Location Services', description: 'Use location for features' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="font-medium">{setting.label}</Label>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <Switch
                checked={privacySettings[setting.key as keyof typeof privacySettings]}
                onCheckedChange={(checked) => updatePrivacySetting(setting.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Data Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dataUsage.totalContacts}</div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dataUsage.totalInteractions}</div>
              <div className="text-sm text-gray-600">Interactions Logged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dataUsage.localStorageSize.toFixed(1)}MB</div>
              <div className="text-sm text-gray-600">Local Storage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{dataUsage.cloudBackupSize.toFixed(1)}MB</div>
              <div className="text-sm text-gray-600">Cloud Backup</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {auditLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-600" />
              Recent Security Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-gray-600 ml-2">{log.resource}</span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Recommendations */}
      {getPrivacyRecommendations().length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Privacy Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getPrivacyRecommendations().map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={exportPrivacyReport} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Privacy Report
          </Button>
          <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Request Data Deletion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}