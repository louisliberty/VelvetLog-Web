import { 
  users,
  contacts, 
  timelineEntries, 
  reminders,
  analyticsEvents,
  referrals,
  type User,
  type UpsertUser,
  type Contact, 
  type InsertContact,
  type TimelineEntry,
  type InsertTimelineEntry,
  type Reminder,
  type InsertReminder,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type Referral,
  type InsertReferral
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or, desc, asc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByBiometric(credentialId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createLocalUser(userData: any): Promise<User>;
  updateUserLastLogin(userId: string): Promise<void>;
  updateUserBiometric(userId: string, credentialId: string): Promise<void>;
  updateUser(userId: string, updates: any): Promise<User | undefined>;
  
  // Contacts
  getContacts(userId: string): Promise<Contact[]>;
  getContact(id: number, userId: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact & { userId: string; tags?: string[] }): Promise<Contact>;
  updateContact(id: number, userId: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number, userId: string): Promise<boolean>;
  searchContacts(query: string, userId: string): Promise<Contact[]>;
  getContactsByStatus(status: string, userId: string): Promise<Contact[]>;
  getContactsByTags(tags: string[], userId: string): Promise<Contact[]>;
  
  // Timeline
  getTimelineEntries(contactId: number, userId: string): Promise<TimelineEntry[]>;
  createTimelineEntry(entry: InsertTimelineEntry & { userId: string }): Promise<TimelineEntry>;
  deleteTimelineEntry(id: number, userId: string): Promise<boolean>;
  
  // Reminders
  getReminders(contactId: number, userId: string): Promise<Reminder[]>;
  getReminder(id: number, userId: string): Promise<Reminder | undefined>;
  getUserReminders(userId: string): Promise<Reminder[]>;
  getAllReminders(): Promise<Reminder[]>;
  getUpcomingReminders(userId: string): Promise<Reminder[]>;
  getContactReminders(contactId: number, userId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder & { userId: string }): Promise<Reminder>;
  updateReminder(id: number, userId: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number, userId: string): Promise<boolean>;
  completeReminder(id: number, userId: string): Promise<boolean>;
  
  // Analytics
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  
  // Admin operations
  getAllUsersAdmin(): Promise<User[]>;
  getAllContactsAdmin(): Promise<Contact[]>;
  getAllRemindersAdmin(): Promise<Reminder[]>;
  getTotalInteractionsAdmin(): Promise<number>;
  
  // Referral operations
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createReferral(referral: any): Promise<any>;
  getUserReferrals(userId: string): Promise<any[]>;
  updateReferralStatus(referralId: string, updates: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Case-insensitive email lookup
    const [user] = await db.select().from(users).where(
      sql`LOWER(${users.email}) = LOWER(${email})`
    );
    return user;
  }

  async getUserByBiometric(credentialId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.biometricCredentialId, credentialId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createLocalUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserBiometric(userId: string, credentialId: string): Promise<void> {
    await db
      .update(users)
      .set({ biometricCredentialId: credentialId, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUser(userId: string, updates: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Contacts
  async getContacts(userId: string): Promise<Contact[]> {
    return await db.select()
      .from(contacts)
      .where(eq(contacts.userId, userId))
      .orderBy(desc(contacts.createdAt));
  }

  async getContact(id: number, userId: string): Promise<Contact | undefined> {
    const [contact] = await db.select()
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
    return contact;
  }

  async createContact(contactData: InsertContact & { userId: string }): Promise<Contact> {
    // Convert string dates to Date objects before insertion
    const processedData = { ...contactData };
    if (processedData.birthday && typeof processedData.birthday === 'string') {
      processedData.birthday = new Date(processedData.birthday);
    }
    if (processedData.anniversaryDate && typeof processedData.anniversaryDate === 'string') {
      processedData.anniversaryDate = new Date(processedData.anniversaryDate);
    }
    
    const [contact] = await db
      .insert(contacts)
      .values([processedData])
      .returning();
    return contact;
  }

  async updateContact(id: number, userId: string, updates: Partial<InsertContact>): Promise<Contact | undefined> {
    // Convert string dates to Date objects before update
    const processedUpdates = { ...updates };
    if (processedUpdates.birthday && typeof processedUpdates.birthday === 'string') {
      processedUpdates.birthday = new Date(processedUpdates.birthday);
    }
    if (processedUpdates.anniversaryDate && typeof processedUpdates.anniversaryDate === 'string') {
      processedUpdates.anniversaryDate = new Date(processedUpdates.anniversaryDate);
    }
    
    const [contact] = await db
      .update(contacts)
      .set(processedUpdates)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
      .returning();
    return contact;
  }

  async deleteContact(id: number, userId: string): Promise<boolean> {
    // Delete related timeline entries and reminders first
    await db.delete(timelineEntries).where(and(eq(timelineEntries.contactId, id), eq(timelineEntries.userId, userId)));
    await db.delete(reminders).where(and(eq(reminders.contactId, id), eq(reminders.userId, userId)));
    
    const result = await db
      .delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async searchContacts(query: string, userId: string, searchBy: string = 'name'): Promise<Contact[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    
    let searchCondition;
    switch (searchBy) {
      case 'location':
        searchCondition = sql`LOWER(${contacts.location}) LIKE ${lowercaseQuery}`;
        break;
      case 'datingStatus':
        searchCondition = sql`LOWER(${contacts.datingStatus}) LIKE ${lowercaseQuery}`;
        break;
      case 'name':
      default:
        searchCondition = sql`LOWER(${contacts.name}) LIKE ${lowercaseQuery}`;
        break;
    }
    
    return await db.select()
      .from(contacts)
      .where(and(
        eq(contacts.userId, userId),
        searchCondition
      ))
      .orderBy(asc(contacts.name));
  }

  async getContactsByStatus(status: string, userId: string): Promise<Contact[]> {
    return await db.select()
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.relationshipStatus, status)))
      .orderBy(desc(contacts.createdAt));
  }

  async getContactsByTags(tags: string[], userId: string): Promise<Contact[]> {
    if (!tags.length) return [];
    
    // Use SQL to check if any of the provided tags overlap with the contact's tags array
    const tagConditions = tags.map(tag => sql`${contacts.tags} @> ARRAY[${tag}]::text[]`);
    const condition = tagConditions.reduce((acc, tagCondition) => 
      acc ? sql`${acc} OR ${tagCondition}` : tagCondition
    );
    
    return await db.select()
      .from(contacts)
      .where(and(eq(contacts.userId, userId), condition))
      .orderBy(desc(contacts.createdAt));
  }

  // Timeline
  async getTimelineEntries(contactId: number, userId: string): Promise<TimelineEntry[]> {
    return await db.select()
      .from(timelineEntries)
      .where(and(eq(timelineEntries.contactId, contactId), eq(timelineEntries.userId, userId)))
      .orderBy(desc(timelineEntries.date));
  }

  async createTimelineEntry(entryData: InsertTimelineEntry & { userId: string }): Promise<TimelineEntry> {
    // Convert string date to Date object before insertion
    const processedData = { ...entryData };
    if (processedData.date && typeof processedData.date === 'string') {
      processedData.date = new Date(processedData.date);
    }
    
    const [entry] = await db
      .insert(timelineEntries)
      .values([processedData])
      .returning();

    // Update last contact date
    await db
      .update(contacts)
      .set({ lastContactDate: processedData.date })
      .where(and(eq(contacts.id, entryData.contactId), eq(contacts.userId, entryData.userId)));

    return entry;
  }

  async deleteTimelineEntry(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(timelineEntries)
      .where(and(eq(timelineEntries.id, id), eq(timelineEntries.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Reminders
  async getReminders(contactId: number, userId: string): Promise<Reminder[]> {
    return await db.select()
      .from(reminders)
      .where(and(eq(reminders.contactId, contactId), eq(reminders.userId, userId)))
      .orderBy(asc(reminders.dueDate));
  }

  async getReminder(id: number, userId: string): Promise<Reminder | undefined> {
    const [reminder] = await db.select()
      .from(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
    return reminder;
  }

  async getAllReminders(): Promise<Reminder[]> {
    return await db.select()
      .from(reminders)
      .orderBy(asc(reminders.dueDate));
  }

  async getUpcomingReminders(userId: string): Promise<Reminder[]> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return await db.select()
      .from(reminders)
      .where(and(
        eq(reminders.userId, userId),
        eq(reminders.isCompleted, false),
        and(
          gte(reminders.dueDate, now),
          lte(reminders.dueDate, thirtyDaysFromNow)
        )
      ))
      .orderBy(asc(reminders.dueDate));
  }

  async getContactReminders(contactId: number, userId: string): Promise<Reminder[]> {
    return await db.select()
      .from(reminders)
      .where(and(eq(reminders.contactId, contactId), eq(reminders.userId, userId)))
      .orderBy(asc(reminders.dueDate));
  }

  async createReminder(reminderData: InsertReminder & { userId: string }): Promise<Reminder> {
    // Convert string date to Date object before insertion
    const processedData = { ...reminderData };
    if (processedData.dueDate && typeof processedData.dueDate === 'string') {
      processedData.dueDate = new Date(processedData.dueDate);
    }
    
    const [reminder] = await db
      .insert(reminders)
      .values([processedData])
      .returning();
    return reminder;
  }

  async updateReminder(id: number, userId: string, updates: Partial<InsertReminder>): Promise<Reminder | undefined> {
    // Convert string date to Date object before update
    const processedUpdates = { ...updates };
    if (processedUpdates.dueDate && typeof processedUpdates.dueDate === 'string') {
      processedUpdates.dueDate = new Date(processedUpdates.dueDate);
    }
    
    const [reminder] = await db
      .update(reminders)
      .set(processedUpdates)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return reminder;
  }

  async deleteReminder(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async completeReminder(id: number, userId: string): Promise<boolean> {
    const result = await db
      .update(reminders)
      .set({ isCompleted: true })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Analytics operations
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [analyticsEvent] = await db
      .insert(analyticsEvents)
      .values(event)
      .returning();
    return analyticsEvent;
  }

  // Admin operations
  async getAllUsersAdmin(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllContactsAdmin(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getAllRemindersAdmin(): Promise<Reminder[]> {
    return await db.select().from(reminders).orderBy(desc(reminders.createdAt));
  }

  async getTotalInteractionsAdmin(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(timelineEntries);
    return result[0]?.count || 0;
  }

  // Referral operations (using in-memory storage for now - implement with proper tables later)
  private referrals: any[] = [];

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    // For now, check if user has this referral code in their data
    const allUsers = await db.select().from(users);
    return allUsers.find(user => user.referralCode === referralCode);
  }

  async createReferral(referral: any): Promise<any> {
    const newReferral = {
      id: `ref_${Date.now()}`,
      ...referral,
      createdAt: new Date().toISOString()
    };
    this.referrals.push(newReferral);
    return newReferral;
  }

  async getUserReferrals(userId: string): Promise<any[]> {
    return this.referrals.filter(ref => ref.referrerId === userId);
  }

  async updateReferralStatus(referralId: string, updates: any): Promise<any> {
    const referralIndex = this.referrals.findIndex(ref => ref.id === referralId);
    if (referralIndex === -1) return null;
    
    this.referrals[referralIndex] = { ...this.referrals[referralIndex], ...updates };
    return this.referrals[referralIndex];
  }

  // User statistics operations
  async getUserStats(userId: string): Promise<{
    totalContacts: number;
    totalInteractions: number;
    activeReminders: number;
    accountAge: number;
  }> {
    // Get user's contacts count
    const userContacts = await db.select()
      .from(contacts)
      .where(eq(contacts.userId, userId));
    const totalContacts = userContacts.length;

    // Get user's total interactions (timeline entries)
    const userInteractions = await db.select({ count: sql<number>`count(*)` })
      .from(timelineEntries)
      .where(eq(timelineEntries.userId, userId));
    const totalInteractions = userInteractions[0]?.count || 0;

    // Get user's upcoming reminders (not completed, due within next 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const userActiveReminders = await db.select({ count: sql<number>`count(*)` })
      .from(reminders)
      .where(and(
        eq(reminders.userId, userId), 
        eq(reminders.isCompleted, false),
        gte(reminders.dueDate, now),
        lte(reminders.dueDate, sevenDaysFromNow)
      ));
    const activeReminders = userActiveReminders[0]?.count || 0;

    // Get account age (days since user created account)
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    let accountAge = 0;
    if (user.length > 0 && user[0].createdAt) {
      const createdDate = new Date(user[0].createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      accountAge = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    }

    return {
      totalContacts,
      totalInteractions,
      activeReminders,
      accountAge
    };
  }

  async getUserReminders(userId: string): Promise<Reminder[]> {
    return await db.select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(asc(reminders.dueDate));
  }

  // Export all user data
  async exportUserData(userId: string): Promise<{
    contacts: Contact[];
    timelineEntries: TimelineEntry[];
    reminders: Reminder[];
    user: User | undefined;
    exportedAt: string;
  }> {
    // Get user contacts
    const contacts = await this.getContacts(userId);
    
    // Get all timeline entries for the user
    const timelineEntriesData = await db.select()
      .from(timelineEntries)
      .where(eq(timelineEntries.userId, userId))
      .orderBy(desc(timelineEntries.date));
    
    // Get all reminders for the user
    const reminders = await this.getUserReminders(userId);
    
    // Get user profile
    const user = await this.getUser(userId);
    
    return {
      contacts,
      timelineEntries: timelineEntriesData,
      reminders,
      user,
      exportedAt: new Date().toISOString()
    };
  }
}

export const storage = new DatabaseStorage();
