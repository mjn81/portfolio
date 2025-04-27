'use client';

import { cn, checkReadTimeFormat } from '@/lib/utils';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft,
	ImageIcon,
	Loader2,
	Link2,
	Info,
	Tag,
	Globe,
	Clock,
	Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { mockPosts } from '@/lib/mock-data';
import { withAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { MultiSelect } from '@/components/ui/multi-select';
import { format } from 'date-fns';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ImageGalleryPicker } from '@/components/admin/image-gallery-picker';
import Image from 'next/image';
import { Trash } from 'lucide-react';

function EditPostPage({ params }: { params: { id: string } }) {
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [content, setContent] = useState('');
	const [coverImage, setCoverImage] = useState('');
	const [status, setStatus] = useState('draft');
	const [tags, setTags] = useState<string[]>([]);
	const [readTime, setReadTime] = useState('');
	const [readTimeError, setReadTimeError] = useState(false);
	const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
		undefined
	);
	const [scheduledTime, setScheduledTime] = useState('12:00');
	const [scheduledError, setScheduledError] = useState('');
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [ogGalleryOpen, setOgGalleryOpen] = useState(false);

	// SEO fields
	const [metaTitle, setMetaTitle] = useState('');
	const [metaDescription, setMetaDescription] = useState('');
	const [canonicalUrl, setCanonicalUrl] = useState('');
	const [keywords, setKeywords] = useState('');
	const [ogTitle, setOgTitle] = useState('');
	const [ogDescription, setOgDescription] = useState('');
	const [ogImage, setOgImage] = useState('');

	const router = useRouter();
	const { toast } = useToast();

	// Available tag options
	const tagOptions = [
		{ value: 'nextjs', label: 'Next.js' },
		{ value: 'react', label: 'React' },
		{ value: 'javascript', label: 'JavaScript' },
		{ value: 'typescript', label: 'TypeScript' },
		{ value: 'tutorial', label: 'Tutorial' },
		{ value: 'design', label: 'Design' },
		{ value: 'ui', label: 'UI' },
		{ value: 'ux', label: 'UX' },
		{ value: 'frontend', label: 'Frontend' },
		{ value: 'backend', label: 'Backend' },
		{ value: 'fullstack', label: 'Full Stack' },
		{ value: 'development', label: 'Development' },
	];

	useEffect(() => {
		// In a real app, this would be an API call
		const post = mockPosts.find((p) => p.id === params.id);

		if (post) {
			setTitle(post.title);
			setSlug(post.slug);
			setExcerpt(post.excerpt);
			setContent(post.content);
			setCoverImage(post.coverImage);
			setStatus(post.status);
			setTags(post.tags);
			setReadTime(post.readTime || '');

			// Set scheduled date if post is scheduled
			if (post.status === 'scheduled' && post.scheduledPublishTime) {
				const scheduledDateTime = new Date(post.scheduledPublishTime);
				setScheduledDate(scheduledDateTime);

				// Format time as HH:MM
				const hours = scheduledDateTime.getHours().toString().padStart(2, '0');
				const minutes = scheduledDateTime
					.getMinutes()
					.toString()
					.padStart(2, '0');
				setScheduledTime(`${hours}:${minutes}`);
			}

			// Set SEO fields with defaults if not available
			setMetaTitle(post.metaTitle || post.title);
			setMetaDescription(post.metaDescription || post.excerpt);
			setCanonicalUrl(
				post.canonicalUrl || `https://example.com/blog/${post.slug}`
			);
			setKeywords(post.keywords || post.tags.join(', '));
			setOgTitle(post.ogTitle || post.title);
			setOgDescription(post.ogDescription || post.excerpt);
			setOgImage(post.ogImage || post.coverImage);

			setIsLoading(false);
		} else {
			toast({
				title: 'Post not found',
				description: 'The post you are trying to edit does not exist.',
				variant: 'destructive',
			});
			router.push('/admin/posts');
		}
	}, [params.id, router, toast]);

	// Effect to handle status change
	useEffect(() => {
		if (status === 'scheduled' && !scheduledDate) {
			// Default to tomorrow
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			setScheduledDate(tomorrow);
		}
	}, [status]);

	const validateReadTime = (value: string) => {
		if (!value) {
			setReadTimeError(false);
			return;
		}

		const isValid = checkReadTimeFormat(value);
		setReadTimeError(!isValid);
		return isValid;
	};

	const handleReadTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setReadTime(value);
		validateReadTime(value);
	};

	const validateScheduledDateTime = () => {
		if (status !== 'scheduled') return true;

		if (!scheduledDate) {
			setScheduledError('Please select a publication date');
			return false;
		}

		const [hours, minutes] = scheduledTime.split(':').map(Number);
		const scheduledDateTime = new Date(scheduledDate);
		scheduledDateTime.setHours(hours, minutes, 0, 0);

		const now = new Date();

		if (scheduledDateTime <= now) {
			setScheduledError('Scheduled time must be in the future');
			return false;
		}

		setScheduledError('');
		return true;
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setScheduledTime(e.target.value);
		validateScheduledDateTime();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate read time before submission
		if (readTime && !validateReadTime(readTime)) {
			toast({
				title: 'Invalid read time format',
				description: "Please use the format '5 min read' or '1 hours read'",
				variant: 'destructive',
			});
			return;
		}

		// Validate scheduled date/time
		if (!validateScheduledDateTime()) {
			toast({
				title: 'Invalid scheduled time',
				description: scheduledError,
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// In a real app, this would be an API call with the scheduled date/time
			// For scheduled posts, we would include the scheduledDate and scheduledTime
			let publishData = {};

			if (status === 'scheduled' && scheduledDate) {
				const [hours, minutes] = scheduledTime.split(':').map(Number);
				const scheduledDateTime = new Date(scheduledDate);
				scheduledDateTime.setHours(hours, minutes, 0, 0);

				publishData = {
					scheduledPublishTime: scheduledDateTime.toISOString(),
				};
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: status === 'scheduled' ? 'Post scheduled' : 'Post updated',
				description:
					status === 'scheduled'
						? `Your post has been scheduled for publication on ${format(
								scheduledDate!,
								'PPP'
						  )} at ${scheduledTime}.`
						: 'Your post has been updated successfully.',
			});
			router.push('/admin/posts');
		} catch (error) {
			toast({
				title: 'Error',
				description: 'An error occurred while updating the post.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const generateSlug = () => {
		setSlug(
			title
				.toLowerCase()
				.replace(/[^\w\s]/gi, '')
				.replace(/\s+/g, '-')
		);
	};

	const handleSelectCoverImage = (imageUrl: string) => {
		setCoverImage(imageUrl);
		setGalleryOpen(false);
	};

	const handleSelectOgImage = (imageUrl: string) => {
		setOgImage(imageUrl);
		setOgGalleryOpen(false);
	};

	const getFormattedScheduledDate = () => {
		if (!scheduledDate) return 'Select date';
		return format(scheduledDate, 'PPP');
	};

	if (isLoading) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Loading post...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 pb-10">
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="h-8 w-8"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
					Edit Post
				</h1>
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				<Tabs defaultValue="content" className="w-full">
					<TabsList className="mb-6 w-full justify-start overflow-x-auto">
						<TabsTrigger value="content">Content</TabsTrigger>
						<TabsTrigger value="seo">SEO & Meta</TabsTrigger>
						<TabsTrigger value="settings">Settings</TabsTrigger>
					</TabsList>

					<TabsContent value="content" className="space-y-6">
						<div className="grid gap-6 md:grid-cols-3">
							<div className="space-y-6 md:col-span-2">
								<div className="space-y-2">
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										placeholder="Enter post title"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="slug">Slug</Label>
									<div className="flex items-center gap-2">
										<Input
											id="slug"
											placeholder="enter-post-slug"
											value={slug}
											onChange={(e) => setSlug(e.target.value)}
											required
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={generateSlug}
											className="whitespace-nowrap"
										>
											Generate
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="excerpt">Excerpt</Label>
									<Textarea
										id="excerpt"
										placeholder="Brief description of the post"
										value={excerpt}
										onChange={(e) => setExcerpt(e.target.value)}
										required
										className="min-h-[100px]"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="content">Content</Label>
									<RichTextEditor
										value={content}
										onChange={setContent}
										placeholder="Write your post content here..."
									/>
								</div>
							</div>

							<div className="space-y-6">
								<Card>
									<CardContent className="p-4">
										<div className="space-y-2">
											<Label htmlFor="featured-image">Featured Image</Label>
											<div className="flex flex-col gap-4">
												{coverImage ? (
													<div className="relative aspect-video w-full overflow-hidden rounded-lg border">
														<Image
															src={coverImage || '/placeholder.svg'}
															alt="Featured image"
															fill
															className="object-cover"
														/>
														<Button
															variant="destructive"
															size="icon"
															className="absolute top-2 right-2"
															onClick={() => setCoverImage('')}
														>
															<Trash className="h-4 w-4" />
														</Button>
													</div>
												) : (
													<div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed">
														<div className="flex flex-col items-center gap-1 text-center">
															<ImageIcon className="h-8 w-8 text-muted-foreground" />
															<p className="text-sm text-muted-foreground">
																No featured image selected
															</p>
														</div>
													</div>
												)}
												<Button
													type="button"
													variant="outline"
													onClick={() => setGalleryOpen(true)}
												>
													{coverImage ? 'Change Image' : 'Select Image'}
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4 space-y-4">
										<div className="space-y-2">
											<Label htmlFor="status">Status</Label>
											<Select value={status} onValueChange={setStatus}>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="published">Published</SelectItem>
													<SelectItem value="draft">Draft</SelectItem>
													<SelectItem value="scheduled">Scheduled</SelectItem>
												</SelectContent>
											</Select>
										</div>

										{status === 'scheduled' && (
											<div className="space-y-2 border rounded-md p-3 bg-muted/30">
												<div className="flex items-center justify-between">
													<Label htmlFor="scheduledDate">
														Publication Date
													</Label>
													{scheduledDate && (
														<Badge variant="outline" className="ml-2">
															Scheduled
														</Badge>
													)}
												</div>

												<div className="grid grid-cols-2 gap-2">
													<Popover>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																className={cn(
																	'justify-start text-left font-normal',
																	!scheduledDate && 'text-muted-foreground'
																)}
															>
																<Calendar className="mr-2 h-4 w-4" />
																{getFormattedScheduledDate()}
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-auto p-0">
															<CalendarComponent
																mode="single"
																selected={scheduledDate}
																onSelect={setScheduledDate}
																initialFocus
																disabled={(date) => date < new Date()}
															/>
														</PopoverContent>
													</Popover>

													<div className="relative">
														<Input
															type="time"
															value={scheduledTime}
															onChange={handleTimeChange}
															className="pl-10"
														/>
														<Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
													</div>
												</div>

												{scheduledError && (
													<p className="text-xs text-red-500">
														{scheduledError}
													</p>
												)}

												<p className="text-xs text-muted-foreground">
													Your post will be automatically published at the
													scheduled date and time.
												</p>
											</div>
										)}

										<div className="space-y-2">
											<Label htmlFor="readTime">Read Time</Label>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
													<Clock className="h-4 w-4 text-muted-foreground" />
												</div>
												<Input
													id="readTime"
													placeholder="5 min read"
													value={readTime}
													onChange={handleReadTimeChange}
													className={cn(
														'pl-10',
														readTimeError
															? 'border-red-500 focus-visible:ring-red-500'
															: ''
													)}
												/>
											</div>
											{readTimeError && (
												<p className="text-xs text-red-500">
													Please use the format "5 min read" or "2 hours read"
												</p>
											)}
											<p className="text-xs text-muted-foreground">
												Format: "5 min read" or "1 hours read"
											</p>
										</div>

										<div className="space-y-2">
											<Label htmlFor="tags">Tags</Label>
											<MultiSelect
												options={tagOptions}
												selected={tags}
												onChange={setTags}
												placeholder="Select or create tags..."
												creatable={true}
											/>
											<p className="text-xs text-muted-foreground">
												Select from existing tags or create new ones
											</p>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="seo" className="space-y-6">
						<div className="grid gap-6 md:grid-cols-3">
							<div className="space-y-6 md:col-span-2">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Label htmlFor="metaTitle">Meta Title</Label>
										<div className="text-xs text-muted-foreground">
											(Recommended: 50-60 characters)
										</div>
									</div>
									<Input
										id="metaTitle"
										placeholder="SEO optimized title"
										value={metaTitle}
										onChange={(e) => setMetaTitle(e.target.value)}
									/>
									<div className="text-xs text-muted-foreground text-right">
										{metaTitle.length}/60 characters
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Label htmlFor="metaDescription">Meta Description</Label>
										<div className="text-xs text-muted-foreground">
											(Recommended: 150-160 characters)
										</div>
									</div>
									<Textarea
										id="metaDescription"
										placeholder="Brief SEO description for search engines"
										value={metaDescription}
										onChange={(e) => setMetaDescription(e.target.value)}
										className="min-h-[100px]"
									/>
									<div className="text-xs text-muted-foreground text-right">
										{metaDescription.length}/160 characters
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="keywords">Keywords</Label>
									<Input
										id="keywords"
										placeholder="SEO keywords (comma separated)"
										value={keywords}
										onChange={(e) => setKeywords(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Label htmlFor="canonicalUrl">Canonical URL</Label>
										<Link2 className="h-4 w-4 text-muted-foreground" />
									</div>
									<Input
										id="canonicalUrl"
										placeholder="https://example.com/canonical-page"
										value={canonicalUrl}
										onChange={(e) => setCanonicalUrl(e.target.value)}
									/>
								</div>
							</div>

							<div className="space-y-6">
								<Card>
									<CardContent className="p-4 space-y-4">
										<div className="flex items-center gap-2">
											<Globe className="h-4 w-4" />
											<h3 className="font-medium">Social Media Preview</h3>
										</div>

										<div className="space-y-2">
											<Label htmlFor="ogTitle">OG Title</Label>
											<Input
												id="ogTitle"
												placeholder="Title for social media"
												value={ogTitle}
												onChange={(e) => setOgTitle(e.target.value)}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="ogDescription">OG Description</Label>
											<Textarea
												id="ogDescription"
												placeholder="Description for social media"
												value={ogDescription}
												onChange={(e) => setOgDescription(e.target.value)}
											/>
										</div>

										<div className="space-y-2">
											<Label>OG Image</Label>
											<div
												className="relative aspect-[1.91/1] overflow-hidden rounded-md border border-dashed border-muted-foreground/25 cursor-pointer"
												onClick={() => setOgGalleryOpen(true)}
											>
												<img
													src={ogImage || '/placeholder.svg'}
													alt="OG Image"
													className="h-full w-full object-cover"
												/>
												<div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-opacity hover:bg-black/10">
													<Button
														variant="secondary"
														size="sm"
														className="gap-1.5"
													>
														<ImageIcon className="h-4 w-4" />
														{!ogImage ? 'Add OG Image' : 'Change Image'}
													</Button>
												</div>
											</div>
											<p className="text-xs text-muted-foreground">
												Recommended size: 1200x630 pixels
											</p>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-3">
											<Info className="h-4 w-4 text-blue-500" />
											<h3 className="font-medium">SEO Tips</h3>
										</div>
										<ul className="text-xs space-y-2 text-muted-foreground">
											<li>
												• Use keywords naturally in your title and description
											</li>
											<li>• Keep meta titles under 60 characters</li>
											<li>• Keep meta descriptions under 160 characters</li>
											<li>• Use unique, descriptive titles for each page</li>
											<li>
												• Include a call-to-action in your meta description
											</li>
										</ul>
									</CardContent>
								</Card>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="settings" className="space-y-6">
						<div className="grid gap-6 md:grid-cols-2">
							<Card>
								<CardContent className="p-4 space-y-4">
									<h3 className="font-medium">Publishing Settings</h3>

									<div className="space-y-2">
										<Label htmlFor="status">Status</Label>
										<Select value={status} onValueChange={setStatus}>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="published">Published</SelectItem>
												<SelectItem value="draft">Draft</SelectItem>
												<SelectItem value="scheduled">Scheduled</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{status === 'scheduled' && (
										<div className="space-y-2 border rounded-md p-3 bg-muted/30">
											<div className="flex items-center justify-between">
												<Label htmlFor="scheduledDate">
													Publication Date & Time
												</Label>
												{scheduledDate && (
													<Badge variant="outline" className="ml-2">
														Scheduled
													</Badge>
												)}
											</div>

											<div className="grid grid-cols-2 gap-2">
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className={cn(
																'justify-start text-left font-normal',
																!scheduledDate && 'text-muted-foreground'
															)}
														>
															<Calendar className="mr-2 h-4 w-4" />
															{getFormattedScheduledDate()}
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0">
														<CalendarComponent
															mode="single"
															selected={scheduledDate}
															onSelect={setScheduledDate}
															initialFocus
															disabled={(date) => date < new Date()}
														/>
													</PopoverContent>
												</Popover>

												<div className="relative">
													<Input
														type="time"
														value={scheduledTime}
														onChange={handleTimeChange}
														className="pl-10"
													/>
													<Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
												</div>
											</div>

											{scheduledError && (
												<p className="text-xs text-red-500">{scheduledError}</p>
											)}

											<p className="text-xs text-muted-foreground">
												Your post will be automatically published at the
												scheduled date and time.
											</p>
										</div>
									)}

									<div className="space-y-2">
										<Label htmlFor="author">Author</Label>
										<Select defaultValue="current">
											<SelectTrigger>
												<SelectValue placeholder="Select author" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="current">Current User</SelectItem>
												<SelectItem value="admin">Admin</SelectItem>
												<SelectItem value="editor">Editor</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4 space-y-4">
									<h3 className="font-medium">Categories</h3>

									<div className="space-y-2">
										<Label htmlFor="category">Primary Category</Label>
										<Select defaultValue="uncategorized">
											<SelectTrigger>
												<SelectValue placeholder="Select category" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="uncategorized">
													Uncategorized
												</SelectItem>
												<SelectItem value="technology">Technology</SelectItem>
												<SelectItem value="design">Design</SelectItem>
												<SelectItem value="development">Development</SelectItem>
												<SelectItem value="business">Business</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Label htmlFor="tags">Tags</Label>
											<Tag className="h-4 w-4 text-muted-foreground" />
										</div>
										<MultiSelect
											options={tagOptions}
											selected={tags}
											onChange={setTags}
											placeholder="Select or create tags..."
											creatable={true}
										/>
										<p className="text-xs text-muted-foreground">
											Select from existing tags or create new ones
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>

				<div className="flex flex-wrap gap-2">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{status === 'published'
							? 'Update & Publish'
							: status === 'scheduled'
							? 'Update Schedule'
							: 'Save as Draft'}
					</Button>
					<Button type="button" variant="outline" onClick={() => router.back()}>
						Cancel
					</Button>
				</div>
			</form>

			{/* Image Gallery Pickers */}
			<ImageGalleryPicker
				open={galleryOpen}
				onOpenChange={setGalleryOpen}
				onSelectImage={handleSelectCoverImage}
				isPostImageUpload={true}
			/>

			<ImageGalleryPicker
				open={ogGalleryOpen}
				onOpenChange={setOgGalleryOpen}
				onSelectImage={handleSelectOgImage}
			/>
		</div>
	);
}

export default withAuth(EditPostPage);
