'use client';

import type React from 'react';

import { useState } from 'react';
import {
	ChevronDown,
	Download,
	Filter,
	LinkIcon,
	Search,
	Trash2,
	UploadCloud,
	X,
	ImageIcon,
	FileText,
	FileIcon,
	Video,
	Music,
	CheckIcon,
	ExternalLink,
	Edit2,
	Lock,
	Globe,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

// Mock data for media files
const mockMediaFiles = [
	{
		id: 1,
		name: 'hero-image.jpg',
		type: 'image',
		url: '/placeholder.svg?height=400&width=600',
		size: '1.2 MB',
		dimensions: '1920x1080',
		uploadedAt: '2023-09-15',
		used: 5,
		status: 'public',
	},
	{
		id: 2,
		name: 'portfolio-photo.jpg',
		type: 'image',
		url: '/placeholder.svg?height=400&width=600',
		size: '843 KB',
		dimensions: '1600x900',
		uploadedAt: '2023-08-22',
		used: 3,
		status: 'public',
	},
	{
		id: 3,
		name: 'project-documentation.pdf',
		type: 'document',
		url: '/placeholder.svg?height=400&width=600&text=PDF',
		size: '2.5 MB',
		dimensions: '',
		uploadedAt: '2023-10-05',
		used: 1,
		status: 'private',
	},
	{
		id: 4,
		name: 'intro-video.mp4',
		type: 'video',
		url: '/placeholder.svg?height=400&width=600&text=VIDEO',
		size: '18.7 MB',
		dimensions: '1920x1080',
		uploadedAt: '2023-09-30',
		used: 2,
		status: 'public',
	},
	{
		id: 5,
		name: 'background-music.mp3',
		type: 'audio',
		url: '/placeholder.svg?height=400&width=600&text=AUDIO',
		size: '5.3 MB',
		dimensions: '',
		uploadedAt: '2023-07-14',
		used: 0,
		status: 'private',
	},
	{
		id: 6,
		name: 'project-screenshot.png',
		type: 'image',
		url: '/placeholder.svg?height=400&width=600',
		size: '1.8 MB',
		dimensions: '2560x1440',
		uploadedAt: '2023-10-12',
		used: 4,
		status: 'public',
	},
	{
		id: 7,
		name: 'resume.pdf',
		type: 'document',
		url: '/placeholder.svg?height=400&width=600&text=PDF',
		size: '512 KB',
		dimensions: '',
		uploadedAt: '2023-06-25',
		used: 1,
		status: 'private',
	},
	{
		id: 8,
		name: 'profile-picture.jpg',
		type: 'image',
		url: '/placeholder.svg?height=400&width=600',
		size: '942 KB',
		dimensions: '800x800',
		uploadedAt: '2023-08-03',
		used: 7,
		status: 'public',
	},
];

export default function MediaLibraryPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
	const [activeTab, setActiveTab] = useState('all');
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [mediaDetails, setMediaDetails] = useState<
		null | (typeof mockMediaFiles)[0]
	>(null);
	const [mediaFiles, setMediaFiles] = useState(mockMediaFiles);

	// Filter media files based on search term and active tab
	const filteredMedia = mediaFiles.filter((file) => {
		const matchesSearch = file.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesTab = activeTab === 'all' || file.type === activeTab;
		return matchesSearch && matchesTab;
	});

	const handleFileSelect = (id: number) => {
		setSelectedFiles((prev) =>
			prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
		);
	};

	const handleSelectAll = () => {
		if (selectedFiles.length === filteredMedia.length) {
			setSelectedFiles([]);
		} else {
			setSelectedFiles(filteredMedia.map((file) => file.id));
		}
	};

	const handleDelete = (ids: number[]) => {
		// In a real application, this would call an API to delete the files
		toast({
			title: 'Files deleted',
			description: `${ids.length} file(s) have been deleted.`,
		});
		setSelectedFiles([]);
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			// Simulate file upload with progress
			setIsUploading(true);
			setUploadProgress(0);

			const interval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 100) {
						clearInterval(interval);
						setTimeout(() => {
							setIsUploading(false);
							toast({
								title: 'Upload complete',
								description: `${e.target.files?.length} file(s) uploaded successfully.`,
							});
						}, 500);
						return 100;
					}
					return prev + 5;
				});
			}, 100);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: 'Link copied',
			description: 'The file URL has been copied to your clipboard.',
		});
	};

	const getFileIcon = (type: string) => {
		switch (type) {
			case 'image':
				return <ImageIcon className="h-6 w-6 text-blue-500" />;
			case 'document':
				return <FileText className="h-6 w-6 text-yellow-500" />;
			case 'video':
				return <Video className="h-6 w-6 text-red-500" />;
			case 'audio':
				return <Music className="h-6 w-6 text-green-500" />;
			default:
				return <FileIcon className="h-6 w-6 text-gray-500" />;
		}
	};

	const toggleFileStatus = (id: number) => {
		setMediaFiles((prev) =>
			prev.map((file) => {
				if (file.id === id) {
					const newStatus = file.status === 'public' ? 'private' : 'public';
					toast({
						title: 'Status updated',
						description: `File "${file.name}" is now ${newStatus}.`,
					});
					return { ...file, status: newStatus };
				}
				return file;
			})
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
					<p className="text-muted-foreground">
						Manage your media files and assets.
					</p>
				</div>
				<div className="flex gap-2">
					<Dialog>
						<DialogTrigger asChild>
							<Button className="gap-1">
								<UploadCloud className="h-4 w-4" />
								<span>Upload</span>
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Upload Files</DialogTitle>
								<DialogDescription>
									Drag and drop files here or click to browse.
								</DialogDescription>
							</DialogHeader>
							<div
								className={`mt-4 rounded-lg border-2 border-dashed p-12 text-center ${
									isUploading ? 'border-primary' : 'border-border'
								}`}
							>
								{isUploading ? (
									<div className="space-y-4">
										<div className="flex justify-center">
											<UploadCloud className="h-12 w-12 text-muted-foreground animate-pulse" />
										</div>
										<div className="space-y-2">
											<p className="text-sm font-medium">Uploading files...</p>
											<Progress value={uploadProgress} />
											<p className="text-xs text-muted-foreground">
												{uploadProgress}% complete
											</p>
										</div>
									</div>
								) : (
									<>
										<UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
										<div className="mt-4">
											<Label
												htmlFor="file-upload"
												className="cursor-pointer text-primary hover:underline"
											>
												Choose files
											</Label>
											<Input
												id="file-upload"
												type="file"
												multiple
												className="hidden"
												onChange={handleFileUpload}
											/>
											<p className="mt-2 text-sm text-muted-foreground">
												or drag and drop
											</p>
										</div>
										<p className="mt-2 text-xs text-muted-foreground">
											Support for images, videos, documents, and audio files.
											<br />
											Max file size: 10MB
										</p>
									</>
								)}
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setIsUploading(false)}>
									Cancel
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<Card className="border shadow-sm">
				<CardHeader className="p-4 border-b">
					<div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
						<div className="flex flex-1 items-center gap-2 bg-muted rounded-md pl-2">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search files..."
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
						<div className="flex gap-2">
							<Tabs
								value={activeTab}
								onValueChange={setActiveTab}
								className="hidden sm:block"
							>
								<TabsList>
									<TabsTrigger value="all">All</TabsTrigger>
									<TabsTrigger value="image">Images</TabsTrigger>
									<TabsTrigger value="document">Documents</TabsTrigger>
									<TabsTrigger value="video">Videos</TabsTrigger>
									<TabsTrigger value="audio">Audio</TabsTrigger>
								</TabsList>
							</Tabs>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon" className="sm:hidden">
										<Filter className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => setActiveTab('all')}>
										{activeTab === 'all' && (
											<CheckIcon className="mr-2 h-4 w-4" />
										)}
										All
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setActiveTab('image')}>
										{activeTab === 'image' && (
											<CheckIcon className="mr-2 h-4 w-4" />
										)}
										Images
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setActiveTab('document')}>
										{activeTab === 'document' && (
											<CheckIcon className="mr-2 h-4 w-4" />
										)}
										Documents
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setActiveTab('video')}>
										{activeTab === 'video' && (
											<CheckIcon className="mr-2 h-4 w-4" />
										)}
										Videos
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setActiveTab('audio')}>
										{activeTab === 'audio' && (
											<CheckIcon className="mr-2 h-4 w-4" />
										)}
										Audio
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-4">
					{selectedFiles.length > 0 && (
						<div className="flex items-center justify-between mb-4 p-2 bg-muted rounded-lg">
							<div className="flex items-center gap-2">
								<Checkbox
									checked={selectedFiles.length === filteredMedia.length}
									onCheckedChange={handleSelectAll}
								/>
								<span className="text-sm font-medium">
									{selectedFiles.length} item
									{selectedFiles.length !== 1 ? 's' : ''} selected
								</span>
							</div>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleDelete(selectedFiles)}
							>
								<Trash2 className="mr-2 h-3 w-3" />
								Delete Selected
							</Button>
						</div>
					)}

					{filteredMedia.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{filteredMedia.map((file) => (
								<Card key={file.id} className="overflow-hidden border">
									<div className="relative aspect-square group">
										{/* Checkbox for selection */}
										<div className="absolute top-2 left-2 z-10">
											<Checkbox
												checked={selectedFiles.includes(file.id)}
												onCheckedChange={() => handleFileSelect(file.id)}
												className="bg-background/90 border-background/90"
											/>
										</div>
										{file.status === 'private' && (
											<div className="absolute top-2 right-2 z-10 bg-background/90 rounded-full p-1">
												<Lock className="h-3 w-3 text-amber-500" />
											</div>
										)}
										{/* File preview */}
										<div className="relative h-full w-full bg-muted flex items-center justify-center overflow-hidden">
											{file.type === 'image' ? (
												<Image
													src={file.url || '/placeholder.svg'}
													alt={file.name}
													fill
													className="object-cover transition-opacity group-hover:opacity-80"
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center bg-muted">
													{getFileIcon(file.type)}
												</div>
											)}

											{/* Overlay with actions */}
											<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
												<Button
													variant="secondary"
													size="icon"
													className="h-8 w-8"
													onClick={() => setMediaDetails(file)}
												>
													<ExternalLink className="h-4 w-4" />
												</Button>
												<Button
													variant="secondary"
													size="icon"
													className="h-8 w-8"
													onClick={() =>
														copyToClipboard(
															`https://example.com/media/${file.id}`
														)
													}
												>
													<LinkIcon className="h-4 w-4" />
												</Button>
												<Button
													variant="secondary"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleDelete([file.id])}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>

									<CardFooter className="block px-2 py-2">
										<div className="flex items-center justify-between mb-1">
											<h3
												className="text-sm font-medium truncate"
												title={file.name}
											>
												{file.name}
											</h3>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6"
													>
														<ChevronDown className="h-3 w-3" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => setMediaDetails(file)}
													>
														View details
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() =>
															copyToClipboard(
																`https://example.com/media/${file.id}`
															)
														}
													>
														Copy link
													</DropdownMenuItem>
													<DropdownMenuItem>Download</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														onClick={() => handleDelete([file.id])}
														className="text-destructive focus:text-destructive"
													>
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											<span>{file.size}</span>
											<span>{file.uploadedAt}</span>
										</div>
										<div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
											<span className="text-xs flex items-center gap-1">
												{file.status === 'private' ? (
													<span className="flex items-center text-amber-500">
														<Lock className="h-3 w-3 mr-1" />
														Private
													</span>
												) : (
													<span className="flex items-center text-green-500">
														<Globe className="h-3 w-3 mr-1" />
														Public
													</span>
												)}
											</span>
											<div className="flex items-center gap-2">
												<span className="text-xs text-muted-foreground">
													{file.status === 'private' ? 'Private' : 'Public'}
												</span>
												<Switch
													checked={file.status === 'public'}
													onCheckedChange={() => toggleFileStatus(file.id)}
													size="sm"
												/>
											</div>
										</div>
									</CardFooter>
								</Card>
							))}
						</div>
					) : (
						<div className="py-20 text-center">
							<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
								<ImageIcon className="h-10 w-10 text-muted-foreground" />
							</div>
							<h3 className="mt-4 text-lg font-semibold">No media found</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								{searchTerm
									? 'No results match your search'
									: 'Upload some files to get started'}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Media details dialog */}
			{mediaDetails && (
				<Dialog
					open={!!mediaDetails}
					onOpenChange={(open) => !open && setMediaDetails(null)}
				>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								{getFileIcon(mediaDetails.type)}
								<span className="truncate">{mediaDetails.name}</span>
							</DialogTitle>
						</DialogHeader>
						<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
							<div className="md:col-span-3 aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
								{mediaDetails.type === 'image' ? (
									<div className="relative w-full h-full">
										<Image
											src={mediaDetails.url || '/placeholder.svg'}
											alt={mediaDetails.name}
											fill
											className="object-contain"
										/>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center gap-2">
										{getFileIcon(mediaDetails.type)}
										<span className="text-sm font-medium">
											{mediaDetails.type.toUpperCase()} File
										</span>
									</div>
								)}
							</div>
							<div className="md:col-span-2 space-y-4">
								<div className="space-y-2">
									<h4 className="text-sm font-medium text-muted-foreground">
										Details
									</h4>
									<div className="grid grid-cols-2 gap-1 text-sm">
										<div className="font-medium">File name:</div>
										<div className="truncate">{mediaDetails.name}</div>

										<div className="font-medium">File type:</div>
										<div>{mediaDetails.type}</div>

										<div className="font-medium">File size:</div>
										<div>{mediaDetails.size}</div>

										{mediaDetails.dimensions && (
											<>
												<div className="font-medium">Dimensions:</div>
												<div>{mediaDetails.dimensions}</div>
											</>
										)}

										<div className="font-medium">Uploaded:</div>
										<div>{mediaDetails.uploadedAt}</div>

										<div className="font-medium">Used in:</div>
										<div>
											{mediaDetails.used} place
											{mediaDetails.used !== 1 ? 's' : ''}
										</div>
										<div className="font-medium">Status:</div>
										<div className="flex items-center gap-2">
											{mediaDetails.status === 'private' ? (
												<span className="flex items-center text-amber-500">
													<Lock className="h-3 w-3 mr-1" />
													Private
												</span>
											) : (
												<span className="flex items-center text-green-500">
													<Globe className="h-3 w-3 mr-1" />
													Public
												</span>
											)}
											<Switch
												checked={mediaDetails.status === 'public'}
												onCheckedChange={() =>
													toggleFileStatus(mediaDetails.id)
												}
												size="sm"
											/>
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<h4 className="text-sm font-medium text-muted-foreground">
										File URL
									</h4>
									<div className="flex gap-1">
										<Input
											value={`https://example.com/media/${mediaDetails.id}`}
											readOnly
											className="text-xs"
										/>
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												copyToClipboard(
													`https://example.com/media/${mediaDetails.id}`
												)
											}
										>
											<LinkIcon className="h-4 w-4" />
										</Button>
									</div>
								</div>
								<div className="space-y-2 pt-4">
									<div className="flex gap-2 flex-wrap">
										<Button
											onClick={() =>
												window.open(
													`https://example.com/media/${mediaDetails.id}`,
													'_blank'
												)
											}
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											Open
										</Button>
										<Button variant="outline">
											<Download className="mr-2 h-4 w-4" />
											Download
										</Button>
										<Button variant="outline">
											<Edit2 className="mr-2 h-4 w-4" />
											Edit
										</Button>
										<Button
											variant="destructive"
											onClick={() => {
												handleDelete([mediaDetails.id]);
												setMediaDetails(null);
											}}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</Button>
									</div>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
