import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { LocalAuthService, authenticateLocal, type LocalAuthRequest } from "./localAuth";
import { EncryptionService } from "./encryption";
import { MFAService, requireMFA } from "./mfa";
import { AnalyticsService, EventTypes } from "./analytics";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { registerAdminRoutes } from "./admin-routes";
import { registerReferralRoutes } from "./referral-routes";
import { insertContactSchema, insertTimelineEntrySchema, insertReminderSchema, contactSubmissions } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

// Helper function to get next occurrence of anniversary/birthday
function getNextOccurrence(date: Date, isAnniversary: boolean = false): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // For anniversary dates, we only use month/day (year is placeholder)
  let month, day;
  if (isAnniversary) {
    month = date.getMonth();
    day = date.getDate();
  } else {
    month = date.getMonth();
    day = date.getDate();
  }
  
  // Create next occurrence at 9 AM
  let nextOccurrence = new Date(currentYear, month, day, 9, 0, 0);
  
  // If the date has already passed this year, move to next year
  if (nextOccurrence <= now) {
    nextOccurrence = new Date(currentYear + 1, month, day, 9, 0, 0);
  }
  
  return nextOccurrence;
}

// Helper function to create automatic reminders for birthday and anniversary
async function createAutoReminders(contact: any, userId: string): Promise<void> {
  try {
    console.log("🔧 Creating auto reminders for contact:", contact.id);
    
    // Create birthday reminder if birthday exists
    if (contact.birthday) {
      const nextBirthday = getNextOccurrence(new Date(contact.birthday));
      console.log("🔧 Creating birthday reminder for:", nextBirthday);
      
      await storage.createReminder({
        contactId: contact.id,
        userId: userId,
        title: `${contact.name}'s Birthday`,
        type: "birthday",
        description: `Reminder for ${contact.name}'s birthday`,
        dueDate: nextBirthday
      });
    }
    
    // Create anniversary reminder if anniversary date exists
    if (contact.anniversaryDate) {
      const nextAnniversary = getNextOccurrence(new Date(contact.anniversaryDate), true);
      console.log("🔧 Creating anniversary reminder for:", nextAnniversary);
      
      await storage.createReminder({
        contactId: contact.id,
        userId: userId,
        title: `Anniversary with ${contact.name}`,
        type: "anniversary",
        description: `Reminder for your anniversary with ${contact.name}`,
        dueDate: nextAnniversary
      });
    }
    
    console.log("✅ Auto reminders created successfully");
  } catch (error) {
    console.error("❌ Failed to create auto reminders:", error);
  }
}

// Helper function to create next year's reminders for recurring reminders
async function createNextYearReminders(): Promise<void> {
  try {
    console.log("🔧 Checking for reminders that need next year's occurrence...");
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    // Get all anniversary and birthday reminders that are due within 30 days
    const allReminders = await storage.getAllReminders();
    const upcomingRecurringReminders = allReminders.filter(reminder => {
      const dueDate = new Date(reminder.dueDate);
      return (reminder.type === 'birthday' || reminder.type === 'anniversary') && 
             dueDate <= thirtyDaysFromNow && 
             dueDate >= now;
    });
    
    console.log(`🔧 Found ${upcomingRecurringReminders.length} upcoming recurring reminders`);
    
    for (const reminder of upcomingRecurringReminders) {
      // Check if next year's reminder already exists
      const nextYear = new Date(reminder.dueDate);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      
      const existingNextYear = allReminders.find(r => 
        r.contactId === reminder.contactId &&
        r.type === reminder.type &&
        new Date(r.dueDate).getFullYear() === nextYear.getFullYear() &&
        new Date(r.dueDate).getMonth() === nextYear.getMonth() &&
        new Date(r.dueDate).getDate() === nextYear.getDate()
      );
      
      if (!existingNextYear) {
        console.log(`🔧 Creating next year's ${reminder.type} reminder for contact ${reminder.contactId}`);
        await storage.createReminder({
          contactId: reminder.contactId,
          userId: reminder.userId,
          title: reminder.title,
          type: reminder.type,
          description: reminder.description,
          dueDate: nextYear
        });
      }
    }
    
    console.log("✅ Next year's reminders creation completed");
  } catch (error) {
    console.error("❌ Failed to create next year's reminders:", error);
  }
}

// Helper function to update automatic reminders when contact is edited
async function updateAutoReminders(contact: any, userId: string, updatedData: any): Promise<void> {
  try {
    console.log("🔧 Updating auto reminders for contact:", contact.id);
    
    // If birthday was updated, remove old birthday reminders and create new ones
    if (updatedData.birthday !== undefined) {
      // Remove existing birthday reminders
      const existingReminders = await storage.getReminders(contact.id, userId);
      const birthdayReminders = existingReminders.filter(r => r.type === "birthday");
      
      for (const reminder of birthdayReminders) {
        await storage.deleteReminder(reminder.id, userId);
      }
      
      // Create new birthday reminder if birthday exists
      if (contact.birthday) {
        const nextBirthday = getNextOccurrence(new Date(contact.birthday));
        console.log("🔧 Creating updated birthday reminder for:", nextBirthday);
        
        await storage.createReminder({
          contactId: contact.id,
          userId: userId,
          title: `${contact.name}'s Birthday`,
          type: "birthday",
          description: `Reminder for ${contact.name}'s birthday`,
          dueDate: nextBirthday
        });
      }
    }
    
    // If anniversary date was updated, remove old anniversary reminders and create new ones
    if (updatedData.anniversaryDate !== undefined) {
      // Remove existing anniversary reminders
      const existingReminders = await storage.getReminders(contact.id, userId);
      const anniversaryReminders = existingReminders.filter(r => r.type === "anniversary");
      
      for (const reminder of anniversaryReminders) {
        await storage.deleteReminder(reminder.id, userId);
      }
      
      // Create new anniversary reminder if anniversary date exists
      if (contact.anniversaryDate) {
        const nextAnniversary = getNextOccurrence(new Date(contact.anniversaryDate), true);
        console.log("🔧 Creating updated anniversary reminder for:", nextAnniversary);
        
        await storage.createReminder({
          contactId: contact.id,
          userId: userId,
          title: `Anniversary with ${contact.name}`,
          type: "anniversary",
          description: `Reminder for your anniversary with ${contact.name}`,
          dueDate: nextAnniversary
        });
      }
    }
    
    console.log("✅ Auto reminders updated successfully");
  } catch (error) {
    console.error("❌ Failed to update auto reminders:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Local Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('🔧 Registration attempt:', {
        body: req.body,
        hasEmail: !!req.body.email,
        hasPassword: !!req.body.password,
        passwordLength: req.body.password?.length
      });
      
      const { email, password, firstName, lastName, phone, localStorageOnly } = req.body;
      
      if (!email || !password) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      console.log('🔧 Calling LocalAuthService.register...');
      const result = await LocalAuthService.register(email, password, firstName, lastName, phone);
      console.log('✅ Registration successful:', { userId: result.user.id });
      
      // Create simple token for demo (use proper JWT in production)
      const token = Buffer.from(JSON.stringify({
        userId: result.user.id,
        email: result.user.email,
        encryptionKey: result.encryptionKey
      })).toString('base64');

      res.status(201).json({
        user: result.user,
        encryptionKey: result.encryptionKey,
        token
      });
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔧 Login attempt for email:', email);
      
      const result = await LocalAuthService.login(email, password);
      
      console.log('✅ Login successful for user:', result.user.id);
      
      // Create simple token for demo (use proper JWT in production)
      const token = Buffer.from(JSON.stringify({
        userId: result.user.id,
        email: result.user.email,
        encryptionKey: result.encryptionKey
      })).toString('base64');

      res.json({
        user: result.user,
        encryptionKey: result.encryptionKey,
        token
      });
    } catch (error: any) {
      console.log('❌ Login failed:', error.message);
      res.status(401).json({ message: error.message });
    }
  });

  // Get current user data (for refreshing after subscription changes)
  app.get('/api/auth/me', authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const user = await storage.getUser(authReq.user!.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't return password hash
      const { passwordHash, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });

  app.post('/api/auth/biometric/register', authenticateLocal, async (req, res) => {
    try {
      const { credentialId } = req.body;
      const authReq = req as LocalAuthRequest;
      await LocalAuthService.registerBiometric(authReq.user!.id, credentialId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/biometric', async (req, res) => {
    try {
      const { credentialId } = req.body;
      
      const result = await LocalAuthService.authenticateBiometric(credentialId);
      
      // Create simple token for demo (use proper JWT in production)
      const token = Buffer.from(JSON.stringify({
        userId: result.user.id,
        email: result.user.email,
        encryptionKey: result.encryptionKey
      })).toString('base64');

      res.json({
        user: result.user,
        encryptionKey: result.encryptionKey,
        token
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  // MFA Routes
  app.get('/api/auth/mfa/status', authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const user = await storage.getUser(authReq.user!.id);
      res.json({
        enabled: !!(user?.totpSecret || user?.smsNumber),
        method: user?.totpSecret ? 'totp' : user?.smsNumber ? 'sms' : null,
        backupCodes: user?.backupCodes?.length || 0
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to check MFA status' });
    }
  });

  app.post('/api/auth/mfa/setup-totp', authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const user = await storage.getUser(authReq.user!.id);
      if (!user) throw new Error('User not found');

      const setup = await MFAService.generateTOTPSetup(user.id, user.email!);
      
      // Store temporary secret (not activated until verified)
      await storage.updateUser(user.id, { 
        tempTotpSecret: setup.secret,
        tempBackupCodes: setup.backupCodes 
      });

      res.json({
        secret: setup.secret,
        qrCodeUrl: setup.qrCodeUrl
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to setup TOTP' });
    }
  });

  app.post('/api/auth/mfa/verify-totp', authenticateLocal, async (req, res) => {
    try {
      const { code, secret } = req.body;
      const authReq = req as LocalAuthRequest;
      const user = await storage.getUser(authReq.user!.id);
      
      if (!user || !user.tempTotpSecret) {
        throw new Error('No pending TOTP setup');
      }

      const isValid = MFAService.verifyTOTP(code, secret || user.tempTotpSecret);
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Activate TOTP
      await storage.updateUser(user.id, {
        totpSecret: user.tempTotpSecret,
        backupCodes: user.tempBackupCodes,
        tempTotpSecret: null,
        tempBackupCodes: null
      });

      res.json({
        success: true,
        backupCodes: user.tempBackupCodes?.map(code => ({ code, used: false }))
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/mfa/backup-codes', authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const newCodes = MFAService.generateBackupCodes();
      await storage.updateUser(authReq.user!.id, { backupCodes: newCodes });

      res.json({
        codes: newCodes.map(code => ({ code, used: false }))
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate backup codes' });
    }
  });

  app.post('/api/auth/mfa/disable', authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      await storage.updateUser(authReq.user!.id, {
        totpSecret: null,
        smsNumber: null,
        backupCodes: null,
        tempTotpSecret: null,
        tempBackupCodes: null
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to disable MFA' });
    }
  });

  // Auth routes (for OAuth fallback)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Contacts routes
  app.get("/api/contacts", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      console.log("🔧 Fetching contacts for user:", authReq.user!.id);
      const userId = authReq.user!.id;
      const { search, searchBy, status } = req.query;
      
      let contacts;
      if (search) {
        console.log("🔧 Searching contacts with query:", search, "by:", searchBy || 'name');
        contacts = await storage.searchContacts(search as string, userId, searchBy as string);
      } else if (status) {
        console.log("🔧 Fetching contacts by status:", status);
        contacts = await storage.getContactsByStatus(status as string, userId);
      } else {
        console.log("🔧 Fetching all contacts");
        contacts = await storage.getContacts(userId);
      }
      
      console.log("✅ Contacts fetched:", contacts.length);
      res.json(contacts);
    } catch (error: any) {
      console.error("❌ Failed to fetch contacts:", error);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({ message: "Failed to fetch contacts", error: error.message });
    }
  });

  app.get("/api/contacts/:id", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const userId = authReq.user!.id;
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id, userId);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      console.log("🔧 Creating contact for user:", authReq.user!.id);
      console.log("🔧 Raw request body:", JSON.stringify(req.body, null, 2));
      console.log("🔧 Body field types:", Object.entries(req.body).map(([key, value]) => `${key}: ${typeof value} (${JSON.stringify(value)})`));
      
      const userId = authReq.user!.id;
      const user = authReq.user!;
      
      // Check contact limit for free users (no active subscription)
      const hasActiveSubscription = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
      if (!hasActiveSubscription) {
        const existingContacts = await storage.getContacts(userId);
        if (existingContacts.length >= 5) {
          return res.status(403).json({ 
            message: "Free plan is limited to 5 connections. Upgrade to Membership for unlimited connections.",
            code: "CONTACT_LIMIT_REACHED"
          });
        }
      }
      
      const validatedData = insertContactSchema.parse(req.body);
      console.log("🔧 Validated data:", JSON.stringify(validatedData, null, 2));
      
      // Convert birthday string to Date object if present
      if (validatedData.birthday && typeof validatedData.birthday === 'string') {
        validatedData.birthday = new Date(validatedData.birthday);
        console.log("🔧 Converted birthday to Date:", validatedData.birthday);
      }

      // Convert anniversary date string to Date object if present
      if (validatedData.anniversaryDate && typeof validatedData.anniversaryDate === 'string') {
        validatedData.anniversaryDate = new Date(validatedData.anniversaryDate);
        console.log("🔧 Converted anniversary date to Date:", validatedData.anniversaryDate);
      }
      
      const contact = await storage.createContact({ ...validatedData, userId });
      console.log("✅ Contact created:", contact);

      // Track analytics event (anonymized)
      await AnalyticsService.trackEvent(userId, EventTypes.CONTACT_CREATED, {
        relationshipStatus: contact.relationshipStatus,
        hasAge: !!contact.age,
        hasBirthday: !!contact.birthday,
        hasAnniversary: !!contact.anniversaryDate,
        isPriority: contact.isPriority,
        timeOfDay: new Date()
      });

      // Automatically create reminders for birthday and anniversary
      await createAutoReminders(contact, userId);
      
      res.status(201).json(contact);
    } catch (error) {
      console.error("❌ Failed to create contact:", error);
      console.error("❌ Error stack:", error.stack);
      
      if (error instanceof z.ZodError) {
        console.error("❌ Detailed validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contact", error: error.message });
    }
  });

  app.put("/api/contacts/:id", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      console.log("🔧 Updating contact for user:", authReq.user!.id);
      console.log("🔧 Contact ID:", req.params.id);
      console.log("🔧 Raw request body:", JSON.stringify(req.body, null, 2));
      console.log("🔧 Body field types:", Object.entries(req.body).map(([key, value]) => `${key}: ${typeof value} (${JSON.stringify(value)})`));
      
      const userId = authReq.user!.id;
      const id = parseInt(req.params.id);
      const validatedData = insertContactSchema.partial().parse(req.body);
      console.log("🔧 Validated data:", JSON.stringify(validatedData, null, 2));
      
      // Convert birthday string to Date object if present
      if (validatedData.birthday && typeof validatedData.birthday === 'string') {
        validatedData.birthday = new Date(validatedData.birthday);
        console.log("🔧 Converted birthday to Date:", validatedData.birthday);
      }

      // Convert anniversary date string to Date object if present
      if (validatedData.anniversaryDate && typeof validatedData.anniversaryDate === 'string') {
        validatedData.anniversaryDate = new Date(validatedData.anniversaryDate);
        console.log("🔧 Converted anniversary date to Date:", validatedData.anniversaryDate);
      }
      
      const contact = await storage.updateContact(id, userId, validatedData);
      console.log("✅ Contact updated:", contact);

      // Update automatic reminders for birthday and anniversary
      if (contact) {
        await updateAutoReminders(contact, userId, validatedData);
      }
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error: any) {
      console.error("❌ Failed to update contact:", error);
      console.error("❌ Error stack:", error.stack);
      
      if (error instanceof z.ZodError) {
        console.error("❌ Detailed validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update contact", error: error.message });
    }
  });

  app.delete("/api/contacts/:id", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const userId = authReq.user!.id;
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContact(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Timeline routes
  app.get("/api/contacts/:id/timeline", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const userId = authReq.user!.id;
      const contactId = parseInt(req.params.id);
      const entries = await storage.getTimelineEntries(contactId, userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline entries" });
    }
  });

  app.post("/api/timeline", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      console.log("🔧 Creating timeline entry for user:", authReq.user!.id);
      console.log("🔧 Raw timeline request body:", JSON.stringify(req.body, null, 2));
      console.log("🔧 Timeline body field types:", Object.entries(req.body).map(([key, value]) => `${key}: ${typeof value} (${JSON.stringify(value)})`));
      
      const userId = authReq.user!.id;
      const validatedData = insertTimelineEntrySchema.parse(req.body);
      console.log("🔧 Validated timeline data:", JSON.stringify(validatedData, null, 2));
      
      // Convert date string to Date object if present
      if (validatedData.date && typeof validatedData.date === 'string') {
        validatedData.date = new Date(validatedData.date);
        console.log("🔧 Converted timeline date to Date:", validatedData.date);
      }
      
      const entry = await storage.createTimelineEntry({ ...validatedData, userId });
      console.log("✅ Timeline entry created:", entry);
      
      res.status(201).json(entry);
    } catch (error: any) {
      console.error("❌ Failed to create timeline entry:", error);
      console.error("❌ Timeline error stack:", error.stack);
      
      if (error instanceof z.ZodError) {
        console.error("❌ Detailed timeline validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid timeline data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timeline entry", error: error.message });
    }
  });

  app.delete("/api/timeline/:id", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const userId = authReq.user!.id;
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTimelineEntry(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Timeline entry not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete timeline entry" });
    }
  });

  // Reminders routes
  app.get("/api/reminders", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      console.log("🔧 Fetching reminders for user:", authReq.user?.id);
      const userId = authReq.user!.id;
      const { upcoming } = req.query;
      
      let reminders;
      if (upcoming === "true") {
        reminders = await storage.getUpcomingReminders(userId);
      } else {
        reminders = await storage.getUserReminders(userId);
      }
      console.log("✅ Reminders fetched:", reminders.length);
      
      // Enrich reminders with contact names
      const contacts = await storage.getContacts(userId);
      const contactMap = new Map(contacts.map(c => [c.id, c.name]));
      
      const enrichedReminders = reminders.map(r => ({
        ...r,
        contactName: contactMap.get(r.contactId) || 'Unknown Contact'
      }));
      
      res.json(enrichedReminders);
    } catch (error: any) {
      console.error("❌ Reminders error:", error.message);
      console.error("❌ Reminders error stack:", error.stack);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.get("/api/contacts/:id/reminders", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const userId = authReq.user!.id;
      const contactId = parseInt(req.params.id);
      const reminders = await storage.getContactReminders(contactId, userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact reminders" });
    }
  });

  app.post("/api/reminders", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      console.log("🔧 Creating reminder for user:", authReq.user!.id);
      console.log("🔧 Raw reminder request body:", JSON.stringify(req.body, null, 2));
      console.log("🔧 Reminder body field types:", Object.entries(req.body).map(([key, value]) => `${key}: ${typeof value} (${JSON.stringify(value)})`));
      
      const userId = authReq.user!.id;
      const validatedData = insertReminderSchema.parse(req.body);
      console.log("🔧 Validated reminder data:", JSON.stringify(validatedData, null, 2));
      
      // Convert dueDate string to Date object if present
      if (validatedData.dueDate && typeof validatedData.dueDate === 'string') {
        validatedData.dueDate = new Date(validatedData.dueDate);
        console.log("🔧 Converted reminder dueDate to Date:", validatedData.dueDate);
      }
      
      const reminder = await storage.createReminder({ ...validatedData, userId });
      console.log("✅ Reminder created:", reminder);

      // Track analytics event (anonymized)
      await AnalyticsService.trackEvent(userId, EventTypes.REMINDER_CREATED, {
        reminderType: reminder.type,
        timeOfDay: new Date()
      });
      
      res.status(201).json(reminder);
    } catch (error: any) {
      console.error("❌ Failed to create reminder:", error);
      console.error("❌ Reminder error stack:", error.stack);
      
      if (error instanceof z.ZodError) {
        console.error("❌ Detailed reminder validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.put("/api/reminders/:id", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const userId = authReq.user!.id;
      const id = parseInt(req.params.id);
      const validatedData = insertReminderSchema.partial().parse(req.body);
      const reminder = await storage.updateReminder(id, userId, validatedData);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  app.put("/api/reminders/:id/complete", authenticateLocal, async (req: LocalAuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id);
      const { notes } = req.body || {};
      
      // Get the reminder details before completing
      const reminder = await storage.getReminder(id, userId);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      const completed = await storage.completeReminder(id, userId);
      
      if (!completed) {
        return res.status(404).json({ message: "Failed to complete reminder" });
      }

      // Create a timeline entry if notes were provided
      if (notes && notes.trim()) {
        const timelineEntryType = reminder.type === 'call' ? 'call' : 
                                  reminder.type === 'text' ? 'text' :
                                  reminder.type === 'date' ? 'date' :
                                  reminder.type === 'meeting' ? 'meeting' : 'note';
        
        await storage.createTimelineEntry({
          contactId: reminder.contactId,
          userId: userId,
          title: `${reminder.title} (Completed)`,
          description: notes.trim(),
          type: timelineEntryType,
          date: new Date(),
        });
      }

      // Track analytics event (anonymized)
      try {
        await AnalyticsService.trackEvent(userId, "reminder_completed", {
          timeOfDay: new Date().getHours() < 12 ? "morning" : "evening",
          hasNotes: !!notes
        });
      } catch (analyticsError) {
        // Analytics failure shouldn't block the main functionality
        console.warn("Analytics tracking failed:", analyticsError);
      }
      
      res.status(204).send();
    } catch (error: any) {
      console.error("❌ Failed to complete reminder:", error);
      res.status(500).json({ message: "Failed to complete reminder" });
    }
  });

  app.delete("/api/reminders/:id", authenticateLocal, async (req: LocalAuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteReminder(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Object Storage routes
  
  // Serve public objects
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve private objects with authentication and ACL check
  app.get("/objects/:objectPath(*)", async (req, res) => {
    // Check for token in query params or authorization header
    let userId: string | undefined;
    
    const authHeader = req.headers.authorization?.replace('Bearer ', '');
    const tokenFromQuery = req.query.token as string;
    const token = authHeader || tokenFromQuery;
    
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        userId = decoded.userId;
      } catch (error) {
        console.log("🔧 Invalid token format");
      }
    }
    
    console.log("🔧 Object request:", { 
      path: req.path, 
      params: req.params, 
      userId,
      objectPath: req.params.objectPath,
      hasToken: !!token
    });
    
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        console.log("🔧 Access denied for object:", req.path);
        return res.sendStatus(401);
      }
      console.log("✅ Serving object:", req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("❌ Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for object entity
  app.post("/api/objects/upload", authenticateLocal, async (req: LocalAuthRequest, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Update object ACL after upload (for contact attachments)
  app.put("/api/contact-attachments", authenticateLocal, async (req: LocalAuthRequest, res) => {
    if (!req.body.attachmentURL) {
      return res.status(400).json({ error: "attachmentURL is required" });
    }

    const userId = req.user!.id;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.attachmentURL,
        {
          owner: userId,
          // Contact attachments are private by default
          visibility: "private",
          // Only the owner can access their contact attachments
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error: any) {
      console.error("Error setting contact attachment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Upload base64 photo (for vCard import)
  app.post("/api/upload-base64-photo", authenticateLocal, async (req: LocalAuthRequest, res) => {
    const { base64Data, imageType } = req.body;
    
    if (!base64Data) {
      return res.status(400).json({ error: "base64Data is required" });
    }

    const userId = req.user!.id;

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Validate it's a reasonable image size (between 100 bytes and 10MB)
      if (buffer.length < 100 || buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Invalid image size" });
      }

      // Detect image type from magic bytes (MIME sniffing)
      const detectedType = detectImageType(buffer);
      if (!detectedType) {
        return res.status(400).json({ error: "Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed." });
      }

      const contentType = `image/${detectedType}`;

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.uploadBuffer(buffer, contentType, userId);

      res.json({ objectPath });
    } catch (error: any) {
      console.error("Error uploading base64 photo:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });

  // Helper function to detect image type from magic bytes
  function detectImageType(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;

    // JPEG: FFD8FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'jpeg';
    }
    // PNG: 89504E47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'png';
    }
    // GIF: 47494638
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return 'gif';
    }
    // WebP: 52494646....57454250
    if (buffer.length >= 12 && 
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return 'webp';
    }

    return null;
  }

  // Stripe subscription route
  app.post("/api/create-subscription", authenticateLocal, async (req: LocalAuthRequest, res) => {
    try {
      const { priceId } = req.body;
      const userId = req.user!.id;
      
      console.log('🔧 Creating subscription:', { userId, priceId });
      
      if (!priceId) {
        console.log('🔧 Missing price ID');
        return res.status(400).json({ error: "Price ID is required" });
      }

      // Get or create Stripe customer
      let user = await storage.getUser(userId);
      console.log('🔧 User found:', { id: user?.id, email: user?.email, hasStripeCustomer: !!user?.stripeCustomerId });
      
      let customerId = user?.stripeCustomerId;
      
      if (!customerId) {
        console.log('🔧 Creating new Stripe customer');
        const customerData: any = {
          metadata: {
            userId: userId
          }
        };
        
        // Add email if available
        if (user?.email) {
          customerData.email = user.email;
        }
        
        const customer = await stripe.customers.create(customerData);
        customerId = customer.id;
        console.log('🔧 Created Stripe customer:', customerId);
        
        // Update user with Stripe customer ID
        await storage.updateUser(userId, { stripeCustomerId: customerId });
        console.log('🔧 Updated user with Stripe customer ID');
      }

      // For trial subscriptions, we need to create a setup intent to collect payment method
      console.log('🔧 Creating setup intent for trial subscription');
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: {
          priceId: priceId,
          userId: userId
        }
      });

      console.log('🔧 Setup intent created:', { 
        id: setupIntent.id, 
        status: setupIntent.status,
        hasClientSecret: !!setupIntent.client_secret
      });

      // Create subscription in trialing status (will be activated when payment method is attached)
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        trial_period_days: 7, // 7-day free trial
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        }
      });

      console.log('🔧 Subscription created:', { 
        id: subscription.id, 
        status: subscription.status
      });

      // Update user with subscription ID
      await storage.updateUser(userId, { 
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status
      });

      res.json({
        subscriptionId: subscription.id,
        setupIntentId: setupIntent.id,
        clientSecret: setupIntent.client_secret,
      });
    } catch (error: any) {
      console.error("🔧 Subscription creation error:", error);
      res.status(500).json({ error: error.message || "Failed to create subscription" });
    }
  });

  // Create Stripe billing portal session
  app.post("/api/create-billing-portal", authenticateLocal, async (req: LocalAuthRequest, res) => {
    try {
      const userId = req.user!.id;
      console.log('🔧 Creating billing portal for user:', userId);
      
      // Get user's Stripe customer ID
      const user = await storage.getUser(userId);
      if (!user?.stripeCustomerId) {
        console.log('🔧 No Stripe customer ID found for user');
        return res.status(400).json({ error: "No billing account found" });
      }

      console.log('🔧 Creating portal session for customer:', user.stripeCustomerId);
      
      // Create a basic billing portal session without custom configuration
      // This will use Stripe's default portal with basic billing features
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.headers.origin}/profile`,
      });

      console.log('✅ Portal session created:', portalSession.id);
      
      res.json({ 
        url: portalSession.url,
        success: true 
      });
      
    } catch (error: any) {
      console.error('🔧 Create billing portal error:', error.message);
      res.status(500).json({ 
        error: error.message,
        success: false 
      });
    }
  });

  // User statistics route
  app.get("/api/user/stats", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const userId = authReq.user!.id;
      console.log("🔧 Fetching user stats for:", userId);
      
      const stats = await storage.getUserStats(userId);
      console.log("✅ User stats fetched:", stats);
      
      res.json(stats);
    } catch (error: any) {
      console.error("❌ Failed to fetch user stats:", error);
      res.status(500).json({ message: "Failed to fetch user statistics", error: error.message });
    }
  });

  // Export user data route
  app.get("/api/user/export", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const userId = authReq.user!.id;
      console.log("🔧 Exporting user data for:", userId);
      
      const exportData = await storage.exportUserData(userId);
      console.log("✅ User data exported successfully");
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="velvetlog-data-export.json"');
      
      res.json(exportData);
    } catch (error: any) {
      console.error("❌ Failed to export user data:", error);
      res.status(500).json({ message: "Failed to export user data", error: error.message });
    }
  });

  // Update user profile route
  app.put("/api/user/profile", authenticateLocal, async (req, res) => {
    try {
      const authReq = req as LocalAuthRequest;
      const userId = authReq.user!.id;
      console.log("🔧 Updating user profile for:", userId);
      console.log("🔧 Profile updates:", req.body);
      
      const updates = req.body;
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("✅ User profile updated successfully");
      res.json(updatedUser);
    } catch (error: any) {
      console.error("❌ Failed to update user profile:", error);
      res.status(500).json({ message: "Failed to update user profile", error: error.message });
    }
  });

  // Contact form submission (public - no auth required)
  app.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, message } = req.body;
      
      if (!firstName || !lastName || !email || !phone || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      if (message.length < 100) {
        return res.status(400).json({ message: "Message must be at least 100 characters" });
      }
      
      // Save to database as backup
      await db.insert(contactSubmissions).values({
        firstName,
        lastName,
        email,
        phone,
        message,
      });
      
      // Web3Forms email is sent from the frontend to avoid Cloudflare blocking
      console.log("✅ Contact form submission saved to database");
      res.json({ success: true, message: "Message sent successfully" });
    } catch (error: any) {
      console.error("❌ Failed to save contact form submission:", error.message);
      res.status(500).json({ message: "Failed to send message. Please try again later." });
    }
  });

  // Register admin routes
  registerAdminRoutes(app);
  
  // Register referral routes
  registerReferralRoutes(app);

  const httpServer = createServer(app);
  
  // Start recurring reminder management
  // Run immediately on startup
  createNextYearReminders();
  
  // Then run every 24 hours (86400000 milliseconds)
  setInterval(createNextYearReminders, 24 * 60 * 60 * 1000);
  
  return httpServer;
}
