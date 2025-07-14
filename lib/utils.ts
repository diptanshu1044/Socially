import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to render emojis properly in text
export function renderEmojis(text: string) {
  // This function ensures emojis are rendered properly
  // The browser handles emoji rendering automatically, but we can add custom styling if needed
  return text;
}
