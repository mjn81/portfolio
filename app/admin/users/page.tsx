"use client"

import type React from "react"

import { useState } from "react"
import {
  CheckCircle,
  ChevronDown,
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
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
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
} from "@/components/ui/alert-dialog"

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "Mohammad Najafi",
    email: "mohammad@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Administrator",
    status: "Active",
    lastActive: "Just now",
    createdAt: "Oct 10, 2023",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Editor",
    status: "Active",
    lastActive: "2 hours ago",
    createdAt: "Aug 15, 2023",
  },
  {
    id: 3,
    name: "Alex Chen",
    email: "alex.chen@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Author",
    status: "Inactive",
    lastActive: "3 days ago",
    createdAt: "Jun 5, 2023",
  },
  {
    id: 4,
    name: "Priya Patel",
    email: "priya.patel@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Subscriber",
    status: "Pending",
    lastActive: "Never",
    createdAt: "Sep 22, 2023",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Contributor",
    status: "Active",
    lastActive: "1 day ago",
    createdAt: "Jul 18, 2023",
  },
  {
    id: 6,
    name: "Emma Rodriguez",
    email: "emma.rodriguez@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Editor",
    status: "Active",
    lastActive: "5 hours ago",
    createdAt: "May 30, 2023",
  },
  {
    id: 7,
    name: "John Smith",
    email: "john.smith@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Subscriber",
    status: "Blocked",
    lastActive: "2 months ago",
    createdAt: "Mar 12, 2023",
  },
]

type RoleType = "Administrator" | "Editor" | "Author" | "Contributor" | "Subscriber"
type StatusType = "Active" | "Inactive" | "Pending" | "Blocked"

interface UserFormData {
  id?: number
  name: string
  email: string
  role: RoleType
  password: string
  confirmPassword: string
  sendEmail: boolean
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<(typeof mockUsers)[0] | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "Subscriber",
    password: "",
    confirmPassword: "",
    sendEmail: true,
  })

  // Filter users based on search term and active tab
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && user.status === "Active") ||
      (activeTab === "inactive" && user.status === "Inactive") ||
      (activeTab === "pending" && user.status === "Pending") ||
      (activeTab === "blocked" && user.status === "Blocked")

    return matchesSearch && matchesTab
  })

  const handleUserSelect = (id: number) => {
    setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return

    // In a real application, this would call an API to perform the action
    toast({
      title: `${action} users`,
      description: `${selectedUsers.length} user(s) have been ${action.toLowerCase()}.`,
    })

    if (action === "Delete") {
      // In real app, would remove from database
      setSelectedUsers([])
    }
  }

  const handleEditUser = (user: (typeof mockUsers)[0]) => {
    setCurrentUser(user)
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as RoleType,
      password: "",
      confirmPassword: "",
      sendEmail: false,
    })
    setIsEditUserOpen(true)
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (isAddUserOpen && (!formData.password || formData.password !== formData.confirmPassword)) {
      toast({
        title: "Password Error",
        description: "Passwords must match and cannot be empty for new users.",
        variant: "destructive",
      })
      return
    }

    if (isEditUserOpen && formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call an API to add/edit the user
    toast({
      title: isAddUserOpen ? "User created" : "User updated",
      description: isAddUserOpen
        ? `${formData.name} has been added successfully.`
        : `${formData.name}'s profile has been updated.`,
    })

    // Reset form and close dialog
    setFormData({
      name: "",
      email: "",
      role: "Subscriber",
      password: "",
      confirmPassword: "",
      sendEmail: true,
    })

    setIsAddUserOpen(false)
    setIsEditUserOpen(false)
    setCurrentUser(null)
  }

  const handleDeleteUser = (id: number) => {
    toast({
      title: "User deleted",
      description: "The user has been deleted successfully.",
    })

    // Remove from selected if it was selected
    setSelectedUsers((prev) => prev.filter((userId) => userId !== id))
  }

  const handleChangeStatus = (id: number, status: StatusType) => {
    // In a real app, this would update the user's status in the database
    toast({
      title: "Status updated",
      description: `User status changed to ${status}.`,
    })
  }

  const handleOpenAddUser = () => {
    setFormData({
      name: "",
      email: "",
      role: "Subscriber",
      password: "",
      confirmPassword: "",
      sendEmail: true,
    })
    setIsAddUserOpen(true)
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "Pending":
        return <Badge variant="warning">Pending</Badge>
      case "Blocked":
        return <Badge variant="destructive">Blocked</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const statusCounts = {
    all: mockUsers.length,
    active: mockUsers.filter((user) => user.status === "Active").length,
    inactive: mockUsers.filter((user) => user.status === "Inactive").length,
    pending: mockUsers.filter((user) => user.status === "Pending").length,
    blocked: mockUsers.filter((user) => user.status === "Blocked").length,
  }

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
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex flex-1 items-center gap-2 bg-muted rounded-md pl-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchTerm("")}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden lg:block">
                <TabsList>
                  <TabsTrigger value="all">
                    All{" "}
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts.all}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active{" "}
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts.active}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending{" "}
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts.pending}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="inactive">
                    Inactive{" "}
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts.inactive}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="blocked">
                    Blocked{" "}
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts.blocked}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                  <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
                  <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                  <SelectItem value="inactive">Inactive ({statusCounts.inactive})</SelectItem>
                  <SelectItem value="blocked">Blocked ({statusCounts.blocked})</SelectItem>
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
                      checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
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
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                              {user.name.split(" ")[1]?.charAt(0)}
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
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{user.lastActive}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{user.createdAt}</TableCell>
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
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Lock className="mr-2 h-4 w-4" />
                                Reset password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeStatus(user.id, user.status === "Active" ? "Inactive" : "Active")
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {user.status === "Active" ? "Set as inactive" : "Set as active"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeStatus(user.id, user.status === "Blocked" ? "Active" : "Blocked")
                                }
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                {user.status === "Blocked" ? "Unblock user" : "Block user"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
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
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-muted p-3">
                          <UserCog className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No users found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {searchTerm ? "No users match your search criteria" : "Add some users to get started"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {selectedUsers.length > 0 && (
          <CardFooter className="flex items-center border-t p-4 gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{selectedUsers.length}</span> user{selectedUsers.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("Activate")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("Deactivate")}>
                  <X className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("Block")}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Block
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bulk Delete Users</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedUsers.length} selected users? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("Delete")}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        )}
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[485px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account. Fill in the details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as RoleType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Author">Author</SelectItem>
                    <SelectItem value="Contributor">Contributor</SelectItem>
                    <SelectItem value="Subscriber">Subscriber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="send-welcome"
                  checked={formData.sendEmail}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendEmail: checked })}
                />
                <Label htmlFor="send-welcome">Send welcome email</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[485px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user account details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as RoleType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Author">Author</SelectItem>
                    <SelectItem value="Contributor">Contributor</SelectItem>
                    <SelectItem value="Subscriber">Subscriber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Password</h4>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave blank to keep the current password. Enter a new password to change it.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">New Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                <Input
                  id="edit-confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="edit-send-notification"
                  checked={formData.sendEmail}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendEmail: checked })}
                />
                <Label htmlFor="edit-send-notification">Send notification email</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
