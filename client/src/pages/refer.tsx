import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Copy, 
  Check, 
  Users, 
  Gift,
  Share2,
  Mail,
  MessageCircle,
  Trophy,
  Star,
  DollarSign,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  availableCredits: number;
  bonusStorage: number;
}

interface ReferralHistory {
  id: string;
  email: string;
  status: "pending" | "completed" | "cancelled";
  signupDate: string;
  subscriptionDate?: string;
  reward: string;
}

export default function ReferPage() {
  useEffect(() => {
    document.title = "Refer Friends | VelvetLog";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch real referral data from API
  const { data: referralData, isLoading } = useQuery<{ stats: ReferralStats; history: ReferralHistory[] }>({
    queryKey: ["/api/referrals"],
  });

  const stats = referralData?.stats || {
    referralCode: "",
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    availableCredits: 0,
    bonusStorage: 0
  };
  const history = referralData?.history || [];

  const referralUrl = `https://velvetlog.app/signup?ref=${stats.referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = "Try VelvetLog - Get 2 Weeks Free!";
    const body = `Hi!\n\nI've been using VelvetLog to manage my relationships and connections, and it's been amazing! \n\nYou can get a 14-day free trial (instead of 7 days) plus 50% off your first month by using my referral link:\n\n${referralUrl}\n\nVelvetLog helps you:\n• Keep track of important people in your life\n• Remember birthdays, anniversaries, and special dates\n• Log interactions and maintain meaningful connections\n• Store photos and memories securely\n\nTry it out - I think you'll love it!\n\nBest regards`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaText = () => {
    const message = `Try VelvetLog for relationship management! Get 2 weeks free + 50% off first month with my link: ${referralUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check className="h-3 w-3" />;
      case "pending": return <Calendar className="h-3 w-3" />;
      case "cancelled": return <Trophy className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
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
              <a href="/settings" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                Security
              </a>
              <a href="/refer" className="text-pink-600 font-medium border-b-2 border-pink-600">
                Refer A Friend
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Refer A Friend
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Share VelvetLog with friends and earn rewards when they subscribe
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <span className="ml-3 text-gray-600">Loading your referral code...</span>
          </div>
        ) : !stats.referralCode ? (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0 mb-8">
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Please log in to access your referral code.</p>
            </CardContent>
          </Card>
        ) : null}

        {stats.referralCode && !isLoading && (
          <>
        {/* Rewards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <Gift className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Your Rewards</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-pink-600">${stats.availableCredits.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Available Credits</div>
                <div className="text-lg font-semibold">+{stats.bonusStorage} GB</div>
                <div className="text-sm text-gray-600">Bonus Storage</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Friend's Rewards</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">14 Days</div>
                <div className="text-sm text-gray-600">Extended Free Trial</div>
                <div className="text-lg font-semibold">50% Off</div>
                <div className="text-sm text-gray-600">First Month</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Referral Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-amber-600">{stats.successfulReferrals}</div>
                <div className="text-sm text-gray-600">Successful Referrals</div>
                <div className="text-lg font-semibold">{stats.pendingReferrals}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-pink-500" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={referralUrl} 
                readOnly 
                className="flex-1 bg-gray-50 dark:bg-gray-700"
              />
              <Button 
                onClick={copyReferralLink}
                variant="outline"
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Your referral code: <Badge variant="outline" className="ml-1">{stats.referralCode}</Badge>
              </p>

              <div className="flex justify-center gap-4">
                <Button 
                  onClick={shareViaEmail}
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button 
                  onClick={shareViaText}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Text
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-pink-500" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="font-semibold mb-2">1. Share Your Link</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Send your unique referral link to friends via email, text, or social media
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">2. Friend Signs Up</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your friend gets 14-day free trial (instead of 7) and 50% off first month
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">3. You Both Win</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  When they subscribe, you get 1 month free + $10 credit + bonus storage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-pink-500" />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No referrals yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start sharing your link to see your referrals here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {referral.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {referral.email}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Signed up: {new Date(referral.signupDate).toLocaleDateString()}
                          {referral.subscriptionDate && (
                            <span> • Subscribed: {new Date(referral.subscriptionDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {referral.reward}
                        </div>
                        <Badge className={`${getStatusColor(referral.status)} flex items-center gap-1 text-xs`}>
                          {getStatusIcon(referral.status)}
                          {referral.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}