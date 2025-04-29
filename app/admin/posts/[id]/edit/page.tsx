'use client';

import React, { useState, useEffect } from 'react';
import { cn, checkReadTimeFormat, generateSlug as generateSlugUtil } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft,
	ImageIcon,
	Loader2,
	Calendar,
	Trash,
	AlertCircle,
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
import type { Post } from '@/types/post';
import type { Tag } from '@/types/tag';
import { withAuth } from '@/hooks/use-auth';

interface TagOption {
	value: string;
	label: string;
}

interface EditPostPageProps {
	params: { id: string };
}

function EditPostPage({ params }: EditPostPageProps) {
	// @ts-ignore
	const postId = React.use(params).id;
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [content, setContent] = useState('');
	const [coverImage, setCoverImage] = useState<string | null>(null);
	const [coverImageAltText, setCoverImageAltText] = useState('');
	const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [readTime, setReadTime] = useState('');
	const [readTimeError, setReadTimeError] = useState(false);
	const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
	const [scheduledTime, setScheduledTime] = useState('12:00');
	const [scheduledError, setScheduledError] = useState('');
	const [isCoverGalleryOpen, setIsCoverGalleryOpen] = useState(false);
	const [isOgGalleryOpen, setIsOgGalleryOpen] = useState(false);
	const [metaTitle, setMetaTitle] = useState('');
	const [metaDescription, setMetaDescription] = useState('');
	const [canonicalUrl, setCanonicalUrl] = useState('');
	const [keywords, setKeywords] = useState('');
	const [ogTitle, setOgTitle] = useState('');
	const [ogDescription, setOgDescription] = useState('');
	const [ogImage, setOgImage] = useState<string | null>(null);
	const [allTags, setAllTags] = useState<Tag[]>([]);
	const [tagOptions, setTagOptions] = useState<TagOption[]>([]);

	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const [postResponse, tagsResponse] = await Promise.all([
					fetch(`/api/posts/${postId}`),
					fetch('/api/tags')
				]);

				if (!tagsResponse.ok) {
					throw new Error('Failed to fetch tags');
				}
				const fetchedTags: Tag[] = await tagsResponse.json();
				setAllTags(fetchedTags);
				setTagOptions(fetchedTags.map((tag) => ({ value: tag.id, label: tag.name })));

				if (!postResponse.ok) {
					if (postResponse.status === 404) {
						setError('Post not found. Redirecting...');
						toast({ title: 'Post not found', variant: 'destructive' });
						router.push('/admin/posts');
						return;
					}
					throw new Error('Failed to fetch post data.');
				}
				const post: Post = await postResponse.json();

				setTitle(post.title || '');
				setSlug(post.slug || '');
				setExcerpt(post.excerpt || '');
				setContent(post.content || '');
				setCoverImage(post.image || null);
				setCoverImageAltText(post.image_alt_text || '');
				setStatus(post.status || 'draft');
				setReadTime(post.read_time || '');
				setMetaTitle(post.meta_title || '');
				setMetaDescription(post.meta_description || '');
				setCanonicalUrl(post.seo_canonical_url || '');
				setKeywords(post.seo_keywords || '');
				setOgTitle(post.og_title || '');
				setOgDescription(post.og_description || '');
				setOgImage(post.og_image_url || null);

				if (post.tags && Array.isArray(post.tags)) {
					const postTagIds = post.tags
						.map(tag => (typeof tag === 'object' && tag !== null && 'id' in tag) ? tag.id : undefined)
						.filter((tagId): tagId is string => tagId !== undefined && fetchedTags.some(t => t.id === tagId));
					setSelectedTags(postTagIds);
				} else {
					setSelectedTags([]);
				}

				if (post.status === 'scheduled' && post.scheduled_publish_time) {
					const scheduledDateTime = new Date(post.scheduled_publish_time);
					setScheduledDate(scheduledDateTime);
					const hours = scheduledDateTime.getHours().toString().padStart(2, '0');
					const minutes = scheduledDateTime.getMinutes().toString().padStart(2, '0');
					setScheduledTime(`${hours}:${minutes}`);
				} else {
					setScheduledDate(undefined);
					setScheduledTime('12:00');
				}

			} catch (error: any) {
				console.error('Error fetching data:', error);
				setError(error.message || 'Failed to load edit page data.');
				toast({
					title: 'Error Loading Data',
					description: error.message || 'Could not load required data.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [postId, router, toast]);

	useEffect(() => {
		if (status === 'scheduled' && !scheduledDate) {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			setScheduledDate(tomorrow);
		} else if (status !== 'scheduled') {
			setScheduledDate(undefined);
			setScheduledTime('12:00');
			setScheduledError('');
		}
	}, [status, scheduledDate]);

	const validateReadTime = (value: string) => {
		if (!value) {
			setReadTimeError(false);
			return true;
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
		if (status !== 'scheduled') {
			setScheduledError('');
			return true;
		}

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

	useEffect(() => {
		validateScheduledDateTime();
	}, [scheduledDate, scheduledTime, status]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const isReadTimeValid = validateReadTime(readTime);
		const isScheduleValid = validateScheduledDateTime();

		if (!isReadTimeValid || !isScheduleValid) {
			toast({
				title: 'Validation Error',
				description: 'Please fix the errors before submitting.',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);

		let scheduledDateTimeString: string | null = null;
		if (status === 'scheduled' && scheduledDate) {
			const [hours, minutes] = scheduledTime.split(':').map(Number);
			const scheduledDateTime = new Date(scheduledDate);
			scheduledDateTime.setHours(hours, minutes, 0, 0);
			scheduledDateTimeString = scheduledDateTime.toISOString();
		}

		const apiTags = selectedTags.map((tagId) => {
			const existingTag = allTags.find((t) => t.id === tagId);
			if (existingTag) {
				return { id: existingTag.id, name: existingTag.name };
			} else {
				return { name: tagId };
			}
		});

		const postData = {
			title,
			slug,
			excerpt: excerpt || undefined,
			content: content || undefined,
			image: coverImage || undefined,
			image_alt_text: coverImageAltText || undefined,
			read_time: readTime || undefined,
			status,
			meta_title: metaTitle || undefined,
			meta_description: metaDescription || undefined,
			og_title: ogTitle || undefined,
			og_description: ogDescription || undefined,
			seo_keywords: keywords || undefined,
			seo_canonical_url: canonicalUrl || undefined,
			og_image_url: ogImage || undefined,
			scheduled_publish_time: scheduledDateTimeString,
			tags: apiTags,
		};

		try {
			const response = await fetch(`/api/posts/${postId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(postData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('API Error:', errorData);
				let errorMessage = 'Failed to update post.';
				if (errorData.error) {
					if (typeof errorData.error === 'object' && errorData.error._errors) {
						errorMessage = errorData.error._errors.join(', ');
					} else if (typeof errorData.error === 'string') {
						errorMessage = errorData.error;
					}
				}
				throw new Error(errorMessage);
			}

			const result = await response.json();

			toast({
				title: 'Post updated',
				description: `Your post "${title}" has been updated successfully.`,
			});
			router.push('/admin/posts');
			router.refresh();
		} catch (error: any) {
			console.error('Submission Error:', error);
			toast({
				title: 'Error',
				description: error.message || 'An error occurred while updating the post.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const generateSlug = () => {
		setSlug(generateSlugUtil(title));
	};

	const handleSelectCoverImage = (imageUrl: string, altTextProvided: string) => {
		setCoverImage(imageUrl);
		setCoverImageAltText(altTextProvided || '');
		if (!ogImage) {
			setOgImage(imageUrl);
		}
		setIsCoverGalleryOpen(false);
	};

	const handleSelectOgImage = (imageUrl: string, altTextProvided: string) => {
		setOgImage(imageUrl);
		setIsOgGalleryOpen(false);
	};

	const getFormattedScheduledDate = () => {
		if (!scheduledDate) return 'Select date';
		return format(scheduledDate, 'PPP');
	};

	if (isLoading) {
		return (
			<div className="flex h-[80vh] items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Loading post editor...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-[80vh] items-center justify-center">
				<div className="flex flex-col items-center gap-3 text-center p-4">
					<AlertCircle className="h-10 w-10 text-destructive" />
					<h2 className="text-xl font-semibold">Error Loading Post</h2>
					<p className="text-muted-foreground">{error}</p>
					<Button onClick={() => router.push('/admin/posts')}>Go Back to Posts</Button>
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
					</TabsList>

					<TabsContent value="content" className="space-y-6 mt-0">
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
											placeholder="post-slug-generated-here"
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
										placeholder="Brief description of the post (used in summaries and SEO)"
										value={excerpt}
										onChange={(e) => setExcerpt(e.target.value)}
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
											<Label htmlFor="cover-image">Cover Image</Label>
											<div className="flex flex-col gap-4">
												{coverImage ? (
													<div className="relative aspect-video w-full overflow-hidden rounded-lg border">
														<Image
															src={coverImage}
															alt={coverImageAltText || 'Cover image'}
															fill
															sizes="(max-width: 768px) 100vw, 33vw"
															className="object-cover"
														/>
														<Button
															variant="destructive"
															size="icon"
															className="absolute top-2 right-2 z-10"
															aria-label="Remove cover image"
															onClick={() => {
																setCoverImage(null);
																setCoverImageAltText('');
															}}
														>
															<Trash className="h-4 w-4" />
														</Button>
													</div>
												) : (
													<div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed">
														<div className="flex flex-col items-center gap-1 text-center">
															<ImageIcon className="h-8 w-8 text-muted-foreground" />
															<p className="text-sm text-muted-foreground">
																No cover image selected
															</p>
														</div>
													</div>
												)}
												{coverImage && (
													<div className='space-y-1'>
														<Label htmlFor="cover-image-alt" className='text-xs'>Alt Text</Label>
														<Input
															id="cover-image-alt"
															placeholder="Describe the cover image"
															value={coverImageAltText}
															onChange={(e) => setCoverImageAltText(e.target.value)}
														/>
													</div>
												)}
												<Button
													type="button"
													variant="outline"
													onClick={() => setIsCoverGalleryOpen(true)}
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
											<Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'published' | 'scheduled')}>
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
													<Label htmlFor="scheduledDate" className='text-sm font-medium'>
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
																aria-label='Select publication date'
																className={cn(
																	'w-full justify-start text-left font-normal',
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
																disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
																initialFocus
															/>
														</PopoverContent>
													</Popover>
													<Input
														type="time"
														aria-label="Select publication time"
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
											{tagOptions.length === 0 && !isLoading ? (
												<p className="text-sm text-muted-foreground">No tags available.</p>
											) : (
												<MultiSelect
													options={tagOptions}
													selected={selectedTags}
													onChange={setSelectedTags}
													placeholder="Select or create tags..."
													creatable={true}
												/>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="readTime">Read Time</Label>
											<Input
												id="readTime"
												placeholder="e.g., 5 min read"
												value={readTime}
												onChange={handleReadTimeChange}
												onBlur={() => validateReadTime(readTime)}
												className={cn(readTimeError ? 'border-red-500 focus-visible:ring-red-500' : '')}
											/>
											{readTimeError && (
												<p className="text-xs text-red-500">
													Invalid format. Use 'X min read' or 'X hours read'.
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
										placeholder="Enter meta title (keep it concise)"
										value={metaTitle}
										onChange={(e) => setMetaTitle(e.target.value)}
									/>
									<p className="text-xs text-muted-foreground">Recommended: 50-60 characters. Currently: {metaTitle.length}</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="metaDescription">Meta Description</Label>
									<Textarea
										id="metaDescription"
										placeholder="Enter meta description (summary for search engines)"
										value={metaDescription}
										onChange={(e) => setMetaDescription(e.target.value)}
										className="min-h-[100px]"
									/>
									<p className="text-xs text-muted-foreground">Recommended: 150-160 characters. Currently: {metaDescription.length}</p>
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

								<div className="space-y-2">
									<Label htmlFor="canonicalUrl">Canonical URL</Label>
									<Input
										id="canonicalUrl"
										type='url'
										placeholder="https://yourdomain.com/original-post-url"
										value={canonicalUrl}
										onChange={(e) => setCanonicalUrl(e.target.value)}
									/>
									<p className="text-xs text-muted-foreground">Use if this content is duplicated from another source.</p>
								</div>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="ogTitle">Open Graph Title</Label>
									<Input
										id="ogTitle"
										placeholder="Enter OG title (for social media sharing)"
										value={ogTitle}
										onChange={(e) => setOgTitle(e.target.value)}
									/>
									<p className="text-xs text-muted-foreground">If empty, defaults to Meta Title or Post Title.</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="ogDescription">Open Graph Description</Label>
									<Textarea
										id="ogDescription"
										placeholder="Enter OG description (for social media sharing)"
										value={ogDescription}
										onChange={(e) => setOgDescription(e.target.value)}
										className="min-h-[100px]"
									/>
									<p className="text-xs text-muted-foreground">If empty, defaults to Meta Description or Excerpt.</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="ogImage">Open Graph Image</Label>
									<div className="flex flex-col gap-2">
										{ogImage ? (
											<div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-lg border">
												<Image
													src={ogImage}
													alt="Open Graph Image Preview"
													fill
													sizes="(max-width: 768px) 100vw, 50vw"
													className="object-cover"
												/>
												<Button
													variant="destructive"
													size="icon"
													className="absolute top-2 right-2 z-10"
													aria-label="Remove OG image"
													onClick={() => setOgImage(null)}
												>
													<Trash className="h-4 w-4" />
												</Button>
											</div>
										) : (
											<div className="flex aspect-[1.91/1] w-full items-center justify-center rounded-lg border border-dashed">
												<div className="flex flex-col items-center gap-1 text-center">
													<ImageIcon className="h-8 w-8 text-muted-foreground" />
													<p className="text-sm text-muted-foreground">
														No OG image selected
													</p>
												</div>
											</div>
										)}
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsOgGalleryOpen(true)}
										>
											{ogImage ? 'Change OG Image' : 'Select OG Image'}
										</Button>
									</div>
									<p className="text-xs text-muted-foreground">
										Recommended size: 1200x630 pixels. If empty, defaults to Cover Image.
									</p>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>

				<div className="flex justify-end gap-4 sticky bottom-0 bg-background py-4 border-t -mx-4 px-4 md:-mx-6 md:px-6">
					<Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting || isLoading}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Update Post
					</Button>
				</div>
			</form>

			<ImageGalleryPicker
				open={isCoverGalleryOpen}
				onOpenChange={setIsCoverGalleryOpen}
				onSelectImage={handleSelectCoverImage}
				isPostImageUpload={true}
			/>

			<ImageGalleryPicker
				open={isOgGalleryOpen}
				onOpenChange={setIsOgGalleryOpen}
				onSelectImage={handleSelectOgImage}
			/>
		</div>
	);
}

export default withAuth(EditPostPage);
