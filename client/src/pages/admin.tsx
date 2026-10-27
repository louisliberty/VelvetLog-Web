import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Database, 
  HardDrive, 
  Image, 
  Video,
  Activity,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  Search,
  RefreshCw
} from "lucide-react";

interface AdminStats {
  users: {
    total: number;
    active_daily: number;
    active_weekly: number;
    active_monthly: number;
    new_signups_today: number;
    new_signups_week: number;
  };
  storage: {
    total_used_gb: number;
    total_allocated_gb: number;
    photos_count: number;
    videos_count: number;
    average_per_user_gb: number;
  };
  database: {
    total_contacts: number;
    total_interactions: number;
    total_reminders: number;
    db_size_mb: number;
    query_performance_ms: number;
  };
  revenue: {
    mrr: number;
    starter_users: number;
    pro_users: number;
    elite_users: number;
    churn_rate: number;
  };
  system_health: {
    api_response_time_ms: number;
    error_rate: number;
    uptime_percentage: number;
    last_backup: string;
  };
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  plan: "Starter" | "Pro" | "Elite";
  contacts_count: number;
  storage_used_gb: number;
  photos_count: number;
  videos_count: number;
  last_active: string;
  signup_date: string;
}

export default function AdminDashboard() {
  useEffect(() => {
    document.title = "Admin Dashboard | VelvetLog";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");

  // In a real implementation, these would be API calls
  const mockStats: AdminStats = {
    users: {
      total: 1247,
      active_daily: 342,
      active_weekly: 789,
      active_monthly: 1089,
      new_signups_today: 12,
      new_signups_week: 89
    },
    storage: {
      total_used_gb: 428.7,
      total_allocated_gb: 2847.0,
      photos_count: 12847,
      videos_count: 3291,
      average_per_user_gb: 0.34
    },
    database: {
      total_contacts: 8934,
      total_interactions: 34782,
      total_reminders: 5647,
      db_size_mb: 147.2,
      query_performance_ms: 23.5
    },
    revenue: {
      mrr: 34567.50,
      starter_users: 847,
      pro_users: 312,
      elite_users: 88,
      churn_rate: 2.3
    },
    system_health: {
      api_response_time_ms: 127,
      error_rate: 0.02,
      uptime_percentage: 99.97,
      last_backup: "2025-08-11T20:30:00Z"
    }
  };

  const mockUsers: UserDetail[] = [
    {
      id: "user_001",
      name: "Grace Chen",
      email: "grace@example.com",
      plan: "Pro",
      contacts_count: 11,
      storage_used_gb: 1.2,
      photos_count: 24,
      videos_count: 3,
      last_active: "2025-08-11T22:15:00Z",
      signup_date: "2025-03-15T10:30:00Z"
    },
    {
      id: "user_002", 
      name: "Michael Rodriguez",
      email: "michael@example.com",
      plan: "Elite",
      contacts_count: 28,
      storage_used_gb: 3.8,
      photos_count: 67,
      videos_count: 12,
      last_active: "2025-08-11T21:45:00Z",
      signup_date: "2025-01-22T14:20:00Z"
    },
    {
      id: "user_003",
      name: "Sarah Johnson",
      email: "sarah@example.com", 
      plan: "Starter",
      contacts_count: 7,
      storage_used_gb: 0.0,
      photos_count: 0,
      videos_count: 0,
      last_active: "2025-08-10T16:30:00Z",
      signup_date: "2025-07-28T09:15:00Z"
    }
  ];

  const stats = mockStats;
  const users = mockUsers;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = selectedPlan === "all" || user.plan.toLowerCase() === selectedPlan.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  const storageUtilization = (stats.storage.total_used_gb / stats.storage.total_allocated_gb) * 100;
  const needsImageProcessing = stats.storage.photos_count > 10000 || stats.storage.videos_count > 2000;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Starter": return "bg-green-100 text-green-800";
      case "Pro": return "bg-purple-100 text-purple-800";
      case "Elite": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">VelvetLog Admin</h1>
                <p className="text-sm text-gray-600">Master Control Dashboard</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">
                    +{stats.users.new_signups_today} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.revenue.mrr.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">
                    {stats.revenue.churn_rate}% churn rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <HardDrive className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.storage.total_used_gb.toFixed(1)} GB</div>
                  <p className="text-xs text-gray-600">
                    {storageUtilization.toFixed(1)}% utilized
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.system_health.uptime_percentage}%</div>
                  <p className="text-xs text-gray-600">
                    {stats.system_health.api_response_time_ms}ms avg response
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Activity & Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    User Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily Active</span>
                    <span className="font-semibold">{stats.users.active_daily}</span>
                  </div>
                  <Progress value={(stats.users.active_daily / stats.users.total) * 100} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Weekly Active</span>
                    <span className="font-semibold">{stats.users.active_weekly}</span>
                  </div>
                  <Progress value={(stats.users.active_weekly / stats.users.total) * 100} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Active</span>
                    <span className="font-semibold">{stats.users.active_monthly}</span>
                  </div>
                  <Progress value={(stats.users.active_monthly / stats.users.total) * 100} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Subscription Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Starter ($19.99)</span>
                    <span className="font-semibold">{stats.revenue.starter_users} users</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pro ($49.99)</span>
                    <span className="font-semibold">{stats.revenue.pro_users} users</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Elite ($99.99)</span>
                    <span className="font-semibold">{stats.revenue.elite_users} users</span>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">Average Revenue Per User</div>
                    <div className="text-xl font-bold text-green-600">
                      ${(stats.revenue.mrr / stats.users.total).toFixed(2)}/month
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Database Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-orange-500" />
                  Database Status & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-600">Database Size</div>
                    <div className="text-2xl font-bold">{stats.database.db_size_mb} MB</div>
                    <div className="text-xs text-gray-500">Query time: {stats.database.query_performance_ms}ms</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600">Total Records</div>
                    <div className="text-lg font-semibold">{stats.database.total_contacts.toLocaleString()} contacts</div>
                    <div className="text-xs text-gray-500">{stats.database.total_interactions.toLocaleString()} interactions</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Media Files</div>
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-blue-500" />
                      <span>{stats.storage.photos_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-red-500" />
                      <span>{stats.storage.videos_count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {needsImageProcessing && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">Recommendation: Image Processing Optimization</span>
                    </div>
                    <p className="text-sm text-amber-700 mt-2">
                      With {stats.storage.photos_count.toLocaleString()} photos and {stats.storage.videos_count.toLocaleString()} videos,
                      consider implementing image compression and CDN caching to improve performance.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="elite">Elite</option>
              </select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-gray-900">User</th>
                        <th className="text-left p-3 font-medium text-gray-900">Plan</th>
                        <th className="text-left p-3 font-medium text-gray-900">Contacts</th>
                        <th className="text-left p-3 font-medium text-gray-900">Storage</th>
                        <th className="text-left p-3 font-medium text-gray-900">Media Files</th>
                        <th className="text-left p-3 font-medium text-gray-900">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={getPlanColor(user.plan)}>
                              {user.plan}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="font-medium">{user.contacts_count}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium">{user.storage_used_gb.toFixed(2)} GB</span>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Image className="h-3 w-3 text-blue-500" />
                                {user.photos_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <Video className="h-3 w-3 text-red-500" />
                                {user.videos_count}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-gray-600">
                              {formatDate(user.last_active)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-purple-500" />
                    Storage Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage Utilization</span>
                      <span>{storageUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={storageUtilization} className="h-3" />
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.storage.total_used_gb.toFixed(1)} GB of {stats.storage.total_allocated_gb.toFixed(1)} GB used
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average per user</span>
                      <span className="font-medium">{stats.storage.average_per_user_gb.toFixed(2)} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total photos</span>
                      <span className="font-medium">{stats.storage.photos_count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total videos</span>
                      <span className="font-medium">{stats.storage.videos_count.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Storage Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {storageUtilization > 70 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800">High Storage Usage</div>
                      <div className="text-sm text-red-600">
                        Consider scaling storage capacity or implementing cleanup policies.
                      </div>
                    </div>
                  )}
                  
                  {needsImageProcessing && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="font-medium text-amber-800">Image Processing Needed</div>
                      <div className="text-sm text-amber-600">
                        High volume of media files detected. Implement compression and CDN.
                      </div>
                    </div>
                  )}
                  
                  {stats.storage.average_per_user_gb > 1.0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-800">Above Average Usage</div>
                      <div className="text-sm text-blue-600">
                        Users are utilizing storage heavily. Consider tiered pricing optimization.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">API Response Time</span>
                    <span className="font-medium">{stats.system_health.api_response_time_ms}ms</span>
                  </div>
                  <Progress 
                    value={Math.min((stats.system_health.api_response_time_ms / 500) * 100, 100)} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="font-medium">{(stats.system_health.error_rate * 100).toFixed(2)}%</span>
                  </div>
                  <Progress 
                    value={stats.system_health.error_rate * 100 * 50} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="font-medium text-green-600">{stats.system_health.uptime_percentage}%</span>
                  </div>
                  <Progress value={stats.system_health.uptime_percentage} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    Database Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database Size</span>
                    <span className="font-medium">{stats.database.db_size_mb} MB</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Query Performance</span>
                    <span className="font-medium">{stats.database.query_performance_ms}ms avg</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="font-medium text-green-600">
                      {formatDate(stats.system_health.last_backup)}
                    </span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">System Status: Healthy</div>
                    <div className="text-sm text-green-600">
                      All systems operating within normal parameters.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}