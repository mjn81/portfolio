'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectSchemaType } from '@/lib/validation/project-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Project } from '@/types/project';
import { ImageGalleryPicker } from '@/components/admin/image-gallery-picker';
import { ArrowLeft, Loader2, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { MultiSelect } from '@/components/ui/multi-select'; 
import Image from 'next/image';

async function fetchProject(id: string): Promise<Project | null> {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch project details');
  }
  return response.json();
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const projectId = params.projectId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProject, setIsFetchingProject] = useState(true);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');

  const form = useForm<ProjectSchemaType>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      tags: [],
      featured: false,
      sort_order: 0,
      image_url: null,
      image_alt_text: '',
      demo_link: '',
      github_link: '',
    },
  });

  const loadProjectData = useCallback(async () => {
    if (!projectId) return;
    setIsFetchingProject(true);
    try {
      const projectData = await fetchProject(projectId);
      
      if (projectData) {
        form.reset({
          title: projectData.title,
          description: projectData.description,
          status: projectData.status || 'draft',
          tags: Array.isArray(projectData.tags) ? projectData.tags : [],
          featured: projectData.featured || false,
          sort_order: projectData.sort_order || 0,
          image_url: projectData.image_url || null,
          image_alt_text: projectData.image_alt_text || '',
          demo_link: projectData.demo_link || '',
          github_link: projectData.github_link || '',
        });
        setSelectedImageUrl(projectData.image_url || null);
        setSelectedImageAlt(projectData.image_alt_text || '');
      } else {
        toast({ title: 'Project not found', variant: 'destructive' });
        router.replace('/admin/projects');
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      toast({ title: 'Error loading data', description: (error as Error).message, variant: 'destructive' });
    }
    setIsFetchingProject(false);
  }, [projectId, form, toast, router]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  useEffect(() => {
    form.setValue('image_url', selectedImageUrl);
  }, [selectedImageUrl, form]);

  useEffect(() => {
    form.setValue('image_alt_text', selectedImageAlt);
  }, [selectedImageAlt, form]);

  const onSubmit: SubmitHandler<ProjectSchemaType> = async (data) => {
    setIsLoading(true);
    const submissionData = { 
      ...data,
      tags: data.tags || [],
    };

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.error || 'Failed to update project');
      }

      toast({ title: 'Project Updated', description: 'Project details have been saved.' });
      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      console.error('Update project error:', error);
      toast({ 
        title: 'Error updating project', 
        description: (error as Error).message, 
        variant: 'destructive' 
      });
    }
    setIsLoading(false);
  };
  
  const handleImageSelectFromPicker = (imageUrl: string, altText: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageAlt(altText || form.getValues('title'));
    setIsImagePickerOpen(false);
  };
  
  if (isFetchingProject) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Edit Project: {form.getValues('title')}</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register('title')} className="mt-1" />
          {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register('description')} className="mt-1" rows={6} />
          {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
        </div>
        
        <div>
          <Label>Project Image</Label>
          <div className="mt-2 flex flex-col items-start gap-4">
            <Button type="button" variant="outline" onClick={() => setIsImagePickerOpen(true)}>
              <ImageIcon className="mr-2 h-4 w-4" /> 
              {selectedImageUrl ? 'Change Image' : 'Select Image from Gallery'}
            </Button>
            {selectedImageUrl && (
              <div className="p-2 border rounded-md w-full">
                <Label className="text-xs text-muted-foreground">Image Preview & Alt Text</Label>
                <div className="mt-1 flex flex-col sm:flex-row gap-4 items-start">
                  <Image src={selectedImageUrl} alt={selectedImageAlt || "Selected image preview"} width={120} height={90} className="rounded object-cover aspect-[4/3]" />
                  <div className="flex-grow">
                    <Input 
                      id="image_alt_text"
                      placeholder="Enter alt text for the image"
                      value={selectedImageAlt}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedImageAlt(e.target.value)}
                      className="w-full"
                    />
                     {form.formState.errors.image_alt_text && <p className="text-sm text-destructive mt-1">{form.formState.errors.image_alt_text.message}</p>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Selected URL: {selectedImageUrl}</p>
              </div>
            )}
             {form.formState.errors.image_url && !selectedImageUrl && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.image_url.message}</p>
            )}
          </div>
        </div>
        
        <ImageGalleryPicker 
          open={isImagePickerOpen}
          onOpenChange={setIsImagePickerOpen}
          onSelectImage={handleImageSelectFromPicker}
        />

        <div>
          <Label htmlFor="tags">Tags (Enter comma-separated or use a supporting MultiSelect)</Label>
          <Controller
            name="tags"
            control={form.control}
            render={({ field }) => (
              <MultiSelect
                options={[]}
                selected={field.value || []}
                onChange={(selectedValues: string[]) => {
                  field.onChange(selectedValues);
                }}
                placeholder="Enter tags..."
                className="mt-1"
                creatable
              />
            )}
          />
          {form.formState.errors.tags && <p className="text-sm text-destructive mt-1">{(form.formState.errors.tags as any).message || (form.formState.errors.tags as any)?.map?.((e:any) => e.message).join(', ')}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="demo_link">Demo Link (Optional)</Label>
            <Input id="demo_link" {...form.register('demo_link')} className="mt-1" placeholder="https://example.com/demo" />
            {form.formState.errors.demo_link && <p className="text-sm text-destructive mt-1">{form.formState.errors.demo_link.message}</p>}
          </div>
          <div>
            <Label htmlFor="github_link">GitHub Link (Optional)</Label>
            <Input id="github_link" {...form.register('github_link')} className="mt-1" placeholder="https://github.com/user/repo" />
            {form.formState.errors.github_link && <p className="text-sm text-destructive mt-1">{form.formState.errors.github_link.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.status && <p className="text-sm text-destructive mt-1">{form.formState.errors.status.message}</p>}
          </div>
          <div>
             <Label htmlFor="sort_order">Sort Order (Optional)</Label>
            <Input id="sort_order" type="number" {...form.register('sort_order', { valueAsNumber: true })} className="mt-1" placeholder="0" />
            {form.formState.errors.sort_order && <p className="text-sm text-destructive mt-1">{form.formState.errors.sort_order.message}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
            <Controller
                name="featured"
                control={form.control}
                render={({ field }) => (
                    <Checkbox 
                        id="featured" 
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange} 
                    />
                )}
            />
            <Label htmlFor="featured" className="font-normal">
                Mark as featured project
            </Label>
            {form.formState.errors.featured && <p className="text-sm text-destructive mt-1">{form.formState.errors.featured.message}</p>}
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/projects')} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isFetchingProject} className="min-w-[100px]">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 