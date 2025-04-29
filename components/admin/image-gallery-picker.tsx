'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Check, ImageIcon, Search, Upload, X, Lock, Globe, Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MediaFile } from '@/types/file';
import { formatBytes } from '@/lib/utils';

interface ImageGalleryPickerProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSelectImage?: (imageUrl: string, altText: string) => void;
	isPostImageUpload?: boolean;
}

export function ImageGalleryPicker({
	open,
	onOpenChange,
	onSelectImage,
	isPostImageUpload = false,
}: ImageGalleryPickerProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState('browse');
	const [altText, setAltText] = useState('');

	// API State
	const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Upload states
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadFiles, setUploadFiles] = useState<
		{
			file: File;
			progress: number;
			preview?: string;
			status: 'pending' | 'uploading' | 'complete' | 'error';
			error?: string;
			id?: string;
		}[]
	>([]);
	const [uploadIsPrivate, setUploadIsPrivate] = useState(!isPostImageUpload);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// --- Fetch Media ---
	const fetchMedia = useCallback(async () => {
		setIsLoading(true);
		setMediaFiles([]);
		setError(null);

		const queryParams = new URLSearchParams({
			limit: '50',
		});

		try {
			const response = await fetch(`/api/media?${queryParams.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch media files.');
			}
			const data = await response.json();

			setMediaFiles(data.media || []);
		} catch (err: any) {
			console.error('Error fetching media:', err);
			setError(err.message || 'Could not load media.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Initial fetch on dialog open
	useEffect(() => {
		if (open) {
			fetchMedia();
		}
		if (!open) {
			setSelectedImageId(null);
			setSelectedImageUrl(null);
			setAltText('');
			setSearchTerm('');
			setActiveTab('browse');
			setUploadFiles([]);
			setMediaFiles([]);
			setError(null);
		}
	}, [open, fetchMedia]);

	// Filter images based on search term (client-side for now)
	const filteredImages = mediaFiles.filter((file) => {
		const matchesSearch = file.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		return matchesSearch;
	});

	const handleSelectImage = (image: MediaFile) => {
		setSelectedImageId(image.id);
		setSelectedImageUrl(image.url);
		const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, '');
		const formattedName = nameWithoutExtension.replace(/[-_]/g, ' ');
		setAltText(formattedName);
	};

	const handleInsertImage = () => {
		if (selectedImageUrl && onSelectImage) {
			onSelectImage(selectedImageUrl, altText);
			if (onOpenChange) {
				onOpenChange(false);
			}
		}
	};

	// --- Upload Logic ---
	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isDragging) setIsDragging(true);
	};

	const processAndPrepareFiles = (files: FileList | null) => {
		if (!files || files.length === 0) return;

		const fileArray = Array.from(files).filter((file) =>
			file.type.startsWith('image/')
		);

		if (fileArray.length === 0) {
			toast({
				title: 'Invalid files',
				description: 'Please select image files only.',
				variant: 'destructive',
			});
			return;
		}

		const MAX_SIZE = 10 * 1024 * 1024;
		const oversizedFiles = fileArray.filter((file) => file.size > MAX_SIZE);

		if (oversizedFiles.length > 0) {
			toast({
				title: 'Files too large',
				description: `${oversizedFiles.length} file(s) exceed the 10MB limit.`,
				variant: 'destructive',
			});
			return;
		}

		const newUploads = fileArray.map((file) => ({
			file,
			progress: 0,
			preview: URL.createObjectURL(file),
			status: 'pending' as const,
		}));

		setUploadFiles((prev) => [...prev, ...newUploads]);
		handleUpload(newUploads);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		processAndPrepareFiles(e.dataTransfer.files);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		processAndPrepareFiles(e.target.files);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	// Actual file upload
	const handleUpload = async (filesToUpload: typeof uploadFiles) => {
		if (filesToUpload.length === 0) return;

		setIsUploading(true);

		setUploadFiles((prev) =>
			prev.map((up) =>
				filesToUpload.some((ftu) => ftu.file.name === up.file.name && up.status === 'pending')
					? { ...up, status: 'uploading' }
					: up
			)
		);

		const uploadPromises = filesToUpload.map(async (upload) => {
			const formData = new FormData();
			formData.append('files', upload.file);
			formData.append('is_private', String(uploadIsPrivate));

			try {
				const response = await fetch('/api/media/upload', {
					method: 'POST',
					body: formData,
				});

				const result = await response.json();

				if (!response.ok || result.files?.length === 0) {
					throw new Error(result.error || 'Upload failed');
				}

				const uploadedFile = result.files[0];

				setUploadFiles((prev) =>
					prev.map((item) =>
						item.file.name === upload.file.name
							? { ...item, progress: 100, status: 'complete', id: uploadedFile.id }
							: item
					)
				);

				setMediaFiles((prev) => [uploadedFile, ...prev]);

				return { success: true, file: uploadedFile };

			} catch (error: any) {
				console.error('Upload error for:', upload.file.name, error);
				setUploadFiles((prev) =>
					prev.map((item) =>
						item.file.name === upload.file.name
							? { ...item, status: 'error', error: error.message }
							: item
					)
				);
				return { success: false, error: error.message };
			}
		});

		await Promise.all(uploadPromises);

		const stillUploading = uploadFiles.some(up => up.status === 'uploading');
		if (!stillUploading) {
			setIsUploading(false);
			const successfulUploads = uploadFiles.filter(up => up.status === 'complete').length;
			const failedUploads = uploadFiles.filter(up => up.status === 'error').length;

			if (successfulUploads > 0) {
				toast({
					title: 'Upload Complete',
					description: `${successfulUploads} image(s) uploaded successfully.`,
				});
			}
			if (failedUploads > 0) {
				toast({
					title: 'Upload Partially Failed',
					description: `${failedUploads} image(s) failed to upload.`,
					variant: 'destructive',
				});
			}

			if (successfulUploads > 0 && failedUploads === 0) {
				setTimeout(() => {
					setActiveTab('browse');
				}, 1000);
			}
		}
	};

	// --- Render ---
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Media Library</DialogTitle>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="flex-1 flex flex-col overflow-hidden"
				>
					<div className="flex-shrink-0 flex items-center justify-between mb-4 pr-6">
						<TabsList>
							<TabsTrigger value="browse">Browse Library</TabsTrigger>
							<TabsTrigger value="upload">Upload New</TabsTrigger>
						</TabsList>

						{activeTab === 'browse' && (
							<div className="flex flex-1 items-center gap-2 bg-muted rounded-md pl-2 ml-4">
								<Search className="h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search images..."
									className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
								{searchTerm && (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => setSearchTerm('')}
									>
										<X className="h-3 w-3" />
									</Button>
								)}
							</div>
						)}
					</div>

					<div className="flex-1 flex flex-col min-h-0">
						<TabsContent value="browse" className="flex-1 mt-0 flex flex-col">
							<ScrollArea
								className="flex-1 pr-4"
							>
								{error && (
									<div className="py-8 text-center text-red-600 flex flex-col items-center gap-2">
										<AlertCircle className="h-6 w-6" />
										<p>Error loading media: {error}</p>
										<Button variant="outline" size="sm" onClick={() => fetchMedia()}>Retry</Button>
									</div>
								)}
								{!error && filteredImages.length > 0 && (
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
										{filteredImages.map((image) => (
											<div
												key={image.id}
												className={`
                          relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 group
                          ${selectedImageId === image.id
														? 'border-primary ring-2 ring-primary/20'
														: 'border-border hover:border-muted'
													}
                        `}
												onClick={() => handleSelectImage(image)}
											>
												{image.is_private && (
													<div className="absolute top-1 right-1 z-10 bg-background/90 rounded-full p-1">
														<Lock className="h-3 w-3 text-amber-500" />
													</div>
												)}
												<Image
													src={image.url || '/placeholder.svg'}
													alt={image.name}
													fill
													sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
													className="object-cover transition-transform duration-200 group-hover:scale-105"
												/>
												{selectedImageId === image.id && (
													<div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
														<Check className="h-4 w-4" />
													</div>
												)}
												<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
													<p className="text-xs font-medium truncate">{image.name}</p>
													<p className="text-[10px] text-gray-300">{formatBytes(image.size)}</p>
												</div>
											</div>
										))}
									</div>
								)}
								{isLoading && (
									<div className="py-8 flex justify-center items-center gap-2 text-muted-foreground">
										<Loader2 className="h-5 w-5 animate-spin" />
										<span>Loading media...</span>
									</div>
								)}
								{!isLoading && !error && filteredImages.length === 0 && (
									<div className="py-8 text-center">
										<ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<p className="text-muted-foreground">No images found matching your criteria.</p>
										{mediaFiles.length === 0 && !searchTerm && (
											<p className="text-sm text-muted-foreground mt-1">Upload some images to get started!</p>
										)}
									</div>
								)}
							</ScrollArea>
						</TabsContent>

						<TabsContent value="upload" className="flex-1 mt-0">
							<div className="h-full flex flex-col">
								<div
									className={`
                    flex-1 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-6 text-center
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                    ${isUploading ? 'opacity-75' : 'cursor-pointer'}
                  `}
									onDragEnter={handleDragEnter}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
									onDrop={handleDrop}
									onClick={() => !isUploading && fileInputRef.current?.click()}
								>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										multiple
										className="hidden"
										onChange={handleFileInputChange}
										disabled={isUploading}
									/>

									{uploadFiles.length === 0 ? (
										<>
											<Upload className="h-10 w-10 text-muted-foreground mb-4" />
											<h3 className="text-lg font-medium mb-1">
												{isUploading ? 'Uploading...' : 'Drag images here'}
											</h3>
											<p className="text-sm text-muted-foreground mb-4">
												or click to browse
											</p>
											<p className="text-xs text-muted-foreground">
												Supports: JPG, PNG, GIF, WebP • Max size: 10MB per image
											</p>

											<div className="mt-6 flex items-center justify-center gap-2">
												<div className="flex items-center space-x-2">
													<Switch
														id="upload-status"
														checked={!uploadIsPrivate}
														onCheckedChange={(checked) => setUploadIsPrivate(!checked)}
														disabled={isPostImageUpload || isUploading}
													/>
													<Label
														htmlFor="upload-status"
														className="flex items-center gap-1.5 cursor-pointer"
													>
														{!uploadIsPrivate ? (
															<>
																<Globe className="h-4 w-4 text-green-500" /> Public
															</>
														) : (
															<>
																<Lock className="h-4 w-4 text-amber-500" /> Private
															</>
														)}
													</Label>
												</div>
											</div>
											{isPostImageUpload && (
												<p className="text-xs text-muted-foreground mt-1">
													(Post images are always public)
												</p>
											)}
										</>
									) : (
										<div className="w-full max-h-full overflow-y-auto space-y-3 pr-2">
											<h3 className="text-lg font-medium text-center mb-2 sticky top-0 bg-background py-1">
												{isUploading ? 'Uploading...' : 'Upload Queue'}
											</h3>

											{uploadFiles.map((upload, index) => (
												<div key={`${upload.file.name}-${index}`} className="flex items-center gap-3 p-2 border rounded-md bg-muted/30">
													<div className="relative h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
														{upload.preview ? (
															<Image
																src={upload.preview}
																alt={upload.file.name}
																fill
																className="object-cover"
																onLoad={() => URL.revokeObjectURL(upload.preview!)}
															/>
														) : (
															<ImageIcon className="h-6 w-6 m-auto text-muted-foreground" />
														)}
													</div>

													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium truncate">
															{upload.file.name}
														</p>
														{upload.status === 'uploading' && (
															<Progress value={upload.progress} className="h-1.5 mt-1" />
														)}
														{upload.status === 'pending' && (
															<p className="text-xs text-muted-foreground mt-1">Pending...</p>
														)}
														{upload.status === 'error' && (
															<p className="text-xs text-red-500 mt-1 truncate" title={upload.error}>Error: {upload.error}</p>
														)}
													</div>

													{upload.status === 'complete' && (
														<Check className="h-5 w-5 text-green-500 flex-shrink-0" />
													)}
													{upload.status === 'error' && (
														<AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
													)}
													{upload.status === 'uploading' && (
														<Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
													)}
													{(upload.status === 'pending' || upload.status === 'error') && !isUploading && (
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 text-muted-foreground hover:text-destructive"
															onClick={(e) => {
																e.stopPropagation();
																setUploadFiles(prev => prev.filter((f, i) => !(f.file.name === upload.file.name && i === index)));
															}}
														>
															<X className="h-4 w-4" />
														</Button>
													)}
												</div>
											))}

											{!isUploading && uploadFiles.length > 0 && (
												<Button
													variant="outline"
													className="w-full mt-4 sticky bottom-0 bg-background"
													onClick={(e) => {
														e.stopPropagation();
														fileInputRef.current?.click();
													}}
													disabled={isUploading}
												>
													Add More Files
												</Button>
											)}
										</div>
									)}
								</div>
							</div>
						</TabsContent>
					</div>
				</Tabs>

				<DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
					<div className="flex-1 w-full pr-16">
						{selectedImageId && activeTab === 'browse' && (
							<div className="">
								<Label htmlFor="alt-text" className="block text-sm font-medium mb-1">
									Alt Text (for selected image)
								</Label>
								<Input
									id="alt-text"
									value={altText}
									onChange={(e) => setAltText(e.target.value)}
									placeholder="Describe the selected image"
									className="w-full"
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Helps with accessibility and SEO.
								</p>
							</div>
						)}
					</div>
					<Button
						variant="outline"
						onClick={() => onOpenChange && onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleInsertImage}
						disabled={!selectedImageId || activeTab !== 'browse' || isUploading}
					>
						Insert Image
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
