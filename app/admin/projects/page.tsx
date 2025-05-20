'use client'

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, ExternalLink, Search, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Project } from '@/types/project';
import { Tag } from '@/types/tag';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { DebounceInput } from 'react-debounce-input';

// Function to fetch projects from the API
async function fetchProjects(searchTerm: string = '', sortBy: string = 'created_at', sortOrder: string = 'desc'): Promise<Project[]> {
  // In a real app, you'd pass searchTerm, sortBy, sortOrder to the API
  // For now, the API GET /api/projects handles basic sorting and filtering
  const response = await fetch(`/api/projects?query=${encodeURIComponent(searchTerm)}&sort=${sortBy}&order=${sortOrder}`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

// Function to delete a project
async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete project');
  }
}

interface SortConfig {
  key: keyof Project | 'tagCount';
  direction: 'ascending' | 'descending';
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'created_at', direction: 'descending' });
  const { toast } = useToast();

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const sortKey = sortConfig?.key || 'created_at';
      const sortDirection = sortConfig?.direction === 'ascending' ? 'asc' : 'desc';
      const data = await fetchProjects(searchTerm, String(sortKey), sortDirection);
      setProjects(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching projects',
        description: error instanceof Error ? error.message : 'Could not load projects.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [searchTerm, toast, sortConfig]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.id);
        toast({ title: 'Project deleted', description: `'${projectToDelete.title}' has been deleted.` });
        loadProjects(); // Refresh the list
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error deleting project',
          description: error instanceof Error ? error.message : 'Could not delete project.',
          variant: 'destructive',
        });
      }
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    }
  };

  const requestSort = (key: keyof Project | 'tagCount') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Project | 'tagCount') => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const getStatusBadgeVariant = (status?: 'draft' | 'published' | 'archived') => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Projects</h1>
        <Link href="/admin/projects/new">
          <Button variant="default">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Project
          </Button>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-6 bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-border"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <DebounceInput
            minLength={2}
            debounceTimeout={300}
            element={Input}
            placeholder="Search projects by title..."
            className="w-full pl-10 pr-4 py-2 text-base bg-background border-border focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : projects.length === 0 && searchTerm ? (
          <div className="text-center py-10 bg-card rounded-lg shadow-sm border border-border">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="mt-2 text-xl font-semibold text-foreground">No Projects Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Your search for "{searchTerm}" did not match any projects.</p>
            <Button variant="outline" className="mt-4" onClick={() => setSearchTerm('')}>Clear Search</Button>
          </div>
        ) : projects.length === 0 ? (
           <div className="text-center py-10 bg-card rounded-lg shadow-sm border border-border">
             <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="mt-2 text-xl font-semibold text-foreground">No Projects Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first project.</p>
            <Link href="/admin/projects/new">
              <Button className="mt-4">Add New Project</Button>
            </Link>
          </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3, duration: 0.5 }}
          className="overflow-x-auto bg-card rounded-lg shadow-sm border border-border"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
                <TableHead onClick={() => requestSort('title')} className="cursor-pointer hover:bg-muted/50">
                  Title {getSortIndicator('title')}
                </TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead onClick={() => requestSort('status')} className="cursor-pointer hover:bg-muted/50 hidden lg:table-cell">
                  Status {getSortIndicator('status')}
                </TableHead>
                <TableHead onClick={() => requestSort('tagCount')} className="cursor-pointer hover:bg-muted/50 hidden lg:table-cell">
                  Tags {getSortIndicator('tagCount')}
                </TableHead>
                <TableHead onClick={() => requestSort('featured')} className="cursor-pointer hover:bg-muted/50 hidden lg:table-cell">
                  Featured {getSortIndicator('featured')}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {projects.map((project) => (
                  <motion.tr 
                    key={project.id} 
                    layout 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="hidden sm:table-cell p-2 align-top">
                      {project.image_url ? (
                        <Image 
                          src={project.image_url} 
                          alt={project.image_alt_text || project.title} 
                          width={64} 
                          height={48} 
                          className="rounded object-cover aspect-[4/3]"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-foreground align-top py-3 px-4">
                      {project.title}
                      <div className="text-xs text-muted-foreground mt-1 hidden md:block lg:hidden">
                        {project.status ? <Badge variant={getStatusBadgeVariant(project.status)} className="mr-2">{project.status}</Badge> : null}
                        {project.tags?.length > 0 && <Badge variant="secondary">{project.tags.length} tags</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground align-top py-3 px-4 hidden md:table-cell max-w-xs truncate">
                      {project.description}
                    </TableCell>
                    <TableCell className="align-top py-3 px-4 hidden lg:table-cell">
                      {project.status ? <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge> : 'N/A'}
                    </TableCell>
                    <TableCell className="align-top py-3 px-4 hidden lg:table-cell">
                      {project.tags?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0,2).map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                          {project.tags.length > 2 && <Badge variant="outline">+{project.tags.length - 2}</Badge>}
                        </div>
                      ) : '-'}
                    </TableCell>
                     <TableCell className="align-top py-3 px-4 hidden lg:table-cell">
                        {project.featured ? <Eye className="h-5 w-5 text-green-500" /> : <EyeOff className="h-5 w-5 text-muted-foreground"/>}
                    </TableCell>
                    <TableCell className="text-right align-top py-3 px-4">
                      <div className="flex justify-end items-center space-x-2">
                        {project.demo_link && (
                            <Button variant="ghost" size="icon" asChild title="View Demo">
                                <a href={project.demo_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 text-blue-500" />
                                </a>
                            </Button>
                        )}
                        <Link href={`/admin/projects/edit/${project.id}`} passHref>
                          <Button variant="ghost" size="icon" title="Edit Project">
                            <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(project)} title="Delete Project">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </motion.div>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              <strong className="mx-1">{projectToDelete?.title}</strong> 
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 