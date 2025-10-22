import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Upload, User, FileText, Eye, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Material {
  id: string;
  title: string;
  department: string;
  course: string;
  uploaded_by: string;
  created_at: string;
  file_type: string;
}

interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    pendingMaterials: 0,
    totalUsers: 0,
    totalDepartments: 0
  });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    } else if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchData = async () => {
    // Fetch materials
    const { data: materialsData, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (materialsError) {
      console.error('Error fetching materials:', materialsError);
    } else {
      setMaterials(materialsData || []);
      
      // Calculate stats
      setStats(prev => ({
        ...prev,
        totalMaterials: materialsData.length,
        pendingMaterials: 0
      }));
    }

    // Fetch users
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else {
      setUsers(usersData || []);
      
      // Calculate stats
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.length
      }));
    }

    // Count unique departments
    const uniqueDepartments = [...new Set(materialsData?.map(m => m.department) || [])];
    setStats(prev => ({
      ...prev,
      totalDepartments: uniqueDepartments.length
    }));
  };

  const handleApproveMaterial = async (id: string) => {
    // In a real implementation, update material status to approved
    console.log(`Approving material ${id}`);
    await fetchData(); // Refresh data
  };

  const handleRejectMaterial = async (id: string) => {
    // In a real implementation, update material status to rejected
    console.log(`Rejecting material ${id}`);
    await fetchData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              You must be an administrator to access this page.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Materials</p>
                      <p className="text-2xl font-bold">{stats.totalMaterials}</p>
                    </div>
                    <FileText className="h-10 w-10 text-primary/50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold">{stats.pendingMaterials}</p>
                    </div>
                    <Upload className="h-10 w-10 text-primary/50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <User className="h-10 w-10 text-primary/50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Departments</p>
                      <p className="text-2xl font-bold">{stats.totalDepartments}</p>
                    </div>
                    <div className="h-10 w-10 text-primary/50 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">D</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materials.slice(0, 5).map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{material.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {material.course} • {material.department}
                        </p>
                      </div>
                      <Badge variant="default">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Title</th>
                        <th className="text-left py-2">Course</th>
                        <th className="text-left py-2">Department</th>
                        <th className="text-left py-2">Uploader</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material) => (
                        <tr key={material.id} className="border-b">
                          <td className="py-3">{material.title}</td>
                          <td className="py-3">{material.course}</td>
                          <td className="py-3">{material.department}</td>
                          <td className="py-3">{material.uploaded_by}</td>
                          <td className="py-3">
                            <Badge variant="default">Active</Badge>
                          </td>
                          <td className="py-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Email</th>
                        <th className="text-left py-2">Role</th>
                        <th className="text-left py-2">Join Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3">{user.full_name || 'N/A'}</td>
                          <td className="py-3">{user.email || 'N/A'}</td>
                          <td className="py-3">
                            <Badge variant="outline">
                              user
                            </Badge>
                          </td>
                          <td className="py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Administrative settings and system configuration options will appear here.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Auto-approve uploads</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email notifications</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Backup settings</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;