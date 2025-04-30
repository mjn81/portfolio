"use client"

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  Trash2,
  UserPlus,
  X,
  Edit,
  UserCog,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  Filter,
  ListFilter,
  Image as ImageIconLucide,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import useDebounce from '@/hooks/use-debounce';
import { ImageGalleryPicker } from '@/components/admin/image-gallery-picker';

// --- API Helper Functions ---

async function fetchUsers(params: URLSearchParams) {
  const response = await fetch(`/api/users?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

async function createUser(userData: any) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create user');
  }
  return response.json();
}

async function updateUser(userId: string, userData: any) {
  const response = await fetch(`/api/users/${userId}`,
   {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update user');
  }
  return response.json();
}

async function deleteUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete user');
  }
  return response.json();
}

// --- Types ---

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: RoleType;
  status: StatusType;
  last_active?: string | null;
  created_at: string;
};

type RoleType = 'Admin' | 'Author' | 'Moderator';
type StatusType = 'Active' | 'Inactive';

interface UserFormData {
  id?: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: RoleType;
  password?: string;
  confirmPassword?: string;
  sendEmail: boolean;
  status?: StatusType;
}

const USER_ROLES: RoleType[] = ['Admin', 'Author', 'Moderator'];
const USER_STATUSES: StatusType[] = ['Active', 'Inactive'];

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'Author',
    status: 'Active',
    password: '',
    confirmPassword: '',
    sendEmail: true,
    avatar: null,
  });
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  useDebounce(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
  }, 500, [searchTerm]);

  const fetchUsersData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedUsers([]);

    const params = new URLSearchParams();
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());
    if (debouncedSearchTerm) params.append('query', debouncedSearchTerm);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (roleFilter !== 'all') params.append('role', roleFilter);

    try {
      const { data, meta } = await fetchUsers(params);
      setUsers(data || []);
      setPagination({
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
        hasMore: meta.hasMore,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load users.');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setUsers([]);
      setPagination(prev => ({...prev, total: 0, totalPages: 1, hasMore: false}));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, statusFilter, roleFilter, toast]);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const handleUserSelect = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleStatusFilterChange = (value: string) => {
    const validStatus = ['all', ...USER_STATUSES].includes(value) ? value : 'all';
    setStatusFilter(validStatus);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRoleFilterChange = (value: string) => {
    const validRole = ['all', ...USER_ROLES].includes(value) ? value : 'all';
    setRoleFilter(validRole);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleOpenAddUser = () => {
    setCurrentUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Author',
      status: 'Active',
      password: '',
      confirmPassword: '',
      sendEmail: true,
      avatar: null,
    });
    setIsAddUserOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
      confirmPassword: '',
      sendEmail: false,
      avatar: user.avatar,
    });
    setIsEditUserOpen(true);
  };

  const handleSelectAvatar = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: imageUrl }));
    setIsAvatarPickerOpen(false);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.role || !formData.status) {
      toast({ title: "Validation Error", description: "Name, Email, Role, and Status are required.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (isAddUserOpen && (!formData.password || formData.password.length < 6)) {
        toast({ title: "Password Error", description: "Password is required and must be at least 6 characters long for new users.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({ title: "Password Error", description: "Passwords do not match.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const userData: Partial<UserFormData> = { ...formData };
    delete userData.confirmPassword;
    if (isEditUserOpen && !userData.password) {
      delete userData.password;
    }
    if (!isAddUserOpen) {
      delete userData.sendEmail;
    }

    try {
      let result;
      if (isEditUserOpen && currentUser) {
        result = await updateUser(currentUser.id, userData);
        toast({ title: "User Updated", description: `${result.user.name}'s profile updated successfully.` });
      } else {
        result = await createUser(userData);
        toast({ title: "User Created", description: `${result.user.name} added successfully.` });
      }

      setFormData({ name: '', email: '', role: 'Author', status: 'Active', password: '', confirmPassword: '', sendEmail: true, avatar: null });
      setIsAddUserOpen(false);
      setIsEditUserOpen(false);
      setCurrentUser(null);
      fetchUsersData();
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
      try {
          await deleteUser(userId);
          toast({ title: "User Deleted", description: `${userName} has been deleted.` });
          setSelectedUsers((prev) => prev.filter((id) => id !== userId));
          fetchUsersData();
      } catch (error: any) {
          console.error("Delete user error:", error);
          toast({ title: 'Deletion Failed', description: error.message, variant: 'destructive' });
      }
  };

  const handleChangeStatus = async (userId: string, newStatus: StatusType) => {
      try {
          await updateUser(userId, { status: newStatus });
          toast({ title: "Status Updated", description: `User status changed to ${newStatus}.` });
          fetchUsersData();
      } catch (error: any) {
          console.error("Change status error:", error);
          toast({ title: 'Status Update Failed', description: error.message, variant: 'destructive' });
      }
  };

  const handleBulkAction = async (action: 'Activate' | 'Deactivate' | 'Delete') => {
    if (selectedUsers.length === 0) return;

    const actionLower = action.toLowerCase();
    let statusToSet: StatusType | undefined;

    if (action === 'Activate') statusToSet = 'Active';
    if (action === 'Deactivate') statusToSet = 'Inactive';

    if (action === 'Delete') {
        return;
    }

    toast({ title: 'Processing Bulk Action', description: `Attempting to ${actionLower} ${selectedUsers.length} users...` });
    if (!statusToSet) {
       toast({ title: 'Error', description: 'Invalid bulk action', variant: 'destructive' });
       return;
    }
    const promises = selectedUsers.map(id => updateUser(id, { status: statusToSet }));
    try {
        await Promise.all(promises);
        toast({ title: 'Bulk Action Complete', description: `${selectedUsers.length} users have been ${actionLower}d.` });
        setSelectedUsers([]);
        fetchUsersData();
    } catch (error: any) {
        console.error("Bulk action error:", error);
        toast({ title: 'Bulk Action Failed', description: `Some users might not have been updated: ${error.message}`, variant: 'destructive' });
        fetchUsersData();
    }
};

const handleConfirmBulkDelete = async () => {
     toast({ title: 'Processing Bulk Delete', description: `Attempting to delete ${selectedUsers.length} users...` });
    const promises = selectedUsers.map(id => deleteUser(id));
    try {
        await Promise.all(promises);
        toast({ title: 'Bulk Delete Complete', description: `${selectedUsers.length} users have been deleted.` });
        setSelectedUsers([]);
        fetchUsersData();
    } catch (error: any) {
        console.error("Bulk delete error:", error);
        toast({ title: 'Bulk Delete Failed', description: `Some users might not have been deleted: ${error.message}`, variant: 'destructive' });
        fetchUsersData();
    }
};

  const renderStatusBadge = (status: StatusType | string | undefined) => {
    switch (status) {
      case 'Active': return <Badge variant="success">Active</Badge>;
      case 'Inactive': return <Badge variant="secondary">Inactive</Badge>;
      default: return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return 'Invalid Date';
    }
  }

   const formatRelativeTime = (dateString: string | null | undefined) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

        if (diffSeconds < 60) return `Just now`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        const diffDays = Math.round(diffHours / 24);
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatDate(dateString);
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage your website users and permissions.</p>
        </div>
        <Button onClick={handleOpenAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
            <div className="flex flex-1 items-center gap-2 bg-muted rounded-md pl-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchTerm('')}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                 <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                       <ListFilter className="mr-2 h-4 w-4 opacity-50" /> <SelectValue placeholder="Filter by role..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {USER_ROLES.map(role => (
                             <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                       <Filter className="mr-2 h-4 w-4 opacity-50" /> <SelectValue placeholder="Filter by status..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {USER_STATUSES.map(status => (
                             <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={users.length > 0 && selectedUsers.length === users.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      disabled={isLoading || users.length === 0}
                    />
                  </TableHead>
                  <TableHead className="min-w-[180px]">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Active</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: pagination.limit }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                      <TableCell>
                          <div className="flex items-center gap-3">
                              <Skeleton className="h-9 w-9 rounded-full" />
                              <div className='space-y-1.5'>
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-3 w-40" />
                              </div>
                          </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 float-right" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                    <TableRow>
                         <TableCell colSpan={7} className="h-32 text-center text-red-600">
                            Error loading users: {error}
                        </TableCell>
                    </TableRow>
                 ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id} data-state={selectedUsers.includes(user.id) ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleUserSelect(user.id)}
                          aria-label={`Select ${user.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar || undefined} alt={user.name} />
                            <AvatarFallback>
                              {user.name?.charAt(0)?.toUpperCase()}
                              {user.name?.split(' ')[1]?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground hidden sm:block">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                      <TableCell className="hidden md:table-cell">{renderStatusBadge(user.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{formatRelativeTime(user.last_active)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeStatus(user.id, user.status === 'Active' ? 'Inactive' : 'Active')
                                }
                              >
                                {user.status === 'Active' ? <X className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                {user.status === 'Active' ? 'Set as Inactive' : 'Set as Active'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                 <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to permanently delete {user.name} ({user.email})? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteUser(user.id, user.name)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <UserCog className="h-10 w-10 text-muted-foreground mb-3" />
                        <h3 className="text-lg font-semibold">No Users Found</h3>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                            ? "No users match your current filters." 
                            : "No users exist in the system yet."} 
                        </p>
                         {!(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
                             <Button size="sm" className="mt-4" onClick={handleOpenAddUser}>
                                 <UserPlus className="mr-2 h-4 w-4" /> Add First User
                             </Button>
                         )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t p-4 gap-4">
             <div className="text-xs text-muted-foreground">
                {selectedUsers.length > 0 ? (
                    <>
                        {selectedUsers.length} of {pagination.total} user(s) selected.
                    </>
                 ) : (
                    <> 
                        Total {pagination.total} users.
                    </>
                 )}
            </div>

             {selectedUsers.length > 0 && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                        Bulk Actions
                        <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBulkAction('Activate')}> <CheckCircle className="mr-2 h-4 w-4" /> Activate </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('Deactivate')}> <X className="mr-2 h-4 w-4" /> Deactivate </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog> 
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Bulk Delete Users</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete the {selectedUsers.length} selected users? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleConfirmBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90"> Delete </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                 </DropdownMenu>
             )}

            {pagination.totalPages > 1 && (
                 <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 hidden lg:flex"
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1 || isLoading}
                        >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || isLoading}
                        >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || isLoading}
                        >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                     <Button
                        variant="outline"
                        className="h-8 w-8 p-0 hidden lg:flex"
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages || isLoading}
                        >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </CardFooter>
      </Card>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account. Fill in the details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="avatar"
                    value={formData.avatar ?? ''}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://... or select from gallery"
                    disabled={isSubmitting}
                  />
                   <Button type="button" variant="outline" size="icon" onClick={() => setIsAvatarPickerOpen(true)} disabled={isSubmitting}>
                     <ImageIconLucide className="h-4 w-4" />
                   </Button>
                </div>
                 {formData.avatar && (
                     <Image src={formData.avatar} alt="Avatar preview" width={64} height={64} className="rounded-full object-cover mt-2" />
                 )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as RoleType })}
                    disabled={isSubmitting}
                    >
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        {USER_ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                     <Select
                        value={formData.status ?? 'Active'}
                        onValueChange={(value) => setFormData({ ...formData, status: value as StatusType })}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                             {USER_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                    id="password"
                    type="password"
                    value={formData.password ?? ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isSubmitting}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword ?? ''}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isSubmitting}
                    />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="send-welcome"
                  checked={formData.sendEmail}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendEmail: checked })}
                   disabled={isSubmitting}
                />
                <Label htmlFor="send-welcome">Send welcome email</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit User ({currentUser?.name})</DialogTitle>
            <DialogDescription>Update user account details. Leave password blank to keep current.</DialogDescription>
          </DialogHeader>
           <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-avatar">Avatar URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-avatar"
                    value={formData.avatar ?? ''}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://... or select from gallery"
                    disabled={isSubmitting}
                  />
                   <Button type="button" variant="outline" size="icon" onClick={() => setIsAvatarPickerOpen(true)} disabled={isSubmitting}>
                     <ImageIconLucide className="h-4 w-4" />
                   </Button>
                </div>
                 {formData.avatar && (
                     <Image src={formData.avatar} alt="Avatar preview" width={64} height={64} className="rounded-full object-cover mt-2" />
                 )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                   disabled={isSubmitting}
                />
              </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="edit-role">Role *</Label>
                     <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as RoleType })}
                    disabled={isSubmitting}
                    >
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        {USER_ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status *</Label>
                    <Select
                        value={formData.status ?? 'Active'}
                        onValueChange={(value) => setFormData({ ...formData, status: value as StatusType })}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                             {USER_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
             </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="edit-password">New Password</Label>
                    <Input
                    id="edit-password"
                    type="password"
                    value={formData.password ?? ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isSubmitting}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                    <Input
                    id="edit-confirmPassword"
                    type="password"
                    value={formData.confirmPassword ?? ''}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isSubmitting}
                    />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Save Changes
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ImageGalleryPicker
        open={isAvatarPickerOpen}
        onOpenChange={setIsAvatarPickerOpen}
        onSelectImage={handleSelectAvatar}
      />
    </div>
  );
}
