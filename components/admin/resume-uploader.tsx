'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileText, X, Loader2, Check, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ResumeUploaderProps {
  // Props if needed in the future
}

interface UploadedFile {
  file: File;
  progress: number;
  preview?: string; // Not really used for PDF, but structure can be kept
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  id?: string;
  url?: string;
}

export function ResumeUploader({}: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<UploadedFile | null>(null);
  const [currentResumeUrl, setCurrentResumeUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCurrentResumeUrl = useCallback(async () => {
    setIsLoadingUrl(true);
    try {
      const response = await fetch('/api/settings/resume');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch current resume URL');
      }
      const data = await response.json();
      setCurrentResumeUrl(data.resumeUrl || null);
    } catch (error: any) {
      console.error('Error fetching resume URL:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not load current resume URL.',
        variant: 'destructive',
      });
      setCurrentResumeUrl(null); // Ensure it's null on error
    } finally {
      setIsLoadingUrl(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentResumeUrl();
  }, [fetchCurrentResumeUrl]);

  const updateResumeSettings = async (resumeUrl: string | null) => {
    setIsUpdatingSettings(true);
    try {
      const response = await fetch('/api/settings/resume', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeUrl }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update resume URL in settings.');
      }
      const data = await response.json();
      setCurrentResumeUrl(data.resumeUrl);
      toast({
        title: resumeUrl ? 'Resume Updated' : 'Resume Removed',
        description: resumeUrl ? 'Your new resume has been set.' : 'Your resume has been removed.',
      });
      setUploadFile(null); // Clear upload state after successful update
    } catch (error: any) {
      console.error('Error updating resume settings:', error);
      toast({
        title: 'Settings Update Failed',
        description: error.message || 'Could not update resume URL.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

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

  const processAndPrepareFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file for your resume.',
        variant: 'destructive',
      });
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit for resume
    if (file.size > MAX_SIZE) {
      toast({
        title: 'File Too Large',
        description: `The resume file exceeds the 5MB limit.`,
        variant: 'destructive',
      });
      return;
    }

    setUploadFile({
      file,
      progress: 0,
      status: 'pending',
    });
    handleUpload({ file, progress: 0, status: 'pending' });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processAndPrepareFile(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processAndPrepareFile(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (fileToUpload: UploadedFile) => {
    if (!fileToUpload) return;

    setIsUploading(true);
    setUploadFile(prev => prev ? { ...prev, status: 'uploading' } : null);

    const formData = new FormData();
    formData.append('files', fileToUpload.file);
    formData.append('is_private', 'false'); // Resume should be public

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        // If your API needs progress, you'd implement XHR, but fetch API doesn't directly support it.
        // For simplicity, we'll simulate progress or just show uploading state.
      });

      const result = await response.json();

      if (!response.ok || result.files?.length === 0) {
        throw new Error(result.error || 'Resume upload failed');
      }

      const uploadedMediaFile = result.files[0];

      setUploadFile(prev => prev ? {
        ...prev,
        progress: 100,
        status: 'complete',
        id: uploadedMediaFile.id,
        url: uploadedMediaFile.url,
      } : null);
      
      // After successful upload, update the settings
      await updateResumeSettings(uploadedMediaFile.url);

    } catch (error: any) {
      console.error('Upload error for:', fileToUpload.file.name, error);
      setUploadFile(prev => prev ? {
        ...prev,
        status: 'error',
        error: error.message || 'Upload failed'
      } : null);
      toast({
        title: 'Upload Failed',
        description: error.message || `Could not upload ${fileToUpload.file.name}.`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    if (!currentResumeUrl) return;
    await updateResumeSettings(null); // Pass null to indicate removal
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Resume</CardTitle>
        <CardDescription>
          Upload your resume in PDF format. This will be publicly accessible via a direct link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingUrl && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading current resume status...</span>
          </div>
        )}

        {!isLoadingUrl && currentResumeUrl && (
          <Alert variant="default">
            <FileText className="h-4 w-4" />
            <AlertTitle>Current Resume</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Your resume is currently set.</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View
                  </a>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleRemoveResume} disabled={isUpdatingSettings || isUploading}>
                  {isUpdatingSettings && currentResumeUrl ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />} 
                  Remove
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoadingUrl && !currentResumeUrl && !uploadFile && (
            <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Resume Set</AlertTitle>
                <AlertDescription>
                You have not uploaded a resume yet. Upload one below.
                </AlertDescription>
            </Alert>
        )}

        {/* Upload Area */} 
        {(!currentResumeUrl || uploadFile) && (
          <div
            className={`
              rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-8 text-center 
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading || isUpdatingSettings ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !(isUploading || isUpdatingSettings) && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isUploading || isUpdatingSettings}
            />

            {!uploadFile ? (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">
                  {isUploading ? 'Uploading...' : (currentResumeUrl ? 'Upload New Resume (PDF)' : 'Upload Resume (PDF)')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Max size: 5MB
                </p>
              </>
            ) : (
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30 w-full">
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="h-1.5 mt-1" />
                    )}
                    {uploadFile.status === 'pending' && (
                      <p className="text-xs text-muted-foreground mt-1">Pending upload...</p>
                    )}
                    {uploadFile.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1 truncate" title={uploadFile.error}>Error: {uploadFile.error}</p>
                    )}
                    {uploadFile.status === 'complete' && !isUpdatingSettings && (
                        <p className="text-xs text-green-600 mt-1">Uploaded. Saving link...</p>
                    )}
                    {uploadFile.status === 'complete' && isUpdatingSettings && (
                        <p className="text-xs text-blue-600 mt-1">Saving link to settings...</p>
                    )}
                  </div>
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                  )}
                  {uploadFile.status === 'complete' && (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                   {uploadFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  {(uploadFile.status === 'pending' || uploadFile.status === 'error') && !isUploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFile(null);
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {uploadFile?.status === 'error' && (
             <Button variant="outline" onClick={() => uploadFile && handleUpload(uploadFile)} disabled={isUploading || uploadFile.status !== 'error'}>
                Retry Upload
            </Button>
        )}
      </CardContent>
    </Card>
  );
} 