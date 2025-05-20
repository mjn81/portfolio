'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowUpDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import type { ContactMessage } from '@/types/contact';
import { withAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'created_at',
    direction: 'descending',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [viewMessageDialogOpen, setViewMessageDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const { toast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const sortBy = sortConfig.key;
      const sortOrder = sortConfig.direction === 'ascending' ? 'asc' : 'desc';

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) queryParams.append('search', searchTerm);

      const response = await fetch(`/api/admin/contacts?${queryParams.toString()}`);
      const data = await response.json();
      setMessages(data.data);
      setPagination(data.meta);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [pagination.page, pagination.limit, sortConfig]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchMessages();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDeleteMessage = (id: string) => {
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (messageToDelete) {
      try {
        const response = await fetch(`/api/admin/contacts/${messageToDelete}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete message.');
        }

        toast({
          title: 'Message deleted',
          description: 'The contact message has been successfully deleted.',
        });
        await fetchMessages();
      } catch (error: any) {
        console.error('Error deleting message:', error);
        toast({
          title: 'Error',
          description: error.message || 'Could not delete message.',
          variant: 'destructive',
        });
      } finally {
        setDeleteDialogOpen(false);
        setMessageToDelete(null);
      }
    }
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    });
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: string) => {
    setPagination((prev) => ({
      ...prev,
      limit: Number.parseInt(newLimit),
      page: 1,
    }));
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setViewMessageDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground">Manage messages from your contact form</p>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            {loading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <>
                Showing {pagination.total} messages in total.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, subject, message..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('sender_name')}
                    >
                      <div className="flex items-center">
                        Sender
                        {sortConfig.key === 'sender_name' && (
                          <ArrowUpDown
                            className={`ml-1 h-3 w-3 ${
                              sortConfig.direction === 'ascending'
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hidden cursor-pointer sm:table-cell"
                      onClick={() => handleSort('subject')}
                    >
                       <div className="flex items-center">
                        Subject
                        {sortConfig.key === 'subject' && (
                          <ArrowUpDown
                            className={`ml-1 h-3 w-3 ${
                              sortConfig.direction === 'ascending'
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hidden cursor-pointer sm:table-cell"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Received
                        {sortConfig.key === 'created_at' && (
                          <ArrowUpDown
                            className={`ml-1 h-3 w-3 ${
                              sortConfig.direction === 'ascending'
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(pagination.limit)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-4 w-2/3" />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : !messages || messages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No messages found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    messages.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell>
                          <div className="font-medium">{msg.sender_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {msg.sender_email}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {msg.subject}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewMessage(msg)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteMessage(msg.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select
              value={pagination.limit.toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={pagination.limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageToShow: number;
                  if (pagination.totalPages <= 5) {
                    pageToShow = i + 1;
                  } else if (pagination.page <= 3) {
                    pageToShow = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageToShow = pagination.totalPages - 4 + i;
                  } else {
                    pageToShow = pagination.page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageToShow}
                      variant={
                        pagination.page === pageToShow ? 'default' : 'outline'
                      }
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePageChange(pageToShow)}
                      disabled={loading}
                    >
                      {pageToShow}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasMore || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <>
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{' '}
                of {pagination.total}
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedMessage && (
         <Dialog open={viewMessageDialogOpen} onOpenChange={setViewMessageDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>View Message</DialogTitle>
              <DialogDescription>
                From: {selectedMessage.sender_name} ({selectedMessage.sender_email})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <p className="text-right font-semibold col-span-1">Subject:</p>
                    <p className="col-span-3">{selectedMessage.subject}</p>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <p className="text-right font-semibold col-span-1">Message:</p>
                    <p className="col-span-3 whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {selectedMessage.message}
                    </p>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <p className="text-right font-semibold col-span-1">Received:</p>
                    <p className="col-span-3">
                        {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                </div>
            </div>
            <DialogFooter>
                <Button asChild variant="outline">
                    <a href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject}`}>
                        <Mail className="mr-2 h-4 w-4" /> Reply
                    </a>
                </Button>
              <DialogClose asChild>
                <Button type="button">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default withAuth(ContactMessagesPage); 