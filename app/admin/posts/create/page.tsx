'use client';

import { cn, checkReadTimeFormat } from '@/lib/utils';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon, Loader2, Calendar, Trash } from 'lucide-react';
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

function CreatePostPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [content, setContent] = useState('');
	const [coverImage, setCoverImage] = useState(
		'/placeholder.svg?height=400&width=600'
	);
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
	const [featuredImage, setFeaturedImage] = useState<string | null>(null);
	const [isGalleryOpen, setIsGalleryOpen] = useState(false);

	// SEO fields
	const [metaTitle, setMetaTitle] = useState('');
	const [metaDescription, setMetaDescription] = useState('');
	const [canonicalUrl, setCanonicalUrl] = useState('');
	const [keywords, setKeywords] = useState('');
	const [ogTitle, setOgTitle] = useState('');
	const [ogDescription, setOgDescription] = useState('');
	const [ogImage, setOgImage] = useState(
		'/placeholder.svg?height=630&width=1200'
	);

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
				title: status === 'scheduled' ? 'Post scheduled' : 'Post created',
				description:
					status === 'scheduled'
						? `Your post has been scheduled for publication on ${format(
								scheduledDate!,
								'PPP'
						  )} at ${scheduledTime}.`
						: 'Your post has been created successfully.',
			});
			router.push('/admin/posts');
		} catch (error) {
			toast({
				title: 'Error',
				description: 'An error occurred while creating the post.',
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

	const handleSelectImage = (imageUrl: string, altText: string) => {
		setCoverImage(imageUrl);

		// Also update OG image if it's still the default
		if (ogImage.includes('placeholder.svg')) {
			setOgImage(imageUrl);
		}
	};

	const handleSelectFeaturedImage = (imageUrl: string) => {
		setFeaturedImage(imageUrl);
		setIsGalleryOpen(false);
	};

	const getFormattedScheduledDate = () => {
		if (!scheduledDate) return 'Select date';
		return format(scheduledDate, 'PPP');
	};

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
					Create New Post
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
										onBlur={generateSlug}
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
												{featuredImage ? (
													<div className="relative aspect-video w-full overflow-hidden rounded-lg border">
														<Image
															src={featuredImage || '/placeholder.svg'}
															alt="Featured image"
															fill
															className="object-cover"
														/>
														<Button
															variant="destructive"
															size="icon"
															className="absolute top-2 right-2"
															onClick={() => setFeaturedImage(null)}
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
													onClick={() => setIsGalleryOpen(true)}
												>
													{featuredImage ? 'Change Image' : 'Select Image'}
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
																<Calendar className="mr-2" />
															</Button>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-0"
															align="center"
															side="bottom"
														>
															<CalendarComponent
																mode="single"
																selected={scheduledDate}
																onSelect={setScheduledDate}
																disabled={(date) => date < new Date()}
																initialFocus
															/>
														</PopoverContent>
													</Popover>
													<Input
														type="time"
														value={scheduledTime}
														onChange={handleTimeChange}
														className="col-span-1"
													/>
												</div>
												{scheduledError && (
													<p className="text-xs text-red-500">
														{scheduledError}
													</p>
												)}
											</div>
										)}
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4 space-y-4">
										<div className="space-y-2">
											<Label htmlFor="tags">Tags</Label>
											<MultiSelect
												options={tagOptions}
												selected={tags}
												onChange={setTags}
												placeholder="Select or create tags..."
												creatable={true}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="readTime">Read Time</Label>
											<Input
												id="readTime"
												placeholder="e.g., 5 min read, 1 hours read"
												value={readTime}
												onChange={handleReadTimeChange}
												onBlur={() => validateReadTime(readTime)}
											/>
											{readTimeError && (
												<p className="text-xs text-red-500">
													Invalid format. Use '5 min read' or '1 hours read'.
												</p>
											)}
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="seo" className="space-y-6">
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="metaTitle">Meta Title</Label>
									<Input
										id="metaTitle"
										placeholder="Enter meta title"
										value={metaTitle}
										onChange={(e) => setMetaTitle(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="metaDescription">Meta Description</Label>
									<Textarea
										id="metaDescription"
										placeholder="Enter meta description"
										value={metaDescription}
										onChange={(e) => setMetaDescription(e.target.value)}
										className="min-h-[100px]"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="canonicalUrl">Canonical URL</Label>
									<Input
										id="canonicalUrl"
										placeholder="Enter canonical URL"
										value={canonicalUrl}
										onChange={(e) => setCanonicalUrl(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="keywords">Keywords</Label>
									<Input
										id="keywords"
										placeholder="Enter keywords (comma separated)"
										value={keywords}
										onChange={(e) => setKeywords(e.target.value)}
									/>
								</div>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="ogTitle">OG Title</Label>
									<Input
										id="ogTitle"
										placeholder="Enter OG title"
										value={ogTitle}
										onChange={(e) => setOgTitle(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="ogDescription">OG Description</Label>
									<Textarea
										id="ogDescription"
										placeholder="Enter OG description"
										value={ogDescription}
										onChange={(e) => setOgDescription(e.target.value)}
										className="min-h-[100px]"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="ogImage">OG Image</Label>
									<div
										className="relative aspect-video overflow-hidden rounded-md border border-dashed border-muted-foreground/25 cursor-pointer"
										onClick={() => setGalleryOpen(true)}
									>
										<img
											src={ogImage || '/placeholder.svg'}
											alt="OG Image"
											className="h-full w-full object-cover"
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-opacity hover:bg-black/10">
											<Button variant="secondary" size="sm" className="gap-1.5">
												<ImageIcon className="h-4 w-4" />
												{ogImage === '/placeholder.svg?height=630&width=1200'
													? 'Add OG Image'
													: 'Change OG Image'}
											</Button>
										</div>
									</div>
									<p className="text-xs text-muted-foreground">
										Recommended size: 1200x630 pixels
									</p>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="settings" className="space-y-6">
						<div>
							<Label>Settings content here</Label>
						</div>
					</TabsContent>
				</Tabs>

				<div className="flex justify-end gap-4">
					<Button type="button" variant="outline" onClick={() => router.back()}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create Post
					</Button>
				</div>
			</form>

			<ImageGalleryPicker
				open={galleryOpen}
				onOpenChange={setGalleryOpen}
				onSelectImage={handleSelectImage}
			/>
			<ImageGalleryPicker
				open={isGalleryOpen}
				onOpenChange={setIsGalleryOpen}
				onSelectImage={handleSelectFeaturedImage}
				isPostImageUpload={true}
			/>
		</div>
	);
}

export default withAuth(CreatePostPage);
