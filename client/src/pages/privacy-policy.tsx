import { ArrowLeft, Shield, Lock, Eye, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Privacy Overview */}
        <Card className="mb-8 border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-600" />
              Your Privacy is Our Priority
            </CardTitle>
            <CardDescription>
              VelvetLog is designed with privacy-first principles. Your personal relationship data 
              is encrypted, secure, and completely under your control.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Key Privacy Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-pink-100">
            <CardHeader className="text-center">
              <Lock className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <CardTitle className="text-lg">End-to-End Encryption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                All your data is encrypted before it leaves your device using AES-256 encryption.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="text-center">
              <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Zero Knowledge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                We cannot see your data. Only you have the keys to decrypt your information.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardHeader className="text-center">
              <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Data Portability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Export your data anytime. You own your information completely.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Privacy Policy */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Detailed Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Account Information:</strong> Email address, name (optional), authentication credentials</p>
                <p><strong>Relationship Data:</strong> All contact information, timeline entries, and reminders you create</p>
                <p><strong>Technical Data:</strong> Device information for security purposes, encrypted locally</p>
                <p><strong>We DO NOT collect:</strong> Your actual relationship data (it's encrypted), browsing history outside our app, or any personally identifiable information about your contacts</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-3">2. How We Protect Your Data</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Local-First Storage:</strong> Your data is stored primarily on your device</p>
                <p><strong>End-to-End Encryption:</strong> All data is encrypted with AES-256 before transmission</p>
                <p><strong>Zero-Knowledge Architecture:</strong> We cannot decrypt or access your personal data</p>
                <p><strong>Secure Authentication:</strong> Biometric authentication and strong password requirements</p>
                <p><strong>Data Integrity:</strong> Cryptographic hashing ensures your data hasn't been tampered with</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-3">3. Cloud Backup (Optional)</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Opt-in Only:</strong> Cloud backup is disabled by default</p>
                <p><strong>Encrypted Storage:</strong> If enabled, data is encrypted before upload to cloud storage</p>
                <p><strong>Your Keys:</strong> Only you have the decryption keys, not us or cloud providers</p>
                <p><strong>Geographic Control:</strong> Choose your preferred data center location</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-3">4. Data Sharing and Third Parties</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>We NEVER share your personal relationship data with anyone</strong></p>
                <p><strong>Analytics:</strong> Only anonymous, aggregated usage statistics (opt-out available)</p>
                <p><strong>Service Providers:</strong> Cloud infrastructure providers may store encrypted data but cannot decrypt it</p>
                <p><strong>Legal Requests:</strong> We can only provide encrypted data, which is useless without your keys</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-3">5. Your Rights and Controls</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Data Export:</strong> Download all your data in standard formats anytime</p>
                <p><strong>Account Deletion:</strong> Permanently delete your account and all associated data</p>
                <p><strong>Privacy Settings:</strong> Control what minimal data is shared for app functionality</p>
                <p><strong>Backup Control:</strong> Enable/disable cloud backup at any time</p>
                <p><strong>Data Retention:</strong> Set how long to keep your data locally</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-3">6. Security Measures</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Authentication:</strong> Biometric authentication, strong passwords, optional 2FA</p>
                <p><strong>Encryption:</strong> AES-256 encryption with PBKDF2 key derivation</p>
                <p><strong>Data Integrity:</strong> Cryptographic signatures prevent data tampering</p>
                <p><strong>Secure Transmission:</strong> All data transmission uses TLS 1.3</p>
                <p><strong>Local Security:</strong> Data is encrypted even when stored locally on your device</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold mb-3">7. Contact and Updates</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Privacy Questions:</strong> Contact us at privacy@velvetlog.app</p>
                <p><strong>Policy Updates:</strong> You'll be notified of any significant changes</p>
                <p><strong>Transparency:</strong> Our security practices are regularly audited</p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Data Management Actions */}
        <Card className="mt-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-amber-600" />
              Data Management
            </CardTitle>
            <CardDescription>
              Take control of your data with these options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}