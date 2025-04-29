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

export function generateSlug(str: string): string {
	return str
		.toLowerCase()
		.replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
		.replace(/[^ء-ي٠-٩\w\-]+/g, '') // Remove non-alphanumeric (incl. Arabic), non-hyphen chars
		.replace(/\-\-+/g, '-') // Replace multiple hyphens with single
		.replace(/^-+/, '') // Trim hyphens from start
		.replace(/-+$/, ''); // Trim hyphens from end
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}