"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Loader2,
  CloudCog,
} from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { MediaFile } from "@/types/file"

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

export default function MediaLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [mediaDetails, setMediaDetails] = useState<null | MediaFile>(null)
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [uploadStatus, setUploadStatus] = useState<"public" | "private">("public")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [currentUploads, setCurrentUploads] = useState<
		{
			file: File;
			progress: number;
			preview?: string;
			status: 'pending' | 'uploading' | 'complete' | 'error';
			isPublic: boolean;
			error?: string;
		}[]
	>([]);

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const fetchMedia = useCallback(async (cursor: string | null = null) => {
    try {
      setIsLoading(true)
      const endpoint = `/api/media?${cursor ? `cursor=${cursor}&` : ''}limit=10`
			
			const response = await fetch(endpoint)

			if (!response.ok) {
				console.error("Error fetching media: Status", response.status, response.statusText);
				toast({
					title: "Error",
					description: "Failed to load media files",
					variant: "destructive",
				})
				return
			}

			const data = await response.json()

			const newMedia = data.media || []
			const nextCursorResponse = data.nextCursor || null
      
      setMediaFiles(prev => cursor ? [...prev, ...newMedia] : newMedia)
      setNextCursor(nextCursorResponse)
      setHasMore(!!nextCursorResponse)
    } catch (error) {
      console.error("Error fetching media (catch block):", error)
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [mediaFiles.length])

  // Initial load
  useEffect(() => {
    fetchMedia()
  }, [])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (isLoading || !hasMore) return
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMedia(nextCursor)
        }
      },
      { threshold: 0.5 }
    )
    
    const currentLoadMoreRef = loadMoreRef.current
    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef)
    }
    
    observerRef.current = observer
    
    return () => {
      if (currentLoadMoreRef && observer) {
        observer.unobserve(currentLoadMoreRef)
      }
    }
  }, [fetchMedia, hasMore, isLoading, nextCursor])

  // Filter media files based on search term and active tab
  const filteredMedia = mediaFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || file.type === activeTab
    return matchesSearch && matchesTab
  })

  const handleFileSelect = (id: string) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredMedia.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredMedia.map((file) => file.id))
    }
  }

  const handleDelete = async (ids: string[]) => {
		const api = `/api/media/`
		const response = await fetch(api, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ mediaIds: ids }),
		});
		if (!response.ok) {
			toast({
				title: "Error",
				description: "Failed to delete files",
				variant: "destructive",
			})
			return
		}
		toast({
      title: "Files deleted",
      description: `${ids.length} file(s) have been deleted.`,
    })
    setSelectedFiles([])
    // Update the main media files list by filtering out the deleted IDs
    console.log('Filtering mediaFiles, removing IDs:', ids); // Log IDs being removed
    setMediaFiles(prev => prev.filter(file => !ids.includes(file.id)))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Create upload objects with previews and default privacy setting
      const newUploads = Array.from(e.target.files).map((file) => {
        return {
          file,
          progress: 0,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          status: "pending" as const,
          isPublic: uploadStatus === "public", // Default to current global setting
        }
			})
			
			
      setCurrentUploads(newUploads)
      setIsUploading(false) // Don't start upload automatically
    }
  }

  const copyToClipboard = (text: string | null | undefined) => {
    if (!text) {
      toast({
        title: "Cannot copy URL",
        description: "No URL available for this file (it might be private).",
        variant: "destructive"
      })
      return;
    }
		navigator.clipboard.writeText(text)
		toast({
			title: "Link copied",
			description: "The file URL has been copied to your clipboard.",
		})
	}

  const toggleFileStatus = async (id: string) => {
		const api = `/api/media/privacy/`

		const response = await fetch(api, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ mediaId: id }),
		})

		if (!response.ok) {
			toast({
				title: "Error",
				description: "Failed to toggle file privacy",
				variant: "destructive",
			})
			return
		}

		const data = await response.json()

		if (data.error) {
			toast({
				title: "Error",
				description: data.error,
				variant: "destructive",
			})
			return
		}

    // Assuming API returns { id: string, privacy: boolean }
    if (data.id !== undefined && data.privacy !== undefined) {
      const updatedFiles = mediaFiles.map((file) => {
        if (file.id === data.id) {
          // Manually update the privacy status
          return { 
            ...file,
            is_private: data.privacy // Update based on API response key
           };
        }
        return file
      })
      setMediaFiles(updatedFiles)

      // Also update details view if this file is currently open
      if (mediaDetails && mediaDetails.id === data.id) {
         setMediaDetails(prevDetails => prevDetails ? { 
           ...prevDetails, 
           is_private: data.privacy // Update based on API response key
          } : null);
      }

      toast({
        title: "Success",
        description: `File privacy updated to ${data.privacy ? "private" : "public"}`,
      })
    } else {
      // Fallback or error if API response format is unexpected
       console.error("Unexpected API response format after toggling privacy:", data);
       toast({
        title: "Error",
        description: "Failed to update file status due to unexpected server response.",
        variant: "destructive",
      })
    }
  }

	// this is for UI only
  const toggleFilePrivacy = (index: number) => {
    setCurrentUploads(prev => 
      prev.map((upload, i) => 
        i === index ? { ...upload, isPublic: !upload.isPublic } : upload
      )
    )
  }

	const startUpload = async () => {
			if (currentUploads.length === 0) return;

			setIsUploading(true); // Indicate overall upload process started

			// Helper function to upload a single file
			const uploadFile = (
				upload: (typeof currentUploads)[0],
				index: number
			): Promise<MediaFile | null> => {
				return new Promise((resolve, reject) => {
					setCurrentUploads((prev) =>
						prev.map((item, i) =>
							i === index ? { ...item, status: 'uploading', progress: 0 } : item
						)
					);

					const formData = new FormData();
					formData.append('files', upload.file); // Key must match API expectation
					formData.append('is_private', String(upload.isPublic === false)); // Send privacy flag for this file

					const xhr = new XMLHttpRequest();

					// --- Progress Tracking ---
					xhr.upload.onprogress = (event) => {
						if (event.lengthComputable) {
							const percentComplete = Math.round(
								(event.loaded / event.total) * 100
							);
							setCurrentUploads((prev) =>
								prev.map((item, i) =>
									i === index ? { ...item, progress: percentComplete } : item
								)
							);
						}
					};

					// --- Upload Completion ---
					xhr.onload = () => {
						if (xhr.status >= 200 && xhr.status < 300) {
							try {
								const response = JSON.parse(xhr.responseText);
								// Assuming API returns { files: [MediaFile] } with the uploaded file data
								const uploadedFile = response.files && response.files[0];
								if (uploadedFile) {
									setCurrentUploads((prev) =>
										prev.map((item, i) =>
											i === index
												? { ...item, status: 'complete', progress: 100 }
												: item
										)
									);
									resolve(uploadedFile); // Resolve with the actual file data from API
								} else {
									console.error(
										'API response missing uploaded file data:',
										response
									);
									setCurrentUploads((prev) =>
										prev.map((item, i) =>
											i === index
												? {
														...item,
														status: 'error',
														error: 'Invalid API response',
												  }
												: item
										)
									);
									reject(new Error('Invalid API response format'));
								}
							} catch (e) {
								console.error('Error parsing API response:', e);
								setCurrentUploads((prev) =>
									prev.map((item, i) =>
										i === index
											? {
													...item,
													status: 'error',
													error: 'Response parse error',
											  }
											: item
									)
								);
								reject(new Error('Failed to parse response'));
							}
						} else {
							console.error(
								'Upload failed with status:',
								xhr.status,
								xhr.statusText
							);
							const errorMsg = `Upload failed: ${xhr.statusText || xhr.status}`;
							setCurrentUploads((prev) =>
								prev.map((item, i) =>
									i === index
										? { ...item, status: 'error', error: errorMsg }
										: item
								)
							);
							reject(new Error(errorMsg));
						}
					};

					// --- Upload Error ---
					xhr.onerror = () => {
						console.error('Network error during upload');
						const errorMsg = 'Network error';
						setCurrentUploads((prev) =>
							prev.map((item, i) =>
								i === index
									? { ...item, status: 'error', error: errorMsg }
									: item
							)
						);
						reject(new Error(errorMsg));
					};

					// --- Send Request ---
					xhr.open('POST', '/api/media/upload', true);
					xhr.send(formData);
				});
			};

			// Process all uploads concurrently
			const uploadPromises = currentUploads.map((upload, index) =>
				uploadFile(upload, index).catch((error) => {
					console.error(`Failed to upload ${upload.file.name}:`, error);
					toast({
						title: `Upload Failed: ${upload.file.name}`,
						description:
							upload.error || error.message || 'An unknown error occurred.',
						variant: 'destructive',
					});
					return null; // Return null for failed uploads
				})
			);

			const results = await Promise.all(uploadPromises);
			const successfulUploads = results.filter(
				(result): result is MediaFile => result !== null
			);

			// Add successfully uploaded files (with data from API) to the main media list
			if (successfulUploads.length > 0) {
				setMediaFiles((prev) => [...successfulUploads, ...prev]);
			}

			// Check if all uploads are processed (completed or errored)
			const allProcessed = currentUploads.every(
				(u) => u.status === 'complete' || u.status === 'error'
			);

			if (allProcessed) {
				toast({
					title: 'Upload Process Finished',
					description: `${
						successfulUploads.length
					} file(s) uploaded successfully. ${
						currentUploads.length - successfulUploads.length
					} failed.`,
				});
				// Optionally close dialog after a short delay or immediately
				setTimeout(() => {
					setIsUploading(false);
					setCurrentUploads([]); // Clear the upload list
					// Consider closing the dialog: setIsUploadDialogOpen(false);
				}, 500); // Delay to allow user to see final status
			}
			else {
			  setIsUploading(false); // Re-enable button if something unexpected happened
			}
		};

  const uploadDialog = () => {
    return (
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              {currentUploads.length === 0 
                ? "Drag and drop files here or click to browse." 
                : "Set privacy for each file before uploading."}
            </DialogDescription>
          </DialogHeader>
          
          {currentUploads.length === 0 ? (
            <div
              className={`mt-4 rounded-lg border-2 border-dashed p-12 text-center border-border`}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const newUploads = Array.from(e.dataTransfer.files).map((file) => {
                    return {
                      file,
                      progress: 0,
                      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                      status: "pending" as const,
                      isPublic: uploadStatus === "public",
                    }
                  })
                  setCurrentUploads(newUploads)
                }
              }}
            >
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                  Choose files
                </Label>
                <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
                <p className="mt-2 text-sm text-muted-foreground">or drag and drop</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Support for images, videos, documents, and audio files.
                <br />
                Max file size: 10MB
              </p>
              
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="upload-status"
                    checked={uploadStatus === "public"}
                    onCheckedChange={(checked) => setUploadStatus(checked ? "public" : "private")}
                  />
                  <Label htmlFor="upload-status" className="flex items-center gap-1.5">
                    {uploadStatus === "public" ? (
                      <>
                        <Globe className="h-4 w-4 text-green-500" />
                        <span>Default: Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-amber-500" />
                        <span>Default: Private</span>
                      </>
                    )}
                  </Label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
              {currentUploads.map((upload, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="relative h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    {upload.preview ? (
                      <Image
                        src={upload.preview || "/placeholder.svg"}
                        alt={upload.file.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        {getFileIcon(upload.file.type.split('/')[0])}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{upload.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(upload.file.size / 1024).toFixed(0)} KB
                    </p>
                    
                    {upload.status === "uploading" && (
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={upload.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {upload.progress.toFixed(0)}%
                        </span>
                      </div>
                    )}
                    
                    {upload.status === "complete" && (
                      <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                        <CheckIcon className="h-3 w-3" /> Upload complete
                      </p>
                    )}
                  </div>
                  
                  {upload.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={upload.isPublic}
                          onCheckedChange={() => toggleFilePrivacy(index)}
                        />
                        <span className="text-xs whitespace-nowrap">
                          {upload.isPublic ? (
                            <span className="flex items-center text-green-500">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </span>
                          ) : (
                            <span className="flex items-center text-amber-500">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </span>
                          )}
                        </span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setCurrentUploads(prev => prev.filter((_, i) => i !== index))
                          if (upload.preview) URL.revokeObjectURL(upload.preview)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            {currentUploads.length > 0 ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentUploads([])
                    currentUploads.forEach(upload => {
                      if (upload.preview) URL.revokeObjectURL(upload.preview)
                    })
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={startUpload} 
                  disabled={isUploading || currentUploads.length === 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    `Upload ${currentUploads.length} file${currentUploads.length !== 1 ? 's' : ''}`
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsUploading(false)}>
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground">Manage your media files and assets.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-1" onClick={() => {
            setCurrentUploads([]) // Reset uploads
            setIsUploading(false)  // Reset upload state
            setUploadStatus("public") // Reset default privacy
            setIsUploadDialogOpen(true) // Open the correct dialog
          }}>
            <UploadCloud className="h-4 w-4" />
            <span>Upload</span>
          </Button>
          {uploadDialog()}
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
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchTerm("")}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:block">
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
                  <DropdownMenuItem onClick={() => setActiveTab("all")}>
                    {activeTab === "all" && <CheckIcon className="mr-2 h-4 w-4" />}
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("image")}>
                    {activeTab === "image" && <CheckIcon className="mr-2 h-4 w-4" />}
                    Images
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("document")}>
                    {activeTab === "document" && <CheckIcon className="mr-2 h-4 w-4" />}
                    Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("video")}>
                    {activeTab === "video" && <CheckIcon className="mr-2 h-4 w-4" />}
                    Videos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("audio")}>
                    {activeTab === "audio" && <CheckIcon className="mr-2 h-4 w-4" />}
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
                <Checkbox checked={selectedFiles.length === filteredMedia.length} onCheckedChange={handleSelectAll} />
                <span className="text-sm font-medium">
                  {selectedFiles.length} item{selectedFiles.length !== 1 ? "s" : ""} selected
                </span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedFiles)}>
                <Trash2 className="mr-2 h-3 w-3" />
                Delete Selected
              </Button>
            </div>
          )}

          {filteredMedia.length > 0 ? (
            <>
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
                      {file.is_private && (
                        <div className="absolute top-2 right-2 z-10 bg-background/90 rounded-full p-1">
                          <Lock className="h-3 w-3 text-amber-500" />
                        </div>
                      )}
                      {/* File preview */}
                      <div className="relative h-full w-full bg-muted flex items-center justify-center overflow-hidden">
                        {file.type === "image" ? (
                          <Image
                            src={file.url || "/placeholder.svg"}
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
                            onClick={() => copyToClipboard(file.url)}
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
                        <h3 className="text-sm font-medium truncate" title={file.name}>
                          {file.name}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setMediaDetails(file)}>View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
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
                          {file.is_private ? (
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
                            {file.is_private ? "Private" : "Public"}
                          </span>
                          <Switch
                            checked={!file.is_private}
                            onCheckedChange={() => toggleFileStatus(file.id)}
                          />
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {/* Load more indicator */}
              <div 
                ref={loadMoreRef} 
                className="w-full py-8 flex justify-center"
              >
                {isLoading && hasMore && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading more...</p>
                  </div>
                )}
                {!hasMore && mediaFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">No more files to load</p>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No media found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm ? "No results match your search" : "Upload some files to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media details dialog */}
      {mediaDetails && (
        <Dialog open={!!mediaDetails} onOpenChange={(open) => !open && setMediaDetails(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getFileIcon(mediaDetails.type)}
                <span className="truncate">{mediaDetails.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-3 aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {mediaDetails.type === "image" ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={mediaDetails.url || "/placeholder.svg"}
                      alt={mediaDetails.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    {getFileIcon(mediaDetails.type)}
                    <span className="text-sm font-medium">{mediaDetails.type.toUpperCase()} File</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
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
                    <div>{mediaDetails.uploaded_at}</div>

                    <div className="font-medium">Used in:</div>
                    <div>
                      {mediaDetails.used} place{mediaDetails.used !== 1 ? "s" : ""}
                    </div>
                    <div className="font-medium">Status:</div>
                    <div className="flex items-center gap-2">
                      {mediaDetails.is_private ? (
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
                        checked={!mediaDetails.is_private}
                        onCheckedChange={() => toggleFileStatus(mediaDetails.id)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">File URL</h4>
                  <div className="flex gap-1">
                    <Input value={mediaDetails.url || 'No public URL'} readOnly className="text-xs" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(mediaDetails.url)}
                      disabled={!mediaDetails.url}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => mediaDetails.url && window.open(mediaDetails.url, "_blank")}
                      disabled={!mediaDetails.url}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => mediaDetails.url && window.open(mediaDetails.url, "_blank")}
                      disabled={!mediaDetails.url}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDelete([mediaDetails.id])
                        setMediaDetails(null)
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
