'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
	Search,
	ArrowUpDown,
	Plus,
	Filter,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/components/ui/use-toast';
import type { Post } from '@/types/post';
import { withAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from '@/components/ui/card';
import { PostActions } from '@/components/admin/post-actions';
import { Skeleton } from '@/components/ui/skeleton';

interface PaginationData {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasMore: boolean;
}

function PostsPage() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: 'ascending' | 'descending';
	}>({
		key: 'publishedAt',
		direction: 'descending',
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [postToDelete, setPostToDelete] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState<PaginationData>({
		page: 1,
		limit: 10,
		total: 0,
		totalPages: 0,
		hasMore: false,
	});
	const { toast } = useToast();

	// Fetch posts with pagination and filters
	const fetchPosts = async () => {
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
			if (statusFilter !== 'all') queryParams.append('status', statusFilter);

			const response = await fetch(`/api/posts?${queryParams.toString()}`);
      const data = await response.json();
			setPosts(data.data);
			setPagination(data.meta);
		} catch (error) {
			console.error('Error fetching posts:', error);
			toast({
				title: 'Error',
				description: 'Failed to fetch posts. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	// Initial fetch and when filters change
	useEffect(() => {
		fetchPosts();
	}, [pagination.page,pagination.limit, sortConfig, statusFilter]);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			if (pagination.page !== 1) {
				setPagination((prev) => ({ ...prev, page: 1 }));
			} else {
				fetchPosts();
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const handleDeletePost = (id: string) => {
		setPostToDelete(id);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (postToDelete) {
			try {
				const response = await fetch(`/api/posts/${postToDelete}`, {
					method: 'DELETE',
					// No headers needed based on the DELETE route logic
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to delete post.');
				}

				toast({
					title: 'Post deleted',
					description: 'The post has been successfully deleted.',
				});

				// Refetch posts after deletion
				await fetchPosts();

			} catch (error: any) {
				console.error('Error deleting post:', error);
				toast({
					title: 'Error',
					description: error.message || 'Could not delete post.',
					variant: 'destructive',
				});
			} finally {
				setDeleteDialogOpen(false);
				setPostToDelete(null);
			}
		}
	};

	const handleStatusChange = async (postId: string, newStatus: 'published' | 'draft') => {
		// Optimistically update the UI
		const originalPosts = [...posts];
		setPosts(prevPosts => 
			prevPosts.map(p => p.id === postId ? { ...p, status: newStatus } : p)
		);

		try {
			const response = await fetch(`/api/posts/${postId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update status.');
			}

			toast({
				title: 'Status Updated',
				description: `Post status changed to ${newStatus}.`,
			});

			// Optional: Refetch if needed, though optimistic update might suffice
			// await fetchPosts();

		} catch (error: any) {
			console.error('Error updating status:', error);
			// Revert optimistic update on error
			setPosts(originalPosts);
			toast({
				title: 'Error',
				description: error.message || 'Could not update post status.',
				variant: 'destructive',
			});
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

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Posts</h1>
					<p className="text-muted-foreground">Manage your blog posts</p>
				</div>
				<Button asChild>
					<Link href="/admin/posts/create">
						<Plus className="mr-2 h-4 w-4" />
						Create New Post
					</Link>
				</Button>
			</div>
			<Card>
				<CardHeader className="pb-3">
					<CardTitle>Posts Management</CardTitle>
					<CardDescription>
						{loading ? (
							<Skeleton className="h-4 w-48" />
						) : (
							<>
								Showing {pagination.total} posts in total.
								{statusFilter === 'published' &&
									` ${pagination.total} published`}
								{statusFilter === 'draft' && ` ${pagination.total} drafts`}
							</>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 sm:flex-row mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search posts..."
								className="pl-8"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="flex gap-2">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-full sm:w-[180px]">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Posts</SelectItem>
									<SelectItem value="published">Published</SelectItem>
									<SelectItem value="draft">Drafts</SelectItem>
								</SelectContent>
							</Select>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon" className="h-10 w-10">
										<Filter className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Filter by</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>Date: Last 7 days</DropdownMenuItem>
									<DropdownMenuItem>Date: Last 30 days</DropdownMenuItem>
									<DropdownMenuItem>Author: All</DropdownMenuItem>
									<DropdownMenuItem>Category: All</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					<div className=" rounded-md border overflow-hidden">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead
											className="w-[40%] cursor-pointer"
											onClick={() => handleSort('title')}
										>
											<div className="flex items-center">
												Title
												{sortConfig.key === 'title' && (
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
										<TableHead className="hidden sm:table-cell">
											Status
										</TableHead>
										<TableHead
											className="hidden sm:table-cell cursor-pointer"
											onClick={() => handleSort('publishedAt')}
										>
											<div className="flex items-center">
												Date
												{sortConfig.key === 'publishedAt' && (
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
										// Loading skeletons
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
														<Skeleton className="h-6 w-16" />
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
									) : !posts || posts.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="h-24 text-center">
												No posts found.
											</TableCell>
										</TableRow>
									) : (
										posts.map((post) => (
											<TableRow key={post.id}>
												<TableCell>
													<div className="font-medium">{post.title}</div>
													<div className="text-sm text-muted-foreground line-clamp-1 hidden sm:block">
														{post.excerpt}
													</div>
													<div className="sm:hidden">
														<Badge
															variant={
																post.status === 'published'
																	? 'success'
																	: 'warning'
															}
															className={`${
																post.status === 'published'
																	? 'bg-green-100 text-green-800 hover:bg-green-200'
																	: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
															} mt-1`}
														>
															{post.status}
														</Badge>
													</div>
												</TableCell>
												<TableCell className="hidden sm:table-cell">
													<Badge
														variant={
															post.status === 'published'
																? 'success'
																: 'warning'
														}
														className={`${
															post.status === 'published'
																? 'bg-green-100 text-green-800 hover:bg-green-200'
																: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
														}`}
													>
														{post.status}
													</Badge>
												</TableCell>
												<TableCell className="hidden sm:table-cell">
													<div className="text-sm text-muted-foreground">
														{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'N/A'}
													</div>
												</TableCell>
												<TableCell>
													<PostActions
														post={post}
														onDelete={() => handleDeletePost(post.id)}
														onStatusChange={handleStatusChange}
													/>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-6 py-4">
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
									// Show pages around current page
									let pageToShow: number;

									if (pagination.totalPages <= 5) {
										// If 5 or fewer pages, show all pages
										pageToShow = i + 1;
									} else if (pagination.page <= 3) {
										// If near start, show first 5 pages
										pageToShow = i + 1;
									} else if (pagination.page >= pagination.totalPages - 2) {
										// If near end, show last 5 pages
										pageToShow = pagination.totalPages - 4 + i;
									} else {
										// Otherwise show 2 pages before and 2 pages after current
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
							This action cannot be undone. This will permanently delete the
							post.
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
		</div>
	);
}

export default withAuth(PostsPage);
