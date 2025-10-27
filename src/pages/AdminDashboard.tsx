import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, User, FileText, Eye, X, AlertCircle, MoreHorizontal, Check, Pencil, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isFreshmanCourse } from "@/utils/courseClassification";

interface Material {
  id: string;
  title: string;
  department: string;
  course: string;
  uploaded_by: string;
  uploaded_by_user_id?: string | null;
  created_at: string;
  description?: string | null;
  file_type?: string;
  file_path?: string;
  file_size?: string;
}

interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_admin?: boolean;
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
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [editForm, setEditForm] = useState({ title: "", course: "", department: "", description: "" });
  const [newFile, setNewFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  // system configuration state
  const [configLoading, setConfigLoading] = useState(false);
  const [systemConfig, setSystemConfig] = useState({
    autoApprove: false,
    emailNotifications: true,
    backupSchedule: '0 2 * * *' // default: daily at 2am
  });
  const { toast } = useToast();

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

    // Fetch all users for admin dashboard
    // The RLS policy in Supabase needs to be configured to allow admin users to view all profiles
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else {
      // Fetch admin roles for all users
      const userIds = usersData?.map(u => u.id) || [];
      const { data: adminRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('role', 'admin');

      if (roleError) {
        console.error('Error fetching admin roles:', roleError);
        // Still set users even if role fetching fails
        const usersWithAdminStatus = usersData?.map(user => ({
          ...user,
          is_admin: false // Default to false if we can't fetch roles
        })) || [];
        
        setUsers(usersWithAdminStatus);
      } else {
        // Map admin status to users
        const usersWithAdminStatus = usersData?.map(user => ({
          ...user,
          is_admin: adminRoles?.some(role => role.user_id === user.id) || false
        })) || [];
        
        setUsers(usersWithAdminStatus);
      }
      
      // Calculate stats
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.length
      }));
    }

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else {
      // Fetch admin roles for all users
      const userIds = usersData?.map(u => u.id) || [];
      const { data: adminRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('role', 'admin');

      if (roleError) {
        console.error('Error fetching admin roles:', roleError);
      } else {
        // Map admin status to users
        const usersWithAdminStatus = usersData?.map(user => ({
          ...user,
          is_admin: adminRoles?.some(role => role.user_id === user.id) || false
        })) || [];
        
        setUsers(usersWithAdminStatus);
      }
      
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

  const loadSystemConfig = async () => {
    setConfigLoading(true);
    try {
      // Try to load from Supabase first
      // supabase types don't include system_settings in the generated schema here,
      // so use `any` to avoid TypeScript errors and cast returned rows explicitly.
      const resp: any = await (supabase as any)
        .from('system_settings')
        .select('*')
        .eq('id', 'global')
        .maybeSingle();

      const { data, error } = resp || {};

      if (error) {
        console.warn('Could not load system_settings from Supabase, falling back to localStorage', error);
        const local = localStorage.getItem('mu_system_settings');
        if (local) setSystemConfig(JSON.parse(local));
      } else if (data) {
        const row: any = data;
        setSystemConfig({
          autoApprove: !!row.auto_approve,
          emailNotifications: !!row.email_notifications,
          backupSchedule: row.backup_schedule || '0 2 * * *'
        });
      } else {
        const local = localStorage.getItem('mu_system_settings');
        if (local) setSystemConfig(JSON.parse(local));
      }
    } catch (e) {
      console.error('Error loading system settings', e);
    } finally {
      setConfigLoading(false);
    }
  };

  const saveSystemConfig = async () => {
    setSaving(true);
    try {
      const payload = {
        id: 'global',
        auto_approve: systemConfig.autoApprove,
        email_notifications: systemConfig.emailNotifications,
        backup_schedule: systemConfig.backupSchedule,
      } as any;

      // Use `any` since system_settings is not in the generated DB types here.
      const resp: any = await (supabase as any)
        .from('system_settings')
        .upsert(payload);

      const { error } = resp || {};

      if (error) {
        console.warn('Failed to save to Supabase, falling back to localStorage', error);
        localStorage.setItem('mu_system_settings', JSON.stringify(systemConfig));
        toast({ title: 'Saved locally', description: 'Settings saved to browser storage because server save failed.' });
      } else {
        toast({ title: 'Saved', description: 'System settings updated.' });
      }
    } catch (e) {
      console.error('Error saving system settings', e);
      toast({ variant: 'destructive', title: 'Save failed', description: 'Unable to save system settings.' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (material: Material) => {
    setEditing(material);
    setEditForm({
      title: material.title || "",
      course: material.course || "",
      department: material.department || "",
      description: (material.description as string) || "",
    });
    setNewFile(null);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updates: any = {
        title: editForm.title,
        course: editForm.course,
        department: editForm.department,
        description: editForm.description,
      };

      if (newFile) {
        const ext = newFile.name.split('.').pop()?.toLowerCase() || '';
        const map: Record<string, string> = { pdf: 'PDF', ppt: 'PPT', pptx: 'PPT', doc: 'DOC', docx: 'DOC', mp4: 'VIDEO', mov: 'VIDEO', avi: 'VIDEO' };
        const file_type = map[ext] || 'OTHER';
        const sizeStr = newFile.size < 1024 * 1024
          ? `${(newFile.size / 1024).toFixed(1)} KB`
          : `${(newFile.size / 1024 / 1024).toFixed(2)} MB`;
        const path = `${editing.id}/${Date.now()}_${newFile.name}`;
        const { error: uploadError } = await supabase.storage.from('course-materials').upload(path, newFile, { upsert: true });
        if (uploadError) throw uploadError;
        // attempt to remove old file if exists
        if (editing.file_path) {
          try { await supabase.storage.from('course-materials').remove([editing.file_path]); } catch {}
        }
        updates.file_path = path;
        updates.file_type = file_type;
        updates.file_size = sizeStr;
      }

      const { error: updateError } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', editing.id);
      if (updateError) throw updateError;

      await fetchData();
      setEditOpen(false);
    } catch (e) {
      console.error('Failed to save edit', e);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
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

  const markAsFreshmanCourse = (id: string) => {
    const overrides = JSON.parse(localStorage.getItem('freshmanCourseOverrides') || '{}');
    overrides[id] = true;
    localStorage.setItem('freshmanCourseOverrides', JSON.stringify(overrides));
    fetchData(); // Refresh data to update UI
  };

  const removeFromFreshmanCourses = (id: string) => {
    const overrides = JSON.parse(localStorage.getItem('freshmanCourseOverrides') || '{}');
    overrides[id] = false;
    localStorage.setItem('freshmanCourseOverrides', JSON.stringify(overrides));
    fetchData(); // Refresh data to update UI
  };

  const toggleFreshmanCourse = (id: string) => {
    const overrides = JSON.parse(localStorage.getItem('freshmanCourseOverrides') || '{}');
    overrides[id] = !overrides[id]; // Toggle the value
    localStorage.setItem('freshmanCourseOverrides', JSON.stringify(overrides));
    fetchData(); // Refresh data to update UI
  };

  const isMaterialFreshmanCourse = (material: Material): boolean => {
    return isFreshmanCourse(
      material.course || '', 
      material.title || '', 
      material.department || '',
      material.id
    );
  };

  const handleGrantAdmin = async (userId: string, userEmail: string | null) => {
    if (!window.confirm(`Are you sure you want to grant admin access to this user?`)) {
      return;
    }

    try {
      // Insert a record into user_roles to make the user an admin
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);

      if (error) {
        console.error('Error granting admin access:', error);
        // Check if it's a duplicate key error - user might already be an admin
        if (error.code === '23505') { // Unique violation error code in PostgreSQL
          // Update the existing record instead
          const { error: updateError } = await supabase
            .from('user_roles')
            .update({ role: 'admin' })
            .eq('user_id', userId)
            .eq('role', 'admin'); // This ensures we're only updating admin role records
          
          if (updateError) {
            throw updateError;
          }
        } else {
          throw error;
        }
      }

      // Send email notification to the user
      if (userEmail) {
        await sendAdminNotificationEmail(userEmail);
      }

      // Refresh data to update the UI
      await fetchData();
    } catch (error) {
      console.error('Error granting admin access:', error);
      alert('Failed to grant admin access. Please try again.');
    }
  };

  const getUploaderLabel = (material: Material) => {
    const uploader = users.find(u => u.id === (material.uploaded_by_user_id || material.uploaded_by));
    if (uploader) return uploader.is_admin ? 'Admin' : (uploader.full_name || uploader.email || 'Unknown');
    // Fall back to the raw uploaded_by field
    return material.uploaded_by || 'Unknown';
  };

  const sendAdminNotificationEmail = async (email: string) => {
    try {
      // In a real implementation, this would call a backend function to send an email
      // For now, we'll simulate this with a fetch call to a hypothetical email service
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-admin-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          email,
          subject: "Elevated Privileges: Your Contribution to Mekelle University Study Hub Community",
          content: `Dear Contributor,

            We are pleased to inform you that your access level has been elevated to Administrator on the Mekelle University Study Hub Platform. Your expertise and dedication have been recognized as valuable assets to our academic community.
            
            As an administrator, you now have the capability to upload educational resources that will directly impact the academic success of our students. Your materials will facilitate a more streamlined learning environment, reducing dependency on traditional distribution methods and enabling students to access resources instantly.
            
            We invite you to take this opportunity to share any academic materials you possess. By uploading your course materials, presentations, and resources, you're not just contributing to a repository – you're actively shaping an environment where students can take charge of their learning journey, stay ahead in their studies, and access materials without waiting.
            
            The platform's intuitive upload interface allows for easy categorization by school and department, ensuring your contributions reach the appropriate audience. Your administrative access also provides you with analytics on material utilization, allowing you to see the direct impact of your contributions.
            
            We appreciate your commitment to enhancing the educational experience for our students.
            
            Best regards,
            Mekelle University Study Hub Administration`
        }),
      });
    } catch (error) {
      console.error('Error sending notification email:', error);
      // If email sending fails, we still granted the admin access, so don't show an error to the user
    }
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-extrabold tracking-tight mb-12 text-center">Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md">Overview</TabsTrigger>
            <TabsTrigger value="materials" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md">Materials</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md">Users</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md">Settings</TabsTrigger>
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
                        <p className="text-sm text-muted-foreground mt-1">Uploaded by: {getUploaderLabel(material)}</p>
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
                        <th className="text-left py-2 text-sm text-muted-foreground">Uploader</th>
                        <th className="text-left py-2 text-sm text-muted-foreground hidden md:table-cell">Status</th>
                        <th className="text-left py-2 text-sm text-muted-foreground">Freshman</th>
                        <th className="text-left py-2 text-sm text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material) => (
                        <tr key={material.id} className="border-b">
                          <td className="py-3">{material.title}</td>
                          <td className="py-3">{material.course}</td>
                          <td className="py-3">{material.department}</td>
                          <td className="py-3 text-sm text-muted-foreground">{getUploaderLabel(material)}</td>
                          <td className="py-3">
                            <Badge variant="outline" className="bg-muted text-muted-foreground">Active</Badge>
                          </td>
                          <td className="py-3">
                            {isMaterialFreshmanCourse(material) ? (
                              <Badge variant="default" className="bg-green-500">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">No</Badge>
                            )}
                          </td>
                          <td className="py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" aria-label="Actions">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(material)}>
                                  <Pencil className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleFreshmanCourse(material.id)}>
                                  {isMaterialFreshmanCourse(material) ? (
                                    <>
                                      <X className="h-4 w-4 mr-2" /> Remove from Freshman
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-2" /> Mark as Freshman
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleApproveMaterial(material.id)}>
                                  <Check className="h-4 w-4 mr-2" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectMaterial(material.id)}>
                                  <X className="h-4 w-4 mr-2" /> Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                        <th className="text-left py-2">Profile</th>
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Email</th>
                        <th className="text-left py-2">Role</th>
                        <th className="text-left py-2">Join Date</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem.id} className="border-b">
                          <td className="py-3">
                            <div className="flex items-center">
                              {userItem.avatar_url ? (
                                <img 
                                  src={userItem.avatar_url} 
                                  alt={`${userItem.full_name || userItem.email}'s avatar`} 
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {userItem.full_name ? userItem.full_name.charAt(0).toUpperCase() : userItem.email?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3">{userItem.full_name || 'N/A'}</td>
                          <td className="py-3">{userItem.email || 'N/A'}</td>
                          <td className="py-3">
                            <Badge 
                              variant="outline"
                              className={userItem.is_admin 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-gray-100 text-gray-700 border-gray-200'}
                            >
                              {userItem.is_admin ? 'Admin' : 'User'}
                            </Badge>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">{new Date(userItem.created_at).toLocaleDateString()}</td>
                          <td className="py-3">
                            {userItem.id !== user?.id && !userItem.is_admin && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleGrantAdmin(userItem.id, userItem.email || '')}
                              >
                                Grant Admin
                              </Button>
                            )}
                            {userItem.is_admin && (
                              <span className="text-sm text-muted-foreground">Admin</span>
                            )}
                          </td>
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
                  Administrative settings and system configuration options.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-approve uploads</div>
                      <div className="text-sm text-muted-foreground">Automatically approve uploaded materials without manual review.</div>
                    </div>
                    <Switch checked={systemConfig.autoApprove} onCheckedChange={(v) => setSystemConfig({ ...systemConfig, autoApprove: !!v })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email notifications</div>
                      <div className="text-sm text-muted-foreground">Send email notifications to admins on important events.</div>
                    </div>
                    <Switch checked={systemConfig.emailNotifications} onCheckedChange={(v) => setSystemConfig({ ...systemConfig, emailNotifications: !!v })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="w-3/4">
                      <div className="font-medium">Backup schedule (cron)</div>
                      <div className="text-sm text-muted-foreground">Cron expression for automated backups. Example: <code>0 2 * * *</code> (daily at 2:00 AM)</div>
                      <Input className="mt-2" value={systemConfig.backupSchedule} onChange={(e) => setSystemConfig({ ...systemConfig, backupSchedule: e.target.value })} />
                    </div>
                    <div className="w-1/4 flex justify-end">
                      <Button onClick={saveSystemConfig} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input id="course" value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="freshman-course"
                    checked={isMaterialFreshmanCourse(editing!)}
                    onCheckedChange={() => editing && toggleFreshmanCourse(editing.id)}
                  />
                  <Label htmlFor="freshman-course">Mark as Freshman Course</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Replace File (optional)</Label>
                <input id="file" type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;