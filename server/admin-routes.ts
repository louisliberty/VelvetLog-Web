import type { Express } from "express";
import { storage } from "./storage";

export function registerAdminRoutes(app: Express) {
  // Admin authentication middleware (implement proper admin auth)
  const requireAdminAuth = (req: any, res: any, next: any) => {
    // In production, implement proper admin authentication
    // For now, just check if user exists and is admin
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Admin authentication required" });
    }
    
    // Check if user has admin privileges (implement your admin logic)
    // This is a placeholder - implement proper admin role checking
    const isAdmin = req.user?.email === "admin@velvetlog.com"; // Example admin check
    
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    next();
  };

  // Get admin dashboard statistics
  app.get("/api/admin/stats", requireAdminAuth, async (req, res) => {
    try {
      // Get all users (admin only)
      const allUsers = await storage.getAllUsersAdmin();
      
      // Calculate user statistics
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const userStats = {
        total: allUsers.length,
        active_daily: allUsers.filter(u => new Date(u.lastActive || 0) > dayAgo).length,
        active_weekly: allUsers.filter(u => new Date(u.lastActive || 0) > weekAgo).length,
        active_monthly: allUsers.filter(u => new Date(u.lastActive || 0) > monthAgo).length,
        new_signups_today: allUsers.filter(u => new Date(u.createdAt || 0) > dayAgo).length,
        new_signups_week: allUsers.filter(u => new Date(u.createdAt || 0) > weekAgo).length,
      };

      // Get all contacts for storage calculations
      const allContacts = await storage.getAllContactsAdmin();
      
      // Calculate storage statistics
      let totalPhotos = 0;
      let totalVideos = 0;
      let totalStorageGB = 0;
      
      allContacts.forEach(contact => {
        // Count media files (this would need to be implemented based on your file storage)
        if (contact.profilePhotoUrl) totalPhotos++;
        // Add logic for videos and calculate actual storage usage
        totalStorageGB += 0.1; // Placeholder - implement actual storage calculation
      });

      const storageStats = {
        total_used_gb: totalStorageGB,
        total_allocated_gb: allUsers.length * 2, // Assuming 2GB per user average allocation
        photos_count: totalPhotos,
        videos_count: totalVideos,
        average_per_user_gb: totalStorageGB / Math.max(allUsers.length, 1),
      };

      // Database statistics
      const allReminders = await storage.getAllRemindersAdmin();
      const totalInteractions = await storage.getTotalInteractionsAdmin();
      
      const databaseStats = {
        total_contacts: allContacts.length,
        total_interactions: totalInteractions,
        total_reminders: allReminders.length,
        db_size_mb: Math.round((allContacts.length * 0.5 + allReminders.length * 0.2) * 10) / 10,
        query_performance_ms: 25.0, // This would come from actual performance monitoring
      };

      // Revenue statistics (placeholder - implement with actual billing data)
      const revenueStats = {
        mrr: allUsers.length * 35.50, // Placeholder calculation
        starter_users: Math.floor(allUsers.length * 0.6),
        pro_users: Math.floor(allUsers.length * 0.3),
        elite_users: Math.floor(allUsers.length * 0.1),
        churn_rate: 2.5,
      };

      // System health (placeholder - implement with actual monitoring)
      const systemStats = {
        api_response_time_ms: 127,
        error_rate: 0.02,
        uptime_percentage: 99.97,
        last_backup: new Date().toISOString(),
      };

      const stats = {
        users: userStats,
        storage: storageStats,
        database: databaseStats,
        revenue: revenueStats,
        system_health: systemStats,
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch admin statistics: " + error.message });
    }
  });

  // Get detailed user list for admin
  app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsersAdmin();
      
      const detailedUsers = await Promise.all(
        allUsers.map(async (user) => {
          const userContacts = await storage.getContacts(user.id);
          
          // Calculate user storage (placeholder - implement actual calculation)
          let storageUsed = 0;
          let photosCount = 0;
          let videosCount = 0;
          
          userContacts.forEach(contact => {
            if (contact.profilePhotoUrl) {
              photosCount++;
              storageUsed += 0.05; // 50KB average per photo
            }
          });

          return {
            id: user.id,
            name: user.firstName || "Unknown User",
            email: user.email || "no-email",
            plan: "Pro", // Placeholder - implement actual plan detection
            contacts_count: userContacts.length,
            storage_used_gb: Math.round(storageUsed * 100) / 100,
            photos_count: photosCount,
            videos_count: videosCount,
            last_active: user.lastActive || new Date().toISOString(),
            signup_date: user.createdAt || new Date().toISOString(),
          };
        })
      );

      res.json(detailedUsers);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch user details: " + error.message });
    }
  });
}