import crypto from "crypto";
import { storage } from "./storage";
import type { InsertAnalyticsEvent } from "@shared/schema";

/**
 * Hash a user ID for privacy-preserving analytics
 * Uses SHA-256 with a salt to anonymize user identities
 */
function hashUserId(userId: string): string {
  const salt = process.env.ANALYTICS_SALT || "velvetlog-analytics-salt-2025";
  return crypto.createHash("sha256").update(userId + salt).digest("hex");
}

/**
 * Analytics service for tracking user behavior patterns
 * All data is anonymized and privacy-focused
 */
export class AnalyticsService {
  /**
   * Track a user event with anonymized data
   */
  static async trackEvent(
    userId: string,
    eventType: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Hash the user ID for privacy
      const hashedUserId = hashUserId(userId);
      
      // Remove any personally identifiable information from metadata
      const sanitizedMetadata = AnalyticsService.sanitizeMetadata(metadata);
      
      const event: InsertAnalyticsEvent = {
        userId: hashedUserId,
        eventType,
        metadata: sanitizedMetadata,
      };
      
      await storage.createAnalyticsEvent(event);
    } catch (error) {
      // Fail silently to not impact user experience
      console.warn("Analytics tracking failed:", error);
    }
  }
  
  /**
   * Remove personally identifiable information from metadata
   */
  private static sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      // Skip sensitive fields
      if (AnalyticsService.isSensitiveField(key)) {
        continue;
      }
      
      // Convert specific data to categories
      if (key === "relationshipStatus") {
        sanitized[key] = value; // This is already categorical
      } else if (key === "contactAge") {
        sanitized["ageGroup"] = AnalyticsService.categorizeAge(value);
      } else if (key === "timeOfDay") {
        sanitized[key] = AnalyticsService.categorizeTimeOfDay(new Date());
      } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  /**
   * Check if a field contains sensitive information
   */
  private static isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      "name", "email", "phone", "instagram", "location", 
      "notes", "description", "title", "whereYouMet"
    ];
    return sensitiveFields.includes(fieldName);
  }
  
  /**
   * Categorize age into groups for privacy
   */
  private static categorizeAge(age: number | null): string {
    if (!age) return "unknown";
    if (age < 25) return "18-24";
    if (age < 35) return "25-34";
    if (age < 45) return "35-44";
    if (age < 55) return "45-54";
    return "55+";
  }
  
  /**
   * Categorize time of day for pattern analysis
   */
  private static categorizeTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }
}

// Common event types for consistency
export const EventTypes = {
  // Contact events
  CONTACT_CREATED: "contact_created",
  CONTACT_UPDATED: "contact_updated",
  CONTACT_DELETED: "contact_deleted",
  
  // Timeline events
  TIMELINE_ENTRY_ADDED: "timeline_entry_added",
  TIMELINE_ENTRY_DELETED: "timeline_entry_deleted",
  
  // Reminder events
  REMINDER_CREATED: "reminder_created",
  REMINDER_COMPLETED: "reminder_completed",
  REMINDER_DELETED: "reminder_deleted",
  
  // Relationship events
  RELATIONSHIP_STATUS_CHANGED: "relationship_status_changed",
  PRIORITY_TOGGLED: "priority_toggled",
  
  // User engagement
  DAILY_LOGIN: "daily_login",
  FEATURE_USED: "feature_used",
  SEARCH_PERFORMED: "search_performed",
} as const;