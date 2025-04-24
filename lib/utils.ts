import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function checkReadTimeFormat(input: string): boolean {

  // Regular expression to match the format "X min read" or "X hours read"
  const regex = /^\d+\s(min|hours)\sread$/;

  // Test the input against the regex
  return regex.test(input);
}

export function generateSlug(title: string): string {
  // Convert the title to lowercase
  const lowerCaseTitle = title.toLowerCase();

  // Replace spaces with hyphens
  const slug = lowerCaseTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');

  // Remove any non-alphanumeric characters (except hyphens)
  return slug.replace(/[^a-z0-9-]/g, '');
}