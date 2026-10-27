import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"), // For local authentication
  salt: varchar("salt"), // For password hashing
  encryptionKey: varchar("encryption_key"), // User's data encryption key (encrypted)
  biometricCredentialId: varchar("biometric_credential_id"), // For biometric auth
  totpSecret: varchar("totp_secret"), // For 2FA TOTP
  smsNumber: varchar("sms_number"), // For SMS 2FA
  backupCodes: text("backup_codes").array(), // Recovery codes
  tempTotpSecret: varchar("temp_totp_secret"), // Temporary during setup
  tempBackupCodes: text("temp_backup_codes").array(), // Temporary during setup
  trustedDevices: jsonb("trusted_devices"), // Trusted device list
  isLocalAccount: boolean("is_local_account").default(false), // Distinguish local vs OAuth
  privacySettings: jsonb("privacy_settings"), // User privacy preferences
  backupEnabled: boolean("backup_enabled").default(false), // Cloud backup preference
  stripeCustomerId: varchar("stripe_customer_id"), // Stripe customer ID
  stripeSubscriptionId: varchar("stripe_subscription_id"), // Stripe subscription ID
  subscriptionStatus: varchar("subscription_status"), // active, trialing, past_due, canceled, etc.
  referralCode: varchar("referral_code"), // User's unique referral code
  availableCredits: integer("available_credits").default(0), // Referral credits
  bonusStorage: integer("bonus_storage").default(0), // Bonus storage from referrals
  freeMonths: integer("free_months").default(0), // Free months from referrals
  hasSeenWelcome: boolean("has_seen_welcome").default(false), // Welcome tutorial completed
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  age: integer("age"),
  birthday: timestamp("birthday"),
  email: text("email"),
  phone: text("phone"),
  location: text("location"), // Country, City, State
  job: text("job"), // Job title or profession
  instagram: text("instagram"), // Instagram username without @
  whereYouMet: text("where_you_met"), // Where the user met this contact
  relationshipStatus: text("relationship_status").default("dating"),
  datingStatus: text("dating_status"), // Additional dating status field
  anniversaryDate: timestamp("anniversary_date"), // First date anniversary (month/day only)
  isPriority: boolean("is_priority").default(false),
  photoUrl: text("photo_url"),
  lastContactDate: timestamp("last_contact_date"),
  notes: text("notes"),
  tags: text("tags").array().default([]), // Tags for categorization
  attachments: jsonb("attachments"), // File attachments as JSON array
  encryptedData: text("encrypted_data"), // Optional encrypted data field
  dataHash: varchar("data_hash"), // Optional hash for integrity verification
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Media attachments table
export const mediaAttachments = pgTable("media_attachments", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // image, document, audio, etc.
  fileSize: integer("file_size").notNull(),
  encryptedData: text("encrypted_data").notNull(), // Base64 encoded encrypted file
  encryptedMetadata: text("encrypted_metadata").notNull(), // Original filename, description
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sync queue for cross-device synchronization
export const syncQueue = pgTable("sync_queue", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  entityType: text("entity_type").notNull(), // contact, timeline, reminder, media
  entityId: integer("entity_id").notNull(),
  operation: text("operation").notNull(), // create, update, delete
  encryptedPayload: text("encrypted_payload").notNull(),
  syncStatus: text("sync_status").notNull().default("pending"), // pending, synced, failed
  deviceId: varchar("device_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  syncedAt: timestamp("synced_at"),
});

export const timelineEntries = pgTable("timeline_entries", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // call, text, date, meeting, note
  date: timestamp("date").notNull(),
  encryptedData: text("encrypted_data"), // Optional encrypted data field
  dataHash: varchar("data_hash"), // Optional hash for integrity verification
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // call, text, date, birthday, anniversary
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  encryptedData: text("encrypted_data"), // Optional encrypted data field
  dataHash: varchar("data_hash"), // Optional hash for integrity verification
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Analytics events table for basic usage tracking
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Hashed for privacy
  eventType: text("event_type").notNull(), // contact_created, reminder_set, timeline_added, etc.
  metadata: jsonb("metadata"), // Additional event context (anonymized)
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Referrals table for tracking referrals
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  refereeId: varchar("referee_id").references(() => users.id),
  referralCode: varchar("referral_code").notNull(),
  status: varchar("status").default("pending"), // pending, completed, expired
  rewardGranted: boolean("reward_granted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertContactSchema = createInsertSchema(contacts)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
  })
  .extend({
    birthday: z.union([z.date(), z.string(), z.null()]).optional(),
    anniversaryDate: z.union([z.date(), z.string(), z.null()]).optional(),
    phone: z.string().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      // Allow international phone numbers with country codes, spaces, dashes, parentheses
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,25}$/;
      return phoneRegex.test(val.trim());
    }, {
      message: "Please enter a valid phone number (7-25 characters, may include +, spaces, dashes, parentheses)"
    }),
  });

export const insertTimelineEntrySchema = createInsertSchema(timelineEntries)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
  })
  .extend({
    date: z.union([z.date(), z.string()]),
  });

export const insertReminderSchema = createInsertSchema(reminders)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
  })
  .extend({
    dueDate: z.union([z.date(), z.string()]),
  });

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents)
  .omit({
    id: true,
    timestamp: true,
  });

export const insertReferralSchema = createInsertSchema(referrals)
  .omit({
    id: true,
    createdAt: true,
  });

// Contact form submissions table (for public contact form)
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions)
  .omit({
    id: true,
    isRead: true,
    createdAt: true,
  });

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type TimelineEntry = typeof timelineEntries.$inferSelect;
export type InsertTimelineEntry = z.infer<typeof insertTimelineEntrySchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
