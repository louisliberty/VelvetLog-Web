import type { Express } from "express";
import { storage } from "./storage";
import { authenticateLocal, type LocalAuthRequest } from "./localAuth";
import { randomBytes } from "crypto";

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

export function registerReferralRoutes(app: Express) {
  // Get user's referral stats and history
  app.get("/api/referrals", authenticateLocal, async (req: LocalAuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate referral code if user doesn't have one
      let referralCode = user.referralCode;
      if (!referralCode) {
        referralCode = await generateUniqueReferralCode(user.firstName || "USER");
        await storage.updateUser(userId, { referralCode });
      }

      // Get referral history
      const referrals = await storage.getUserReferrals(userId);
      
      // Calculate stats
      const totalReferrals = referrals.length;
      const successfulReferrals = referrals.filter(r => r.status === "completed").length;
      const pendingReferrals = referrals.filter(r => r.status === "pending").length;
      const totalEarnings = successfulReferrals * 10; // $10 per successful referral
      const availableCredits = user.availableCredits || 0;
      const bonusStorage = successfulReferrals * 0.5; // 500MB per referral

      const stats: ReferralStats = {
        referralCode,
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        totalEarnings,
        availableCredits,
        bonusStorage
      };

      const history: ReferralHistory[] = referrals.map(r => ({
        id: r.id,
        email: r.referredUserEmail,
        status: r.status,
        signupDate: r.signupDate,
        subscriptionDate: r.subscriptionDate,
        reward: r.status === "completed" ? "1 Month Free + $10 Credit" : "Pending subscription"
      }));

      res.json({ stats, history });
    } catch (error: any) {
      console.error("Error fetching referral data:", error);
      res.status(500).json({ error: "Failed to fetch referral data" });
    }
  });

  // Process referral signup (called when new user signs up with referral code)
  app.post("/api/referrals/signup", async (req, res) => {
    try {
      const { referralCode, newUserEmail, newUserId } = req.body;

      if (!referralCode || !newUserEmail || !newUserId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Find referring user by referral code
      const referringUser = await storage.getUserByReferralCode(referralCode);
      if (!referringUser) {
        return res.status(404).json({ error: "Invalid referral code" });
      }

      // Create referral record
      const referral = await storage.createReferral({
        referrerId: referringUser.id,
        referredUserId: newUserId,
        referredUserEmail: newUserEmail,
        referralCode,
        status: "pending",
        signupDate: new Date().toISOString()
      });

      // Give new user extended trial benefits
      await storage.updateUser(newUserId, {
        trialDays: 14, // Extended from 7 to 14 days
        firstMonthDiscount: 50 // 50% off first month
      });

      res.json({ success: true, referralId: referral.id });
    } catch (error: any) {
      console.error("Error processing referral signup:", error);
      res.status(500).json({ error: "Failed to process referral" });
    }
  });

  // Complete referral (called when referred user subscribes)
  app.post("/api/referrals/complete", async (req, res) => {
    try {
      const { referralId, subscriptionId } = req.body;

      if (!referralId) {
        return res.status(400).json({ error: "Referral ID is required" });
      }

      // Update referral status
      const referral = await storage.updateReferralStatus(referralId, {
        status: "completed",
        subscriptionDate: new Date().toISOString(),
        subscriptionId
      });

      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }

      // Reward referring user
      const referringUser = await storage.getUser(referral.referrerId);
      if (referringUser) {
        const currentCredits = referringUser.availableCredits || 0;
        const currentBonusStorage = referringUser.bonusStorage || 0;
        
        await storage.updateUser(referral.referrerId, {
          availableCredits: currentCredits + 10, // $10 credit
          bonusStorage: currentBonusStorage + 0.5, // 500MB bonus storage
          freeMonths: (referringUser.freeMonths || 0) + 1 // 1 month free
        });

        // Log the reward
        console.log(`✅ Referral reward given to user ${referral.referrerId}: $10 credit, 500MB storage, 1 month free`);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error completing referral:", error);
      res.status(500).json({ error: "Failed to complete referral" });
    }
  });
}

// Helper function to generate unique referral codes
async function generateUniqueReferralCode(firstName: string): Promise<string> {
  const baseCode = firstName.toUpperCase().substring(0, 4) + new Date().getFullYear();
  let attempts = 0;
  let code = baseCode;
  
  // Ensure uniqueness
  while (attempts < 10) {
    const existingUser = await storage.getUserByReferralCode(code);
    if (!existingUser) {
      return code;
    }
    
    attempts++;
    const suffix = randomBytes(2).toString('hex').toUpperCase();
    code = baseCode + suffix;
  }
  
  // Fallback to completely random code
  return randomBytes(4).toString('hex').toUpperCase();
}