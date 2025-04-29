"use client"

import Link from "next/link"
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Post } from "@/types/post"

interface PostActionsProps {
  post: Post
  onDelete: () => void
  onStatusChange: (postId: string, newStatus: 'published' | 'draft') => void
}

export function PostActions({ post, onDelete, onStatusChange }: PostActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/blog/${post.slug}`} target="_blank">
                <Eye className="h-4 w-4" />
                <span className="sr-only">View post</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View post</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/admin/posts/${post.id}/edit`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit post</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit post</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete post</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete post</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/blog/${post.slug}`} target="_blank">
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onStatusChange(post.id, post.status === 'published' ? 'draft' : 'published')}
          >
            {post.status === "published" ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={onDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
