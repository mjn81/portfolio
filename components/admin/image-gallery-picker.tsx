"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Check, ImageIcon, Search, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

// Mock data for media files - in a real app, this would come from your API
const mockMediaFiles = [
  {
    id: 1,
    name: "hero-image.jpg",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    size: "1.2 MB",
    dimensions: "1920x1080",
    uploadedAt: "2023-09-15",
  },
  {
    id: 2,
    name: "portfolio-photo.jpg",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    size: "843 KB",
    dimensions: "1600x900",
    uploadedAt: "2023-08-22",
  },
  {
    id: 6,
    name: "project-screenshot.png",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    size: "1.8 MB",
    dimensions: "2560x1440",
    uploadedAt: "2023-10-12",
  },
  {
    id: 8,
    name: "profile-picture.jpg",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    size: "942 KB",
    dimensions: "800x800",
    uploadedAt: "2023-08-03",
  },
  {
    id: 9,
    name: "blog-header.jpg",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    size: "1.5 MB",
    dimensions: "1200x630",
    uploadedAt: "2023-11-01",
  },
  {
    id: 10,
    name: "team-photo.jpg",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    size: "2.3 MB",
    dimensions: "2000x1333",
    uploadedAt: "2023-10-25",
  },
  {
    id: 11,
    name: "product-demo.jpg",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    size: "1.1 MB",
    dimensions: "1600x900",
    uploadedAt: "2023-09-18",
  },
  {
    id: 12,
    name: "office-space.jpg",
    type: "image",
    url: "/placeholder.svg?height=400&width=600",
    size: "1.7 MB",
    dimensions: "2400x1600",
    uploadedAt: "2023-07-30",
  },
]

interface ImageGalleryPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectImage: (imageUrl: string, altText: string) => void
}

export function ImageGalleryPicker({ open, onOpenChange, onSelectImage }: ImageGalleryPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("browse")
  const [altText, setAltText] = useState("")
  const [mediaFiles, setMediaFiles] = useState(mockMediaFiles)

  // Upload states
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentUploads, setCurrentUploads] = useState<
    {
      file: File
      progress: number
      preview?: string
      status: "pending" | "uploading" | "complete" | "error"
      error?: string
    }[]
  >([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter images based on search term
  const filteredImages = mediaFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleSelectImage = (id: number) => {
    setSelectedImageId(id)
    // Set default alt text based on image name
    const selectedImage = mediaFiles.find((img) => img.id === id)
    if (selectedImage) {
      // Remove file extension and replace dashes/underscores with spaces
      const nameWithoutExtension = selectedImage.name.replace(/\.[^/.]+$/, "")
      const formattedName = nameWithoutExtension.replace(/[-_]/g, " ")
      setAltText(formattedName)
    }
  }

  const handleInsertImage = () => {
    const selectedImage = mediaFiles.find((img) => img.id === selectedImageId)
    if (selectedImage) {
      onSelectImage(selectedImage.url, altText)
      onOpenChange(false)
      // Reset state
      setSelectedImageId(null)
      setSearchTerm("")
      setAltText("")
      setActiveTab("browse")
    }
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  // Process files for upload
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Convert FileList to array and filter for images
    const fileArray = Array.from(files).filter((file) => file.type.startsWith("image/"))

    if (fileArray.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select image files only (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file sizes (max 5MB per file)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const oversizedFiles = fileArray.filter((file) => file.size > MAX_SIZE)

    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: `${oversizedFiles.length} file(s) exceed the 5MB limit`,
        variant: "destructive",
      })
      return
    }

    // Create upload objects with previews
    const newUploads = fileArray.map((file) => {
      return {
        file,
        progress: 0,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      }
    })

    setCurrentUploads((prev) => [...prev, ...newUploads])
    simulateUpload(newUploads)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    processFiles(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Simulate file upload with progress
  const simulateUpload = (uploads: typeof currentUploads) => {
    setIsUploading(true)

    uploads.forEach((upload, index) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 10

        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          // Update upload status
          setCurrentUploads((prev) =>
            prev.map((item, i) =>
              item.file.name === upload.file.name ? { ...item, progress: 100, status: "complete" } : item,
            ),
          )

          // Add to media library after "upload" completes
          const newId = Math.max(...mediaFiles.map((file) => file.id)) + 1
          const newMediaFile = {
            id: newId,
            name: upload.file.name,
            type: "image",
            url: upload.preview || "/placeholder.svg",
            size: `${(upload.file.size / 1024).toFixed(0)} KB`,
            dimensions: "1200x800", // This would come from actual image in real app
            uploadedAt: new Date().toISOString().split("T")[0],
          }

          setMediaFiles((prev) => [newMediaFile, ...prev])

          // Check if all uploads are complete
          const allComplete = uploads.every((u, i) => {
            if (i === index) return true
            return u.status === "complete"
          })

          if (allComplete) {
            setIsUploading(false)
            toast({
              title: "Upload complete",
              description: `${uploads.length} image(s) uploaded successfully`,
            })

            // Switch to browse tab after upload completes
            setTimeout(() => {
              setActiveTab("browse")
              // Clear uploads after a delay
              setTimeout(() => {
                setCurrentUploads([])
              }, 2000)
            }, 1000)
          }
        } else {
          // Update progress
          setCurrentUploads((prev) =>
            prev.map((item, i) =>
              item.file.name === upload.file.name ? { ...item, progress, status: "uploading" } : item,
            ),
          )
        }
      }, 200)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="browse">Browse Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>

            {activeTab === "browse" && (
              <div className="flex flex-1 items-center gap-2 bg-muted rounded-md pl-2 ml-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
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
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <TabsContent value="browse" className="flex-1 mt-0">
              <ScrollArea className="h-[400px] pr-4">
                {filteredImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredImages.map((image) => (
                      <div
                        key={image.id}
                        className={`
                          relative aspect-square rounded-md overflow-hidden cursor-pointer border-2
                          ${selectedImageId === image.id ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted"}
                        `}
                        onClick={() => handleSelectImage(image.id)}
                      >
                        <Image src={image.url || "/placeholder.svg"} alt={image.name} fill className="object-cover" />
                        {selectedImageId === image.id && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-xs truncate">
                          {image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No images found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="upload" className="flex-1 mt-0">
              <div className="h-[400px] flex flex-col">
                <div
                  className={`
                    flex-1 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-6
                    ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                    ${isUploading ? "pointer-events-none" : "cursor-pointer"}
                  `}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  {currentUploads.length === 0 ? (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">Drag images here</h3>
                      <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                      <p className="text-xs text-muted-foreground text-center max-w-sm">
                        Supports: JPG, PNG, GIF, WebP • Max size: 5MB per image
                      </p>
                    </>
                  ) : (
                    <div className="w-full space-y-4">
                      <h3 className="text-lg font-medium text-center mb-4">
                        {isUploading ? "Uploading..." : "Upload Complete"}
                      </h3>

                      {currentUploads.map((upload, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                            {upload.preview ? (
                              <Image
                                src={upload.preview || "/placeholder.svg"}
                                alt={upload.file.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 m-auto text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{upload.file.name}</p>
                            <div className="flex items-center gap-2">
                              <Progress value={upload.progress} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {upload.progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          {upload.status === "complete" && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                      ))}

                      {!isUploading && (
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                        >
                          Upload More
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {selectedImageId && activeTab === "browse" && (
          <div className="mt-4 pt-4 border-t">
            <div className="mb-4">
              <label htmlFor="alt-text" className="block text-sm font-medium mb-1">
                Alt Text
              </label>
              <Input
                id="alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe this image"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add descriptive text to help with accessibility and SEO
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsertImage} disabled={!selectedImageId || activeTab !== "browse"}>
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
